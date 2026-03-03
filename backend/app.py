import torch
torch.set_grad_enabled(False)

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import sqlite3
import torch
import os
import uuid
import json

# ==============================
# LOAD ENV VARIABLES
# ==============================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
DATABASE = os.getenv("DATABASE", "database.db")

MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]

if not SECRET_KEY:
    raise ValueError("SECRET_KEY not set in .env file")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In Production, replace "*" with ["http://your-frontend-domain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ==============================
# DATABASE
# ==============================

def get_connection():
    return sqlite3.connect(DATABASE, check_same_thread=False)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            filename TEXT,
            image_type TEXT,
            authenticity_confidence REAL,
            timestamp TEXT,
            image_path TEXT
        )
    """)

    # Simple migration: Add image_path if it doesn't exist
    try:
        cursor.execute("ALTER TABLE detections ADD COLUMN image_path TEXT")
    except sqlite3.OperationalError:
        pass # Already exists

    conn.commit()
    conn.close()

@app.on_event("startup")
def startup():
    init_db()

# ==============================
# LOAD AI MODEL
# ==============================

device = "cuda" if torch.cuda.is_available() else "cpu"

processor = AutoImageProcessor.from_pretrained("umm-maybe/AI-image-detector")
model = AutoModelForImageClassification.from_pretrained("umm-maybe/AI-image-detector")

model.to(device)
model.eval()

# ==============================
# AUTH HELPERS
# ==============================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(username: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT username, password FROM users WHERE username=?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"username": row[0], "password": row[1]}
    return None

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")

        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = get_user(username)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return username

    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

# ==============================
# AUTHENTICITY DETECTION
# ==============================

def detect_authenticity(image_path: str):

    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=1)

    confidence, predicted = torch.max(probabilities, dim=1)
    label = model.config.id2label[predicted.item()]

    return {
        "image_type": label,
        "authenticity_confidence": round(confidence.item(), 2)
    }

# ==============================
# ROUTES
# ==============================

@app.get("/")
def root():
    return {"message": "AI Generated vs Real Image Detection Backend Running"}

@app.post("/signup")
def signup(username: str = Form(...), password: str = Form(...)):
    if get_user(username):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(password)

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed))
    conn.commit()
    conn.close()

    return {"message": "User created successfully"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)

    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": form_data.username})

    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/detect")
async def detect_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user),
):

    extension = file.filename.split(".")[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG, JPEG, PNG allowed")

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    os.makedirs("uploads", exist_ok=True)

    unique_name = f"{uuid.uuid4()}.{extension}"
    file_path = f"uploads/{unique_name}"

    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    try:
        result = detect_authenticity(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

    record = {
        "filename": file.filename,
        "image_type": result["image_type"],
        "authenticity_confidence": result["authenticity_confidence"],
        "timestamp": datetime.utcnow().isoformat(),
        "image_path": unique_name
    }

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO detections (
            username,
            filename,
            image_type,
            authenticity_confidence,
            timestamp,
            image_path
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        current_user,
        record["filename"],
        record["image_type"],
        record["authenticity_confidence"],
        record["timestamp"],
        record["image_path"]
    ))

    conn.commit()
    conn.close()

    return record

@app.get("/history")
def get_history(current_user: str = Depends(get_current_user)):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT filename, image_type, authenticity_confidence, timestamp, image_path
        FROM detections
        WHERE username=?
        ORDER BY id DESC
    """, (current_user,))

    rows = cursor.fetchall()
    conn.close()

    history = []

    for row in rows:
        history.append({
            "filename": row[0],
            "image_type": row[1],
            "authenticity_confidence": row[2],
            "timestamp": row[3],
            "image_path": row[4]
        })

    return history