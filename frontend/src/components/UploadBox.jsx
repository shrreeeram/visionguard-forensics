import React, { useState, useCallback } from 'react';
import { Upload, X, FileImage, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadBox = ({ onFileSelect, isLoading }) => {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPreview(URL.createObjectURL(file));
            onFileSelect(file);
        }
    };

    const clearFile = () => {
        setPreview(null);
        onFileSelect(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                className={`relative group h-80 rounded-[40px] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center overflow-hidden
          ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-900/40 hover:border-indigo-500/50 hover:bg-slate-900/60'}
          ${preview ? 'border-solid border-indigo-500/30' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <AnimatePresence mode="wait">
                    {!preview ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center text-center p-8"
                        >
                            <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-indigo-500/20">
                                <Upload className="text-indigo-400 w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Secure Ingest Portal</h3>
                            <p className="text-slate-500 text-sm font-medium mb-8 max-w-xs">
                                Drag & drop your security assets here or <span className="text-indigo-400 cursor-pointer hover:underline">browse local storage</span>
                            </p>

                            <div className="flex gap-6">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span>JPG/PNG/JPEG</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                    <Zap size={14} className="text-cyan-500" />
                                    <span>Max 5MB</span>
                                </div>
                            </div>

                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handleChange}
                                accept="image/*"
                                disabled={isLoading}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative w-full h-full flex items-center justify-center p-4 bg-slate-950/20"
                        >
                            <img
                                src={preview}
                                alt="Upload Preview"
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                            />
                            <button
                                onClick={clearFile}
                                className="absolute top-6 right-6 p-3 bg-slate-900/80 border border-slate-700 text-white rounded-2xl hover:bg-red-500 hover:border-red-400 transition-all shadow-xl backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>

                            <div className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl backdrop-blur-md flex items-center gap-2">
                                <FileImage size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Asset Locked</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="text-indigo-500 w-8 h-8 animate-pulse" />
                            </div>
                        </div>
                        <p className="mt-6 text-[11px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Running Neural Inference...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadBox;
