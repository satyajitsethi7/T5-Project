import { useState } from 'react';
import { Brain, FileText, Languages } from 'lucide-react';
import { SemanticAnalysis } from './components/SemanticAnalysis';
import { TextSummarization } from './components/TextSummarization';
import { Translation } from './components/Translation';
import SplitText from './components/SplitText';
// @ts-ignore
import Aurora from './components/Aurora';

type Tab = 'semantic' | 'summarization' | 'translation';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('semantic');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden font-sans">
      {/* Aurora Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#22ff00", "#ff008c", "#4100e4"]}
          blend={0.5}
          amplitude={0.1}
          speed={1}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
              <Brain className="w-10 h-10 text-indigo-400" />
            </div>
            <SplitText
              text="T5-Core"
              className="text-6xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(129,140,248,0.5)] tracking-tight relative"
              delay={50}
              duration={1.25}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, top: 40 }}
              to={{ opacity: 1, top: 0 }}
              textAlign="center"
            />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Advanced T5 transformer engine for semantic analysis, text summarization, and translation.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 mb-12 max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('semantic')}
              className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl transition-all duration-300 font-medium ${activeTab === 'semantic'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Brain className="w-5 h-5" />
              <span>Semantic</span>
            </button>
            <button
              onClick={() => setActiveTab('summarization')}
              className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl transition-all duration-300 font-medium ${activeTab === 'summarization'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <FileText className="w-5 h-5" />
              <span>Summarize</span>
            </button>
            <button
              onClick={() => setActiveTab('translation')}
              className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl transition-all duration-300 font-medium ${activeTab === 'translation'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Languages className="w-5 h-5" />
              <span>Translate</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'semantic' && <SemanticAnalysis />}
          {activeTab === 'summarization' && <TextSummarization />}
          {activeTab === 'translation' && <Translation />}
        </div>
      </div>
    </div>
  );
}
