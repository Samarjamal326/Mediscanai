import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/navbar";
import { chatApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Trash2, ShieldCheck, Database, Brain, MessageCircle } from "lucide-react";
import "@/medibot-page.css";

// ─── Schema & Types ───────────────────────────────────────────────────────────
const messageSchema = z.object({
  message: z.string().min(1, "Please enter a message"),
});
type MessageData = z.infer<typeof messageSchema>;

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MediBot() {
  const [sessionId] = useState(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message:
        "Hello! I'm **MediScan AI**, your clinical intelligence assistant. I'm grounded in real medical literature and can help with symptoms, medications, diet plans, and general health questions.\n\nHow can I help you today?",
      isUser: false,
      createdAt: new Date().toISOString(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<MessageData>({ defaultValues: { message: "" } });

  useQuery({
    queryKey: ["/api/chat", sessionId],
    queryFn: () => chatApi.getMessages(sessionId),
    enabled: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.userMessage, data.aiMessage]);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
    },
    onError: (error: any) => {
      toast({
        title: "Message Failed",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MessageData) => {
    sendMessageMutation.mutate({ sessionId, message: data.message, isUser: true });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        message:
          "Chat cleared. How can I assist you today?",
        isUser: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    toast({ title: "Session Reset", description: "Chat history has been cleared." });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMessageMutation.isPending]);

  return (
    <div className="msc-page-bg medibot-page bg-background text-foreground">
      <Navbar />
      <div className="medibot-glow" />

      <motion.section
        className="medibot-page-inner pb-14 pt-28 scroll-mt-28 md:pb-16 md:pt-32 md:scroll-mt-32"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-[860px] px-5 sm:px-6">
          {/* ── Page title (matches nav: Medi · brand colors) ── */}
          <header className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--msc-primary-light)] px-4 py-1.5 font-sans text-sm font-semibold text-[var(--msc-primary)]">
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden /> Clinical chat
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              <span className="text-[var(--text-heading)]">Medi</span>
              <span className="text-[var(--msc-primary)]">Bot</span>{" "}
              <span className="text-[var(--msc-accent-teal)]">Assistant</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg font-sans text-base leading-relaxed text-[var(--text-muted)]">
              Precision guidance grounded in clinical literature — same visual language as the rest of MediSCAN Ai.
            </p>
          </header>

          {/* ── Chat Card ── */}
          <div className="chat-card">

            {/* Header */}
            <div className="chat-header">
              <div className="relative z-[1] flex items-center gap-3.5">
                <div className="bot-avatar" aria-label="MediScan AI avatar">
                  <Bot />
                </div>
                <div>
                  <div className="font-display text-[17px] font-bold leading-snug tracking-tight">
                    <span className="chat-header-brand-medi">Medi</span>
                    <span className="chat-header-brand-scan">SCAN</span>{" "}
                    <span className="chat-header-brand-ai">Ai</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="status-dot" />
                    <span className="font-sans text-xs font-medium" style={{ color: "rgba(255,255,255,0.88)" }}>
                      Active · RAG &amp; Gemini
                    </span>
                  </div>
                </div>
              </div>
              <span className="version-badge font-mono">v2.4 Pro</span>
            </div>

            {/* Messages */}
            <div className="chat-messages" data-testid="chat-messages">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className="msg-row"
                    style={{
                      display: "flex",
                      flexDirection: msg.isUser ? "row-reverse" : "row",
                      alignItems: "flex-start",
                      gap: "10px",
                      marginBottom: "20px",
                    }}
                    initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    {/* Avatar */}
                    {msg.isUser ? (
                      <div className="avatar-user" aria-label="User">
                        <User />
                      </div>
                    ) : (
                      <div className="avatar-bot" aria-label="MediScan AI">
                        <Bot />
                      </div>
                    )}

                    {/* Bubble + timestamp */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: msg.isUser ? "flex-end" : "flex-start" }}>
                      {msg.isUser ? (
                        <div className="bubble-user">{msg.message}</div>
                      ) : (
                        <div className="bubble-bot">
                          <div className="prose prose-sm max-w-none text-inherit [&_*]:font-sans">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.message}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                      <span className="msg-timestamp">{formatTime(msg.createdAt)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {sendMessageMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "20px" }}
                >
                  <div className="avatar-bot" aria-label="MediScan AI is typing">
                    <Bot />
                  </div>
                  <div className="bubble-bot" style={{ padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
              <form onSubmit={form.handleSubmit(onSubmit)} className="chat-input-wrap">
                <input
                  className="chat-input"
                  placeholder="Inquire about symptoms, drug alternatives, or health guidance..."
                  {...form.register("message")}
                  onKeyDown={handleKeyDown}
                  disabled={sendMessageMutation.isPending}
                  data-testid="input-chat-message"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={sendMessageMutation.isPending || !form.watch("message")?.trim()}
                  aria-label="Send message"
                  data-testid="button-send-message"
                >
                  <Send />
                </button>
              </form>
            </div>

            {/* Footer Tags */}
            <div className="chat-footer">
              <div className="footer-tags">
                <span className="tag-pill">
                  <ShieldCheck />
                  HIPAA
                </span>
                <span className="footer-sep">·</span>
                <span className="tag-pill">
                  <Database />
                  RAG &amp; Pinecone
                </span>
                <span className="footer-sep">·</span>
                <span className="tag-pill">
                  <Brain />
                  Google Gemini
                </span>
              </div>
              <button
                className="tag-pill tag-pill-danger"
                onClick={clearChat}
                data-testid="button-clear-chat"
                aria-label="Reset session"
              >
                <Trash2 />
                Reset Session
              </button>
            </div>

          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center font-sans text-[11px] leading-relaxed text-[var(--text-muted)]">
            <strong className="font-semibold uppercase tracking-wider text-[var(--text-heading)]">
              Medical disclaimer:{" "}
            </strong>
            MediBot provides informational guidance. It is not a substitute for professional medical consultation,
            diagnosis, or treatment. Always consult a qualified healthcare professional.
          </p>

        </div>
      </motion.section>
    </div>
  );
}
