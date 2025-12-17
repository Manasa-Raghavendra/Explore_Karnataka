import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "bot";
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Oops 😕 I couldn’t answer that." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full
                     bg-gradient-hero shadow-xl flex items-center justify-center
                     animate-bounce"
        >
          <MessageCircle className="text-white w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <Card className="w-[90vw] sm:w-[380px] h-[520px] flex flex-col rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-hero text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  🤖
                </div>
                <span className="font-semibold text-sm">
                  Karnataka AI Guide
                </span>
              </div>
              <X
                className="cursor-pointer hover:opacity-80"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Messages */}
            <div className="flex-1 px-3 py-2 space-y-3 overflow-y-auto bg-background">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-6">
                  Hi 👋 Ask me about temples, food, trips & festivals in Karnataka
                </p>
              )}

              {messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}

              {loading && (
                <p className="text-xs text-muted-foreground">
                  AI is thinking…
                </p>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2 bg-background">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something..."
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={loading}>
                Send
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.35s ease-out;
        }
      `}</style>
    </>
  );
}
