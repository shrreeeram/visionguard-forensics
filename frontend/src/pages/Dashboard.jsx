import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Zap, History, LogOut, LayoutDashboard,
    Terminal, Activity, Bell, Settings, Plus, Info,
    TrendingUp, Search, Clock, Fingerprint, LucideShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UploadBox from '../components/UploadBox';
import HistoryCard from '../components/HistoryCard';
import ResultCard from '../components/ResultCard';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('detect'); // 'detect', 'history'

    const fetchHistory = useCallback(async () => {
        try {
            const response = await api.get('/history');
            setHistory(response.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDetect = async () => {
        if (!file) return;

        setIsLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/detect', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log("API Result:", response.data);
            setResult(response.data);
            fetchHistory(); // Refresh history
            setActiveTab('detect');
        } catch (err) {
            alert(err.response?.data?.detail || "Detection failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="flex h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-800/60 bg-slate-950/40 backdrop-blur-3xl flex flex-col p-8 z-50">
                <div className="flex items-center gap-4 mb-14 px-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-600/40">
                        <Shield className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tighter">VISIONGUARD</h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Tactical AI</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {[
                        { id: 'detect', label: 'Detection Lab', icon: LayoutDashboard },
                        { id: 'history', label: 'Archival Logs', icon: History },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300
                ${activeTab === item.id
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'}
               `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-slate-800/60">
                    <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <Fingerprint size={16} className="text-indigo-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Operator</p>
                                <p className="text-xs font-black text-white truncate">{user}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 rounded-xl border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-400 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={12} />
                            Terminate Session
                        </button>
                    </div>
                    <p className="text-[9px] font-black text-slate-600 text-center uppercase tracking-widest">v2.4.1 SECURE</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-slate-800/60 flex items-center justify-between px-10 backdrop-blur-2xl bg-slate-950/20 sticky top-0 z-40">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl cursor-default">
                            <div className="bg-indigo-600/10 p-1.5 rounded-lg border border-indigo-500/20">
                                <Terminal className="text-indigo-400" size={14} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Protocol Active</span>
                        </div>
                        <div className="h-4 w-px bg-slate-800/60" />
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inference Hub Ready</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-indigo-400 transition-all relative group">
                            <Bell size={18} />
                            <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-slate-900" />
                        </button>
                        <button className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-indigo-400 transition-all">
                            <Settings size={18} />
                        </button>
                    </div>
                </header>

                {/* Scrollable ViewPort */}
                <div className="flex-1 overflow-y-auto p-12 no-scrollbar scroll-smooth">
                    <AnimatePresence mode="wait">
                        {activeTab === 'detect' && (
                            <motion.div
                                key="detect"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-6xl mx-auto space-y-12"
                            >
                                {/* Section Header */}
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Detection Lab</h2>
                                    <p className="text-slate-500 font-medium text-sm tracking-widest uppercase flex items-center gap-3">
                                        <Zap size={14} className="text-indigo-500" />
                                        Autonomous AI Origin Assessment Platform
                                    </p>
                                </div>

                                {/* Main Action Grid */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
                                    {/* Upload Area */}
                                    <div className="space-y-8">
                                        <UploadBox onFileSelect={setFile} isLoading={isLoading} />
                                        <button
                                            onClick={handleDetect}
                                            disabled={!file || isLoading}
                                            className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[0.3em] text-[11px] transition-all flex items-center justify-center gap-4 shadow-2xl
                         ${!file || isLoading
                                                    ? 'bg-slate-800 text-slate-600 border border-slate-700 opacity-50 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white shadow-indigo-600/40 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95'}
                       `}
                                        >
                                            <Zap size={18} className={isLoading ? 'animate-pulse' : ''} />
                                            {isLoading ? 'Processing Signal...' : 'Initiate Verification'}
                                        </button>
                                    </div>

                                    {/* Quick Stats & Result Container */}
                                    <div className="space-y-10">
                                        <AnimatePresence mode="wait">
                                            {result ? (
                                                <ResultCard result={result} />
                                            ) : (
                                                <div className="h-full bg-slate-900/40 border border-slate-800/60 rounded-[50px] p-12 flex flex-col items-center justify-center text-center opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                                    <div className="w-24 h-24 bg-slate-800 rounded-[40px] flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-700 border border-slate-700">
                                                        <LucideShieldAlert size={40} className="text-slate-600" />
                                                    </div>
                                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Awaiting Telemetry</h3>
                                                    <p className="text-xs font-medium text-slate-500 max-w-[240px] leading-relaxed uppercase tracking-widest">
                                                        Synchronize an image asset to initiate the AI authenticity grading sequence.
                                                    </p>
                                                </div>
                                            )}
                                        </AnimatePresence>

                                        {/* Mini Metrics */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[40px] hover:border-indigo-500/20 transition-all">
                                                <Activity size={24} className="text-cyan-500 mb-4" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Inference Pulse</p>
                                                <p className="text-3xl font-black text-white tabular-nums tracking-tighter">1.2s</p>
                                            </div>
                                            <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[40px] hover:border-indigo-500/20 transition-all">
                                                <TrendingUp size={24} className="text-emerald-500 mb-4" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
                                                <p className="text-3xl font-black text-white tabular-nums tracking-tighter">99.8%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-4xl mx-auto space-y-10"
                            >
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Archival Logs</h2>
                                        <p className="text-slate-500 font-medium text-sm tracking-widest uppercase flex items-center gap-3">
                                            <History size={14} className="text-indigo-500" />
                                            Historical verification sessions and telemetry records
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 p-2.5 rounded-2xl">
                                        <History className="text-indigo-500/60" size={14} />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{history.length} Entries</span>
                                    </div>
                                </div>

                                {/* Statistics Dashboard */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total Uploads', value: history.length, icon: Activity, color: 'text-indigo-400' },
                                        { label: 'AI Generated', value: history.filter(i => i.image_type === 'artificial').length, icon: Zap, color: 'text-red-400' },
                                        { label: 'Human Verified', value: history.filter(i => i.image_type === 'human').length, icon: Shield, color: 'text-emerald-400' },
                                        {
                                            label: 'Avg Confidence',
                                            value: `${history.length > 0
                                                ? Math.round((history.reduce((a, b) => a + b.authenticity_confidence, 0) / history.length) * 100)
                                                : 0}%`,
                                            icon: TrendingUp,
                                            color: 'text-cyan-400'
                                        },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-3xl hover:border-indigo-500/20 transition-all group">
                                            <div className="flex items-center justify-between mb-3">
                                                <stat.icon size={16} className={stat.color} />
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors" />
                                            </div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                            <p className="text-xl font-black text-white tabular-nums">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {history.length > 0 ? (
                                        history.map((item, index) => (
                                            <HistoryCard key={index} item={item} />
                                        ))
                                    ) : (
                                        <div className="py-32 text-center opacity-30">
                                            <Clock size={48} className="mx-auto mb-6" />
                                            <p className="text-sm font-black uppercase tracking-widest">No archival data found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Status Bar */}
                <footer className="h-10 border-t border-slate-800/40 bg-slate-950/40 backdrop-blur-3xl flex items-center justify-between px-10 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                            Secure Socket: Enc-TLS-V3
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            Node Resilience: Nominal
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span>Station: SHREE-PRO-NODE-01</span>
                        <span className="text-indigo-500/60">Last Sync: {new Date().toLocaleTimeString()}</span>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default Dashboard;
