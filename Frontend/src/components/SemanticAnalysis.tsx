import { useState } from "react";
import { Send, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { callAPI } from "../api";

interface AnalysisResult {
  sentiment: "positive" | "negative" | "neutral";
}

export function SemanticAnalysis() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await callAPI("sentiment", text);

      setResult({
        sentiment: response.output,
      });
    } catch (err) {
      setError("Failed to analyze text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]";
      case "negative":
        return "text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-[0_0_15px_rgba(251,113,133,0.1)]";
      default:
        return "text-gray-300 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-white font-semibold text-2xl tracking-tight">Sentiment Analysis</h2>
      </div>

      <div className="space-y-8">
        {/* Input */}
        <div>
          <label className="block text-gray-300 mb-3 text-sm font-medium tracking-wide">
            Enter text to analyze
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-40 px-5 py-4 bg-black/20 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleAnalyze}
          disabled={!text.trim() || loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl font-medium transition-all duration-300 hover:from-indigo-400 hover:to-purple-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Analyze Text</span>
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex gap-3 items-center shadow-[0_0_15px_rgba(251,113,133,0.1)]">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <p className="text-rose-200">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-gray-400 mb-4 text-xs uppercase tracking-widest font-semibold">Sentiment Result</h3>
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium border backdrop-blur-sm ${getSentimentColor(result.sentiment)}`}>
              {result.sentiment === 'positive' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />}
              {result.sentiment === 'negative' && <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />}
              {result.sentiment === 'neutral' && <div className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse" />}
              <span className="capitalize">{result.sentiment}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
