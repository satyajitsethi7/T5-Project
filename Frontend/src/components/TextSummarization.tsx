import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { callAPI } from "../api";

export function TextSummarization() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [summaryLength, setSummaryLength] =
    useState<"short" | "medium" | "long">("medium");

  const handleSummarize = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setSummary("");

    // 🔹 Map UI length to backend length
    const lengthMap = {
      short: "small",
      medium: "medium",
      long: "big",
    } as const;

    try {
      const response = await callAPI("summarize", text, lengthMap[summaryLength]);
      
      if (response.error) {
        setError(response.error);
      } else {
        setSummary(response.output);
      }
    } catch (err) {
      setError("Failed to summarize text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-white font-semibold text-2xl tracking-tight">Text Summarization</h2>
      </div>

      <div className="space-y-8">
        {/* Input */}
        <div>
          <label className="block text-gray-300 mb-3 text-sm font-medium tracking-wide">
            Enter text to summarize
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your long text here..."
            className="w-full h-48 px-5 py-4 bg-black/20 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 transition-all resize-none shadow-inner"
          />
        </div>

        {/* Length Selector */}
        <div>
          <label className="block text-gray-300 mb-4 text-sm font-medium tracking-wide">
            Summary Length
          </label>
          <div className="flex gap-4">
            {["short", "medium", "long"].map((len) => (
              <button
                key={len}
                onClick={() =>
                  setSummaryLength(len as "short" | "medium" | "long")
                }
                className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-300 font-medium tracking-wide ${
                  summaryLength === len
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                    : "border-white/10 text-gray-400 bg-black/20 hover:border-white/20 hover:bg-white/5 hover:text-gray-300"
                }`}
              >
                {len.charAt(0).toUpperCase() + len.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSummarize}
          disabled={!text.trim() || loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl font-medium transition-all duration-300 hover:from-indigo-400 hover:to-purple-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Summarizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Summary</span>
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

        {/* Output */}
        {summary && (
          <div className="pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Summary Result</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy text</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl" />
              <div className="relative bg-black/20 border border-white/10 rounded-2xl p-6 shadow-inner">
                <p className="text-gray-200 leading-relaxed tracking-wide">{summary}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-between text-xs font-medium text-gray-500 tracking-wide uppercase">
              <span>Original: {text.split(/\s+/).length} words</span>
              <span>Summary: {summary.split(/\s+/).length} words</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
