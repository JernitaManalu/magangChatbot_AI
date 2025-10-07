// app/page.tsx - Enhanced Production Version
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Source {
  title: string;
  abstract: string;
  link: string;
  file?: string;
  release_date: string;
  similarity: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
  model?: string;
}

const ChatInterface = () => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<"groq" | "gemini">("groq");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Production API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://jernihh-magangchatbot-ai.hf.space";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          use_rag: true,
          model: selectedModel,
          top_k: 5,
        }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} - ${res.statusText}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date(),
        model: data.metadata?.model || selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMessage);

      const errorChatMessage: ChatMessage = {
        role: "assistant",
        content: `⚠️ Maaf, terjadi kesalahan: ${errorMessage}\n\nSilakan coba lagi atau hubungi administrator.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (q: string) => {
    setQuestion(q);
    // Auto submit setelah 100ms
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  const quickQuestions = [
    "📊 Inflasi terendah di Jawa Timur bulan September 2025",
    "📈 Pertumbuhan ekonomi Sumatera Utara terbaru",
    "💰 Data kemiskinan Sumut tahun 2025",
    "👨‍💼 Tingkat pengangguran terbuka terkini",
    "🌾 Produksi padi di Jawa Timur",
    "📉 Deflasi yang terjadi di Jawa Timur",
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6 flex flex-col shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <span className="text-3xl mr-2">🤖</span> NING AIDA
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            <strong>I</strong>ntelligent <strong>N</strong>et{" "}
            <strong>D</strong>ata <strong>A</strong>ssistant
          </p>
          <p className="text-xs text-gray-400 mt-1">
            BPS Sumatera Utara
          </p>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-3 font-semibold flex items-center">
            <span className="mr-2">🧠</span> Pilih Model AI:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedModel("groq")}
              disabled={loading}
              className={`w-full text-left text-sm rounded-lg p-3 transition-all duration-200 ${
                selectedModel === "groq"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">⚡ Llama 3.1 8B</div>
                  <div className="text-xs opacity-75">Groq • Cepat</div>
                </div>
                {selectedModel === "groq" && <span className="text-xl">✓</span>}
              </div>
            </button>
            <button
              onClick={() => setSelectedModel("gemini")}
              disabled={loading}
              className={`w-full text-left text-sm rounded-lg p-3 transition-all duration-200 ${
                selectedModel === "gemini"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">✨ Gemini 2.0 Flash</div>
                  <div className="text-xs opacity-75">Google • Akurat</div>
                </div>
                {selectedModel === "gemini" && <span className="text-xl">✓</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="mb-6 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-300 mb-3 font-semibold flex items-center">
            <span className="mr-2">💡</span> Pertanyaan Cepat:
          </p>
          <div className="space-y-2">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="w-full text-left text-sm bg-gray-700 hover:bg-gray-600 rounded-lg p-3 transition-all duration-200 hover:shadow-lg hover:transform hover:translate-x-1"
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-400 border-t border-gray-700 pt-4">
          <p className="mb-2 font-semibold text-gray-300">🔧 Tech Stack:</p>
          <ul className="space-y-1 ml-4">
            <li>• LangChain RAG</li>
            <li>• Qdrant Vector DB</li>
            <li>• FastAPI Backend</li>
            <li>• HuggingFace Spaces</li>
          </ul>
        </div>

        <div className="text-xs text-gray-400 mt-4 border-t border-gray-700 pt-4">
          <p className="mb-2">⚠️ <strong>Disclaimer:</strong></p>
          <p>
            NING AIDA dapat membuat kesalahan. Selalu verifikasi dengan{" "}
            <a
              href="https://sumut.bps.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-semibold"
            >
              Website BPS Resmi
            </a>
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-8 py-5 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">💬</span> Chat dengan Ning Aida
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Tanyakan tentang data statistik BPS •{" "}
            <span className="font-semibold text-blue-600">
              {selectedModel === "groq" ? "⚡ Llama 3.1 8B (Groq)" : "✨ Gemini 2.0 Flash"}
            </span>
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-24">
              <div className="text-8xl mb-6">🤖</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-700">
                Selamat Datang di NING AIDA!
              </h3>
              <p className="text-base mb-6 text-gray-600 max-w-2xl mx-auto">
                Saya siap membantu Anda menemukan data statistik BPS Sumatera Utara.
                Tanyakan tentang inflasi, ekonomi, kemiskinan, atau topik lainnya.
              </p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  📊 Data Real-time
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg">
                  🎯 Analisis Mendalam
                </div>
                <div className="bg-purple-50 px-4 py-2 rounded-lg">
                  📚 Sumber Terpercaya
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-4xl rounded-2xl shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className={`p-6 ${msg.role === "assistant" ? "prose prose-sm max-w-none" : ""}`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      className="text-gray-800"
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border-collapse border border-gray-300" {...props} />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="border border-gray-300 px-4 py-2" {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                <div
                  className={`px-6 pb-4 text-xs flex justify-between items-center ${
                    msg.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  <span>
                    {msg.timestamp.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.model && (
                    <span className="ml-2 font-semibold">
                      {msg.model === "groq" ? "⚡ Groq" : "✨ Gemini"}
                    </span>
                  )}
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
                    <p className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                      <span className="mr-2">📚</span> Sumber Referensi ({msg.sources.length}):
                    </p>
                    <div className="space-y-3">
                      {msg.sources.map((source, sidx) => (
                        <div
                          key={sidx}
                          className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="font-semibold text-gray-800 mb-2 flex items-start">
                            <span className="mr-2 text-blue-600">{sidx + 1}.</span>
                            <span>{source.title}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3 ml-6">
                            {source.abstract}
                          </div>
                          <div className="flex justify-between items-center ml-6">
                            <span className="text-xs text-gray-500">
                              📅 {source.release_date}
                            </span>
                            <div className="flex gap-2">
                              {source.link && (
                                <a
                                  href={source.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                                >
                                  🔗 Website
                                </a>
                              )}
                              {source.file && (
                                <a
                                  href={source.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                                >
                                  📄 PDF
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 max-w-md">
                <div className="flex items-center space-x-3">
                  <div className="animate-bounce text-3xl">🤖</div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      Ning Aida sedang berpikir...
                    </div>
                    <div className="text-sm text-gray-600">
                      Menganalisis data dari BPS
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-red-800 shadow-lg">
              <div className="flex items-start">
                <span className="text-3xl mr-4">❌</span>
                <div>
                  <p className="font-bold text-lg mb-2">Terjadi Kesalahan</p>
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-3 text-sm bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t shadow-lg p-6">
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-5xl mx-auto">
            <input
              type="text"
              placeholder="Ketik pertanyaan Anda di sini... (contoh: inflasi terendah di Jawa Timur)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 border-2 border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-base"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                loading || !question.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span> Memproses
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="mr-2">📤</span> Kirim
                </span>
              )}
            </button>
          </form>
          <p className="text-xs text-center text-gray-500 mt-3">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> to send • 
            NING AIDA v2.0 • Powered by LangChain & RAG
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
