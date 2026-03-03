import React from 'react';
import { Calendar, Clock, Shield, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

import api from '../services/api';

const HistoryCard = ({ item }) => {
    const isAI = item.image_type === 'artificial';
    const isUncertain = item.authenticity_confidence < 0.6;
    const confidence = Math.round(item.authenticity_confidence * 100);
    const baseURL = api.defaults.baseURL || "http://localhost:8000";
    const imageUrl = item.image_path ? `${baseURL}/uploads/${item.image_path}` : null;

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative bg-slate-900/40 border p-5 rounded-[32px] hover:bg-slate-900/80 transition-all duration-500 shadow-xl overflow-hidden
                ${isUncertain ? 'border-yellow-500/20' : 'border-slate-800/60'}
            `}
        >
            <div className="flex items-center gap-6">
                {/* Image Preview (The "Big Move") */}
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-700/50 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <FileText className="text-slate-600" size={24} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-sm font-black text-white truncate max-w-[150px] uppercase tracking-tighter">{item.filename}</h4>
                        <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${isUncertain
                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                : isAI
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            }`}>
                            {isUncertain ? '🟡 UNCERTAIN' : item.image_type === 'artificial' ? 'ARTIFICIAL' : 'HUMAN'}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={12} className="text-indigo-500/60" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{formatDate(item.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Clock size={12} className="text-indigo-500/60" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{formatTime(item.timestamp)}</span>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                    <p className={`text-2xl font-black tabular-nums tracking-tighter ${isAI ? 'text-red-400' : 'text-emerald-400'}`}>
                        {confidence}%
                    </p>
                </div>

                <div className="ml-4 p-2 bg-slate-800/50 rounded-xl text-slate-600 group-hover:text-indigo-400 transition-colors">
                    <ChevronRight size={18} />
                </div>
            </div>
        </motion.div>
    );
};

export default HistoryCard;
