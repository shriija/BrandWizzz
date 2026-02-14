
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

interface ArtDirectorPageProps {
  onBack: () => void;
  initialContext?: { 
    niche: string; 
    location: string; 
    trend: string; 
    goal: string;
    strategy?: {
      planName: string;
      phases: { day: number; task: string; objective: string }[];
    };
    copy?: {
      variants: { platform: string; headline: string; body: string; cta: string }[];
      taglines: string[];
    };
  } | null;
}

const ART_STEPS = [
  "Inheriting narrative and strategic guidelines...",
  "Synthesizing visual tone and color theory...",
  "Generating environment and asset prompts...",
  "Initializing high-fidelity neural image synthesis...",
  "Refining textures and lighting for brand cohesion...",
  "Finalizing visual concept boards..."
];

const ArtDirectorPage: React.FC<ArtDirectorPageProps> = ({ onBack, initialContext }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [showResults, setShowResults] = useState(true);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [visualBrief, setVisualBrief] = useState({
    vibe: "Warm, Productive, Minimalist",
    colors: ["#F5F5F5", "#2D2D2D", "#00d8ff", "#E2E8F0"],
    concept: "A high-fidelity shot of an artisanal coffee space in Austin. Soft afternoon light hitting a clean wooden table. A laptop is open, next to a perfectly poured latte. The atmosphere feels like a 'sanctuary' for focus."
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logMessages]);

  const generateConcept = async () => {
    setIsProcessing(true);
    setShowResults(false);
    setLogMessages(["[SYSTEM] Visual Synthesis Engine Booting..."]);

    let step = 0;
    const logInterval = setInterval(() => {
      if (step < ART_STEPS.length - 1) {
        setLogMessages(prev => [...prev, `[RENDER] ${ART_STEPS[step]}`]);
        setCurrentStep(ART_STEPS[step]);
        step++;
      }
    }, 800);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Step 1: Generate Visual Brief text using Pro for high reasoning
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Create a visual concept brief for a marketing campaign.
                   Business: ${initialContext?.niche}
                   Location: ${initialContext?.location}
                   Trend: ${initialContext?.trend}
                   Goal: ${initialContext?.goal}
                   Campaign Name: ${initialContext?.strategy?.planName}
                   Taglines: ${initialContext?.copy?.taglines.join(', ')}
                   
                   Provide a vibe description, a list of brand colors (hex codes), and a detailed prompt for an image generator that captures the 'sanctuary' and 'focus' mood.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vibe: { type: Type.STRING },
              colors: { type: Type.ARRAY, items: { type: Type.STRING } },
              concept: { type: Type.STRING }
            },
            required: ["vibe", "colors", "concept"]
          }
        }
      });

      const briefData = JSON.parse(textResponse.text || '{}');
      setVisualBrief(briefData);
      setLogMessages(prev => [...prev, "[LOG] Strategic visual brief established."]);

      // Step 2: Generate the actual image concept
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A high-quality professional commercial photography shot. ${briefData.concept}. Cinematic lighting, 8k resolution, minimalist aesthetic.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        },
      });

      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64String = part.inlineData.data;
          setGeneratedImage(`data:image/png;base64,${base64String}`);
          break;
        }
      }

      clearInterval(logInterval);
      setLogMessages(prev => [...prev, "[SUCCESS] Visual concept synthesized successfully."]);
      setShowResults(true);
    } catch (error) {
      console.error("Visual synthesis failed:", error);
      setLogMessages(prev => [...prev, "[ERROR] Critical rendering failure. Neural link unstable."]);
      setShowResults(true);
    } finally {
      setIsProcessing(false);
      clearInterval(logInterval);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <header className="sticky top-0 z-40 bg-[#0b0f14]/80 backdrop-blur-md border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h1 className="text-xl font-bold text-white leading-none">Art Director Agent</h1>
                <p className="text-xs text-[#00d8ff] font-bold uppercase tracking-widest mt-1">Visual Concept Designer</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            Vision Core Active
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-[#141417] border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-6">Aesthetic Controls</h2>
              <div className="space-y-4">
                 <div className="p-3 bg-black/40 rounded-xl border border-gray-800">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Heritage Input</p>
                  <p className="text-[11px] text-[#00d8ff] font-mono leading-tight mb-1">NICHE: {initialContext?.niche || 'N/A'}</p>
                  <p className="text-[11px] text-gray-400 font-mono leading-tight">TREND: {initialContext?.trend || 'N/A'}</p>
                </div>
                <button 
                  onClick={generateConcept} disabled={isProcessing}
                  className={`w-full py-4 mt-2 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                    isProcessing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#00d8ff] hover:bg-[#00c2e5] text-black shadow-lg shadow-cyan-500/20'
                  }`}
                >
                  {isProcessing ? "Rendering..." : "Generate Concepts"}
                </button>
              </div>
            </section>

            {(isProcessing || logMessages.length > 0) && (
              <section className="bg-black/40 border border-gray-800 rounded-2xl p-4 font-mono text-[10px] h-[300px] flex flex-col shadow-inner">
                <div className="flex items-center justify-between mb-3 text-gray-500 uppercase tracking-widest font-bold">Process Stream</div>
                <div className="flex-grow overflow-y-auto space-y-1.5 scrollbar-hide opacity-80">
                  {logMessages.map((msg, i) => (
                    <div key={i} className={msg.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                      <span className="text-gray-700 font-normal mr-1">&gt;</span>{msg}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-9 space-y-8">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-32 text-center animate-pulse">
                 <div className="w-16 h-16 border-2 border-[#00d8ff] border-t-transparent rounded-full animate-spin mb-6"></div>
                 <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Synthesizing High-Fidelity Concepts</h2>
                 <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">{currentStep}</p>
              </div>
            ) : showResults ? (
              <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8">
                {/* Visual Showcase */}
                <div className="bg-[#141417] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="aspect-video w-full bg-gray-900 relative">
                    {generatedImage ? (
                      <img src={generatedImage} alt="Visual Concept" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-700 font-mono text-xs uppercase tracking-widest">Awaiting Neural Render</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-2xl font-black text-white tracking-tight">Visual Concept 01</h3>
                      <p className="text-[#00d8ff] font-bold text-sm uppercase tracking-widest">{visualBrief.vibe}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Color Palette</h4>
                    <div className="flex gap-4">
                      {visualBrief.colors.map((color, i) => (
                        <div key={i} className="group relative">
                          <div 
                            className="w-12 h-12 rounded-xl border border-gray-800 shadow-lg cursor-pointer transition-transform group-hover:scale-110" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="bg-[#141417] border border-gray-800 p-8 rounded-3xl">
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Conceptual logic</h4>
                    <p className="text-gray-300 leading-relaxed italic">
                      "The visual narrative focuses on the physical manifestation of a 'Sanctuary'. By emphasizing soft light and high-quality textures, we communicate focus and artisanal value—directly appealing to the tech-hub remote demographic identified in Phase 01."
                    </p>
                  </section>
                  <section className="bg-[#141417] border border-gray-800 p-8 rounded-3xl">
                    <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-4">Strategic alignment</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <p className="text-xs text-white">Consistent with Austin local vibe</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <p className="text-xs text-white">Optimized for Instagram high-retention cues</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-[#00d8ff]"></div>
                         <p className="text-xs text-white">Psychological Hook: Quiet Luxury</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800 text-gray-700">
                   <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Vision Core Standby</h3>
                <p className="text-gray-400 max-w-sm text-sm">Synchronize with Copywriter to begin neural visualization.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showResults && !isProcessing && (
        <footer className="fixed bottom-0 left-0 right-0 p-6 bg-[#0b0f14]/80 backdrop-blur-xl border-t border-gray-800/60 z-30">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Campaign Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs text-white font-bold">Neural Workflow Complete</span>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-gray-800"></div>
              <div className="hidden sm:block">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Final Asset</p>
                <span className="text-xs text-gray-300 font-mono italic">Campaign: {initialContext?.strategy?.planName || 'Master Campaign'}</span>
              </div>
            </div>
            <button className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95 group">
              Export Full Campaign
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ArtDirectorPage;
