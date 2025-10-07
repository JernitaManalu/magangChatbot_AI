// app/page.tsx - Production Version (FIXED SOURCES)
"use client";

import { useState, useRef, useEffect } from "react";

interface Source {
  title: string;
  abstract: string;
  link: string;
  release_date: string;
  source_type: string;
  category: string;
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

  // Production API URL (HuggingFace Spaces)
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
        }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();

      console.log("API Response:", data); // Debug log

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date(),
        model: data.metadata?.model || selectedModel,
      };

      console.log("Sources:", assistantMessage.sources); // Debug log

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMessage);

      const errorChatMessage: ChatMessage = {
        role: "assistant",
        content: `Maaf, terjadi kesalahan: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Data inflasi Sumatera Utara terbaru",
    "Tingkat kemiskinan di Sumut",
    "Pertumbuhan ekonomi Sumatera Utara",
    "Data pengangguran Sumut",
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-2">🤖 INDA</h2>
        <p className="text-xs text-gray-300 mb-4">
          Intelligent Data Assistant - BPS Sumatera Utara
        </p>

        {/* Model Selection */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">🧠 Pilih Model:</p>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedModel("groq")}
              disabled={loading}
              className={`w-full text-left text-xs rounded p-2 transition-colors ${
                selectedModel === "groq"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              ⚡ Llama 3.1 8B (Groq)
            </button>
            <button
              onClick={() => setSelectedModel("gemini")}
              disabled={loading}
              className={`w-full text-left text-xs rounded p-2 transition-colors ${
                selectedModel === "gemini"
                  ? "bg-blue-600
