import React from 'react';
import { motion } from 'framer-motion';

const ResultCard = ({ result }) => {
    if (!result) return null;

    // Debugging
    console.log("API Result:", result);

    // EXACT STRING MATCHING AS PER BACKEND SPEC (human / artificial)
    const isAI = result.image_type === "artificial";
    const isReal = result.image_type === "human";
    const isUncertain = result.authenticity_confidence < 0.6;
    const confidencePercent = Math.round(result.authenticity_confidence * 100);

    // Dynamic Explanation
    let explanation = "";
    if (isUncertain) {
        explanation = "The system detect anomalies but cannot confirm authenticity with high confidence. Technical telemetry is inconclusive.";
    } else if (isAI) {
        explanation = "This image shows patterns consistent with AI-generated synthetic media. Micro-traces of diffusion patterns were detected.";
    } else {
        explanation = "This image appears to be captured from a real-world source. No indicators of generative algorithmic manipulation were found.";
    }

    // Theme Selector
    const getThemeClasses = () => {
        if (isUncertain) return 'border-yellow-500/20 bg-yellow-500/5';
        if (isAI) return 'border-red-500/20 bg-red-500/5';
        return 'border-emerald-500/20 bg-emerald-500/5';
    };

    const getBadgeClasses = () => {
        if (isUncertain) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500';
        if (isAI) return 'bg-red-500/20 border-red-500/30 text-red-500';
        return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500';
    };

    const getTitleClasses = () => {
        if (isUncertain) return 'text-yellow-500';
        if (isAI) return 'text-red-500';
        return 'text-emerald-500';
    };

    return (
        <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-10 rounded-[50px] border-2 shadow-2xl relative overflow-hidden group transition-colors duration-500 ${getThemeClasses()}`}
        >
            {/* Gradient Background */}
            <div className={`absolute -right-20 -top-20 w-60 h-60 blur-[100px] pointer-events-none opacity-40 transition-colors duration-500
                ${isUncertain ? 'bg-yellow-500' : isAI ? 'bg-red-500' : 'bg-emerald-500'}
            `} />

            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inference Result</p>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Asset Authenticity</h3>
                    </div>
                    <div className={`px-5 py-2 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${getBadgeClasses()}`}>
                        {isUncertain ? '🟡 UNCERTAIN RESULT' : isAI ? 'ARTIFICIAL' : 'HUMAN'}
                    </div>
                </div>

                <div className="flex flex-col items-center py-6">
                    <div className={`text-7xl font-black italic tracking-tighter mb-4 transition-colors duration-500 ${getTitleClasses()}`}>
                        {isUncertain ? 'UNCERTAIN' : isAI ? 'AI GENERATED' : 'AUTHENTIC REAL'}
                    </div>

                    {/* Explanation Text */}
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-[400px] text-center mb-8 leading-relaxed">
                        {explanation}
                    </p>

                    <div className="w-full max-w-md space-y-4">
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Authenticity Grade</span>
                            <span className="text-white text-4xl font-black tabular-nums">{confidencePercent}%</span>
                        </div>
                        {/* Probability Bar */}
                        <div className="h-3 w-full bg-slate-950/60 rounded-full border border-slate-800/40 overflow-hidden p-[2px]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${confidencePercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${isUncertain ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : isAI ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
                            />
                        </div>
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] text-center">Spectral Confidence Telemetry</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 p-5 rounded-3xl border border-slate-800/60">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Trace Identity</p>
                        <p className="text-xs font-bold text-white truncate uppercase">{result.filename}</p>
                    </div>
                    <div className="bg-slate-950/40 p-5 rounded-3xl border border-slate-800/60">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Time Captured</p>
                        <p className="text-xs font-bold text-white uppercase">
                            {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ResultCard;
