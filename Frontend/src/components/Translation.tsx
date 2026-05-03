import { useState } from "react";
import {
  ArrowLeftRight,
  Loader2,
  Volume2,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { callAPI } from "../api";

export function Translation() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setLoading(true);
    setError(null);
    setTranslatedText("");

    try {
      const response = await callAPI("translate", sourceText);
      setTranslatedText(response.output);
    } catch (err) {
      setError("Failed to translate text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <ArrowLeftRight className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-white font-semibold text-2xl tracking-tight">Translation <span className="text-gray-500 font-normal ml-2">English → Odia</span></h2>
      </div>

      <div className="space-y-8">
        {/* Language Info */}
        <div className="grid grid-cols-3 gap-4 text-center items-center">
          <div className="border border-white/10 rounded-xl py-3 bg-white/5 font-medium tracking-wide">English</div>
          <ArrowLeftRight className="mx-auto text-indigo-400 opacity-50" />
          <div className="border border-white/10 rounded-xl py-3 bg-white/5 font-medium tracking-wide">Odia</div>
        </div>

        {/* Translation Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Text */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-300 text-sm font-medium tracking-wide">Source Text (English)</label>
              {sourceText && (
                <button
                  onClick={() => handleSpeak(sourceText, "en")}
                  className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter English text..."
              className="flex-1 min-h-[12rem] px-5 py-4 bg-black/20 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-gray-500 transition-all resize-none shadow-inner"
            />

            <div className="mt-3 text-xs font-medium text-gray-500 tracking-wide uppercase">
              {sourceText.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          {/* Translated Text */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-300 text-sm font-medium tracking-wide">Translated Text (Odia)</label>
              {translatedText && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSpeak(translatedText, "or-IN")}
                    className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-[12rem] px-5 py-4 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10 rounded-xl overflow-y-auto shadow-inner relative">
              <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none" />
              <div className="relative z-10">
                {translatedText ? (
                  <p className="text-gray-200 leading-relaxed tracking-wide">{translatedText}</p>
                ) : (
                  <p className="text-gray-600">
                    Translation will appear here...
                  </p>
                )}
              </div>
            </div>

            {translatedText && (
              <div className="mt-3 text-xs font-medium text-gray-500 tracking-wide uppercase">
                {translatedText.split(/\s+/).filter(Boolean).length} words
              </div>
            )}
          </div>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={!sourceText.trim() || loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 rounded-xl font-medium transition-all duration-300 hover:from-indigo-400 hover:to-purple-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <ArrowLeftRight className="w-5 h-5" />
              <span>Translate Text</span>
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
      </div>
    </div>
  );
}
