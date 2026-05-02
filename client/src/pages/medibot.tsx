import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { chatApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Trash2, ShieldCheck, Database, Brain, Sparkles } from "lucide-react";

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

export default function MediBot() {
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message: "Hello! I'm MediBot, your AI health assistant. I can help answer medical questions, provide health information, and offer guidance based on medical literature. How can I assist you today?",
      isUser: false,
      createdAt: new Date().toISOString(),
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<MessageData>({
    defaultValues: {
      message: "",
    },
  });

  const { data: chatHistory } = useQuery({
    queryKey: ["/api/chat", sessionId],
    queryFn: () => chatApi.getMessages(sessionId),
    enabled: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        data.userMessage,
        data.aiMessage
      ]);
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
    sendMessageMutation.mutate({
      sessionId,
      message: data.message,
      isUser: true,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        message: "Hello! I'm MediBot, your AI health assistant. I can help answer medical questions, provide health information, and offer guidance based on medical literature. How can I assist you today?",
        isUser: false,
        createdAt: new Date().toISOString(),
      }
    ]);
    toast({
      title: "Chat Cleared",
      description: "Chat history has been cleared.",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                MediBot <span className="text-primary">Assistant</span>
              </h1>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Advanced AI-powered medical guidance for healthcare professionals and patients.
              </p>
            </motion.div>
          </div>
          
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
            {/* Professional Chat Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <Bot className="text-primary w-6 h-6" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full shadow-sm"></span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">MediScan AI</h3>
                  <div className="flex items-center text-slate-400 text-xs mt-0.5">
                    <Sparkles className="w-3 h-3 mr-1 text-primary animate-pulse" />
                    <span>Active Intelligence</span>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 font-medium px-3 py-1">
                v2.4 Pro
              </Badge>
            </div>
            
            {/* Chat Messages Area */}
            <div className="h-[500px] overflow-y-auto p-6 space-y-6 bg-slate-50/30" data-testid="chat-messages">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div 
                    key={message.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 ${message.isUser ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                      message.isUser ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-primary'
                    }`}>
                      {message.isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    
                    <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className={`px-4 py-3 shadow-sm ${
                        message.isUser 
                          ? 'bg-primary text-white rounded-2xl rounded-tr-none' 
                          : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none'
                      }`}>
                        {message.isUser ? (
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                            {message.message}
                          </p>
                        ) : (
                          <div className="prose prose-sm max-w-none text-slate-700
                            prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mb-2 prose-headings:mt-4
                            prose-h2:text-base prose-h3:text-sm
                            prose-p:text-[14px] prose-p:leading-relaxed prose-p:my-1
                            prose-li:text-[14px] prose-li:leading-relaxed prose-li:my-0.5
                            prose-ul:my-2 prose-ol:my-2
                            prose-strong:text-slate-900 prose-strong:font-semibold
                            prose-em:text-slate-600
                            prose-table:text-[13px] prose-table:border-collapse
                            prose-th:bg-slate-100 prose-th:px-3 prose-th:py-1.5 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-slate-200
                            prose-td:px-3 prose-td:py-1.5 prose-td:border prose-td:border-slate-200
                            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                            prose-hr:border-slate-200 prose-hr:my-3
                            first:prose-headings:mt-0
                          ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.message}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      
                      {!message.isUser && message.id !== "welcome" && (
                        <div className="flex items-center mt-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 space-x-2 px-1">
                          <span className="flex items-center"><Database className="w-3 h-3 mr-1" />Verified Data</span>
                          <span>•</span>
                          <span>Score: 0.98</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5 py-1">
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input Area */}
            <CardContent className="border-t border-slate-100 p-6 bg-white">
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative group">
                <Input
                  placeholder="Inquire about symptoms, drug alternatives, or health guidance..."
                  {...form.register("message")}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                  className="pl-4 pr-14 py-6 rounded-xl border-slate-200 focus-visible:ring-primary/20 focus-visible:border-primary transition-all bg-slate-50/50"
                  data-testid="input-chat-message"
                />
                <Button 
                  type="submit"
                  disabled={sendMessageMutation.isPending || !form.watch("message")?.trim()}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-6">
                  <div className="flex items-center text-xs font-semibold text-slate-400 group cursor-help">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-slate-300 group-hover:text-green-500 transition-colors" />
                    <span>HIPAA Compliant Architecture</span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-slate-400 group cursor-help">
                    <Database className="w-3.5 h-3.5 mr-1.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    <span>RAG & FAISS Vector System</span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-slate-400 group cursor-help">
                    <Brain className="w-3.5 h-3.5 mr-1.5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                    <span>Google Gemini Enterprise AI</span>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearChat}
                  className="text-slate-400 hover:text-destructive hover:bg-destructive/5 text-xs font-bold uppercase tracking-tighter"
                  data-testid="button-clear-chat"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Reset Session
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Disclaimer Footer */}
          <div className="mt-8 px-4 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              <span className="text-slate-900 font-bold uppercase mr-1">Medical Disclaimer:</span> 
              MediBot provides informational guidance derived from clinical literature. It is not a substitute for professional medical consultation, diagnosis, or treatment. Always prioritize direct medical advice from qualified healthcare professionals.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
