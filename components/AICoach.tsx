import React, { useState } from 'react';
import { useAppStore } from '../services/store';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Play, AlertCircle } from 'lucide-react';

export const AICoach: React.FC = () => {
  const { logs, user } = useAppStore();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCoaching = async () => {
    if (!process.env.API_KEY) {
      setError("No API Key configured. Please add your Gemini API Key.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get last 3 days of logs
      const recentLogs = logs
        .filter(l => l.userId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

      const prompt = `
        Act as a tough but encouraging productivity coach. 
        Here is my data for the last few days: ${JSON.stringify(recentLogs)}.
        Analyze my wake-up times, study efficiency, and wasted time.
        Give me 1 specific actionable tip to improve tomorrow. 
        Keep it under 50 words. Be direct.
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAdvice(response.text);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the Coach.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="text-purple-400" size={20} />
        <h3 className="font-bold text-white">AI Coach</h3>
      </div>
      
      {!advice && !loading && (
        <div className="text-center py-4">
          <p className="text-zinc-400 text-sm mb-4">
            Get personalized feedback on your recent performance.
          </p>
          <button 
            onClick={getCoaching}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <Play size={14} fill="currentColor" />
            Analyze My Week
          </button>
        </div>
      )}

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
        </div>
      )}

      {error && (
        <div className="text-rose-400 text-sm flex items-center gap-2 bg-rose-400/10 p-3 rounded-lg">
           <AlertCircle size={16} />
           {error}
        </div>
      )}

      {advice && (
        <div className="animate-in fade-in duration-500">
           <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
             <p className="text-purple-100 text-sm leading-relaxed italic">"{advice}"</p>
           </div>
           <button 
             onClick={() => setAdvice(null)} 
             className="text-xs text-zinc-500 mt-2 underline hover:text-zinc-300"
           >
             Close
           </button>
        </div>
      )}
    </div>
  );
};
