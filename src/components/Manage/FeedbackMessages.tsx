"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  type: "success" | "error" | "info" | "warning";
  timestamp: number;
}

interface FeedbackMessagesProps {
  success?: boolean;
  errorMsg: string | null;
  infoMsg?: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

export function FeedbackMessages({ 
  success, 
  errorMsg, 
  infoMsg, 
  type = "info", 
  duration = 5000 
}: FeedbackMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((text: string, messageType: "success" | "error" | "info" | "warning") => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      type: messageType,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      }, duration);
    }
  }, [duration]);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Monitorar mudanças nas props para adicionar mensagens
  useEffect(() => {
    const messagesToAdd: { text: string; type: "success" | "error" | "info" | "warning" }[] = [];
    
    if (success) {
      messagesToAdd.push({ text: "Dados salvos com sucesso!", type: "success" });
    } else if (errorMsg) {
      messagesToAdd.push({ text: errorMsg, type: "error" });
    } else if (infoMsg) {
      messagesToAdd.push({ text: infoMsg, type });
    }

    // Adicionar mensagens de forma assíncrona para evitar cascading renders
    messagesToAdd.forEach(msg => {
      setTimeout(() => addMessage(msg.text, msg.type), 0);
    });
  }, [success, errorMsg, infoMsg, type, addMessage]);

  const getIcon = (messageType: string) => {
    switch (messageType) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "error":
        return <XCircle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getStyles = (messageType: string) => {
    switch (messageType) {
      case "success":
        return {
          bg: "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
          border: "border-emerald-500/30",
          text: "text-emerald-100",
          icon: "text-emerald-400"
        };
      case "error":
        return {
          bg: "bg-gradient-to-r from-red-500/20 to-rose-500/20",
          border: "border-red-500/30",
          text: "text-red-100",
          icon: "text-red-400"
        };
      case "warning":
        return {
          bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
          border: "border-amber-500/30",
          text: "text-amber-100",
          icon: "text-amber-400"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20",
          border: "border-blue-500/30",
          text: "text-blue-100",
          icon: "text-blue-400"
        };
    }
  };

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex flex-col items-center px-4 gap-2">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => {
          const styles = getStyles(message.type);
          const isLatest = index === messages.length - 1;
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.1 // Pequeno delay para mensagens subsequentes
                }
              }}
              exit={{ 
                opacity: 0, 
                y: -30, 
                scale: 0.95,
                transition: { duration: 0.2 }
              }}
              whileHover={{ scale: 1.02 }}
              className={`
                relative max-w-md w-full
                ${styles.bg} 
                ${styles.border} 
                border backdrop-blur-xl
                rounded-2xl shadow-2xl
                overflow-hidden
              `}
              style={{
                zIndex: 50 - index // Mensagens mais recentes ficam por cima
              }}
            >
              <div className="flex items-center gap-3 p-3">
                <motion.div 
                  className={`${styles.icon}`}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {getIcon(message.type)}
                </motion.div>
                
                <div className="flex-1">
                  <p className={`${styles.text} font-medium text-sm leading-relaxed`}>
                    {message.text}
                  </p>
                </div>
                
                <button
                  onClick={() => removeMessage(message.id)}
                  className={`${styles.text} hover:opacity-70 transition-opacity p-1`}
                >
                  <XCircle className="w-3 h-3" />
                </button>
              </div>
              
              {isLatest && duration > 0 && (
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 ${styles.icon} ${styles.bg}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}