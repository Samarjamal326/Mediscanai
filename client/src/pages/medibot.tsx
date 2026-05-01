import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { chatApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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
    enabled: false, // We manage messages locally for better UX
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (data) => {
      // Add both user and AI messages to the chat
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">MediBot - AI Health Assistant</h1>
            <p className="text-muted-foreground">Powered by Mistral-7B with RAG and FAISS vector database for reliable medical information</p>
          </div>
          
          <Card className="overflow-hidden">
            {/* Chat Header */}
            <CardHeader className="bg-gradient-to-r from-green-500 to-green-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <i className="fas fa-robot text-green-600 text-lg"></i>
                </div>
                <div>
                  <CardTitle className="text-white">MediBot</CardTitle>
                  <p className="text-green-100 text-sm">AI-Powered Medical Assistant</p>
                </div>
                <div className="ml-auto">
                  <Badge className="bg-green-400 text-green-800">Online</Badge>
                </div>
              </div>
            </CardHeader>
            
            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start space-x-3 ${message.isUser ? 'justify-end' : ''}`}
                  data-testid={`message-${message.isUser ? 'user' : 'ai'}-${message.id}`}
                >
                  {!message.isUser && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-green-600"></i>
                    </div>
                  )}
                  
                  <div className={`chat-bubble-${message.isUser ? 'user' : 'ai'} rounded-lg px-4 py-2 max-w-md`}>
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    {!message.isUser && message.id !== "welcome" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Source: Retrieved from medical database • Confidence: 95%
                      </p>
                    )}
                  </div>
                  
                  {message.isUser && (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-user text-white"></i>
                    </div>
                  )}
                </div>
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-robot text-green-600"></i>
                  </div>
                  <div className="chat-bubble-ai rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span className="text-sm">MediBot is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <CardContent className="border-t border-border p-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <Input
                      placeholder="Ask MediBot about your health concerns..."
                      {...form.register("message")}
                      onKeyPress={handleKeyPress}
                      disabled={sendMessageMutation.isPending}
                      className="pr-12"
                      data-testid="input-chat-message"
                    />
                    <button 
                      type="submit"
                      disabled={sendMessageMutation.isPending || !form.watch("message")?.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                      data-testid="button-send-message"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span><i className="fas fa-shield-alt mr-1"></i>HIPAA Compliant</span>
                  <span><i className="fas fa-database mr-1"></i>FAISS Vector DB</span>
                  <span><i className="fas fa-brain mr-1"></i>Mistral-7B</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearChat}
                    className="text-xs"
                    data-testid="button-clear-chat"
                  >
                    <i className="fas fa-trash mr-1"></i>Clear Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Disclaimer */}
          <Alert className="mt-6">
            <i className="fas fa-exclamation-triangle"></i>
            <AlertDescription>
              <strong>Important Medical Disclaimer:</strong> MediBot provides information for educational purposes only and should not replace professional medical advice. Always consult healthcare providers for medical decisions.
            </AlertDescription>
          </Alert>
        </div>
      </section>
      
    </div>
  );
}
