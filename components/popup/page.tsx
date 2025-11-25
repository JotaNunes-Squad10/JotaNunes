"use client";

import { useState, useRef, useEffect } from "react";
import PersonIcon from "@mui/icons-material/Person";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const welcomeMessages = [
  "Precisa de informações? Estou online! "
];

export default function AnimatedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!initializedRef.current) {
      setMessages([
        {
          id: 1,
          text: "Olá! Sou seu assistente virtual da JotaNunes Construtora. Como posso ajudá-lo hoje?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Animação mensagem
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setShowMessage(true);
        setCurrentMessage(prev => (prev + 1) % welcomeMessages.length);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 4000);
      }, 60000); // De 1 em 1 minuto aparece a mensagem

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      const response = await fetch(
        "https://n8natos-n8n.4ecf9x.easypanel.host/webhook/captarmensagem",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage.text }),
        }
      );

      const botReply = await response.text();

      const botMessage: Message = {
        id: messages.length + 2,
        text:
          botReply ||
          "Infelizmente tive um problema no processamento, tente novamente mais tarde.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(
        "Erro ao enviar mensagem para o nosso servidor, tente novamente:",
        error
      );

      const botMessage: Message = {
        id: messages.length + 2,
        text: "Houve um erro ao tentar obter a resposta do servidor.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsFullscreen(false);
      setShowMessage(false);
    }
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      
      {/* Botão flutuante "batimento coracao" */}
      {!isOpen && (
        <div 
          className="fixed bottom-6 right-6 z-50"
          style={{
            transform: showMessage ? 'translateY(-12px) scale(1.1)' : 'translateY(0) scale(1)',
            transition: 'all 0.6s ease-out'
          }}
        >
          {/* Mensagem flutuante */}
          <div 
            className={`absolute bottom-full right-0 mb-4 px-4 py-3 bg-white rounded-xl shadow-xl border border-gray-200 transition-all duration-300 after:content-[''] after:absolute after:top-full after:right-6 after:w-0 after:h-0 after:border-l-8 after:border-r-8 after:border-t-8 after:border-l-transparent after:border-r-transparent after:border-t-white ${
              showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{
              minWidth: '200px',
              pointerEvents: showMessage ? 'auto' : 'none'
            }}
          >
            <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {welcomeMessages[currentMessage]}
            </p>
            <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">JotaNunes Assistant</span>
            </div>
          </div>

          {/* Botão principal */}
          <button
            onClick={toggleChat}
            className={`relative h-16 w-16 rounded-full shadow-lg transition-all duration-500 ease-out text-white text-2xl flex items-center justify-center hover:scale-110 ${
              showMessage ? 'animate-chatbot-jump' : 'animate-chatbot-float'
            }`}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: showMessage 
                ? '0 0 40px rgba(239, 68, 68, 0.6)' 
                : '0 10px 30px -10px rgba(239, 68, 68, 0.4)'
            }}
          >
            {/* Efeito de pulso */}
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.3), transparent)'
              }}
            ></div>
            
            {/* Ícone do Robô - Fluent Emoji by Microsoft */}
            <svg className="w-10 h-10 relative z-10" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Corpo principal (roxo/rosa gradiente) */}
              <rect x="12" y="20" width="40" height="36" rx="10" fill="url(#robotGradient)"/>
              
              {/* Alça amarela no topo */}
              <rect x="22" y="12" width="20" height="8" rx="4" fill="#F4A62A"/>
              
              {/* Antenas laterais (azul como os olhos) */}
              <circle cx="12" cy="18" r="4" fill="#4FC3F7"/>
              <rect x="10" y="18" width="4" height="28" rx="2" fill="#4FC3F7"/>
              <circle cx="52" cy="18" r="4" fill="#4FC3F7"/>
              <rect x="50" y="18" width="4" height="28" rx="2" fill="#4FC3F7"/>
              
              {/* Visor escuro */}
              <rect x="18" y="28" width="28" height="14" rx="7" fill="#3D2C5F"/>
              
              {/* Olhos azuis */}
              <rect x="24" y="32" width="6" height="10" rx="3" fill="#4FC3F7"/>
              <rect x="34" y="32" width="6" height="10" rx="3" fill="#4FC3F7"/>
              
              {/* Boca */}
              <rect x="26" y="48" width="12" height="4" rx="2" fill="#3D2C5F"/>
              
              <defs>
                <linearGradient id="robotGradient" x1="32" y1="20" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E1BEE7"/>
                  <stop offset="1" stopColor="#CE93D8"/>
                </linearGradient>
              </defs>
            </svg>

            {/* Bolinha verde do online */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </button>
        </div>
      )}

      {/* Janela do chatbot */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out animate-scale-in ${
            isFullscreen
              ? "inset-0"
              : "bottom-6 right-6 w-96 h-[500px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]"
          }`}
        >
          <div
            className={`h-full flex flex-col bg-white shadow-2xl border ${
              isFullscreen ? "rounded-none" : "rounded-2xl"
            }`}
          >
            {/* Cabeçalho */}
            <div 
              className="flex items-center justify-between p-4 border-b rounded-t-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-chatbot-pulse">
                  <svg className="w-7 h-7" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="20" width="40" height="36" rx="10" fill="url(#robotGradient2)"/>
                    <rect x="22" y="12" width="20" height="8" rx="4" fill="#F4A62A"/>
                    <circle cx="12" cy="18" r="4" fill="#4FC3F7"/>
                    <rect x="10" y="18" width="4" height="28" rx="2" fill="#4FC3F7"/>
                    <circle cx="52" cy="18" r="4" fill="#4FC3F7"/>
                    <rect x="50" y="18" width="4" height="28" rx="2" fill="#4FC3F7"/>
                    <rect x="18" y="28" width="28" height="14" rx="7" fill="#3D2C5F"/>
                    <rect x="24" y="32" width="6" height="10" rx="3" fill="#4FC3F7"/>
                    <rect x="34" y="32" width="6" height="10" rx="3" fill="#4FC3F7"/>
                    <rect x="26" y="48" width="12" height="4" rx="2" fill="#3D2C5F"/>
                    <defs>
                      <linearGradient id="robotGradient2" x1="32" y1="20" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#E1BEE7"/>
                        <stop offset="1" stopColor="#CE93D8"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Assistente Virtual JotaNunes</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs text-white text-opacity-90">Online agora</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-colors text-white text-lg"
                >
                  {isFullscreen ? "🗗" : "🗖"}
                </button>
                <button
                  onClick={toggleChat}
                  className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-colors text-white text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex animate-fade-in ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === "user"
                          ? "bg-red-500 text-white shadow-lg"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <PersonIcon className="w-5 h-5 text-black" />
                      ) : (
                        <svg className="w-6 h-6" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="12" y="20" width="40" height="36" rx="10" fill="url(#robotGradient3)"/>
                          <rect x="22" y="12" width="20" height="8" rx="4" fill="#F4A62A"/>
                          <circle cx="12" cy="18" r="4" fill="#4FC3F7"/>
                          <rect x="10" y="18" width="4" height="28" rx="2" fill="#4FC3F7"/>
                          <circle cx="52" cy="18" r="4" fill="#4FC3F7"/>
                          <rect x="50" y="18" width="4" height="28" rx="2" fill="#4FC3F7"/>
                          <rect x="18" y="28" width="28" height="14" rx="7" fill="#3D2C5F"/>
                          <rect x="24" y="32" width="6" height="10" rx="3" fill="#4FC3F7"/>
                          <rect x="34" y="32" width="6" height="10" rx="3" fill="#4FC3F7"/>
                          <rect x="26" y="48" width="12" height="4" rx="2" fill="#3D2C5F"/>
                          <defs>
                            <linearGradient id="robotGradient3" x1="32" y1="20" x2="32" y2="56" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#E1BEE7"/>
                              <stop offset="1" stopColor="#CE93D8"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.sender === "user"
                          ? "text-white rounded-br-md"
                          : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                      }`}
                      style={
                        message.sender === "user" 
                          ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)' }
                          : {}
                      }
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.sender === "user"
                            ? "text-white text-opacity-80"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Campo de entrada */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-500 focus:ring-opacity-20 outline-none text-gray-800 placeholder-gray-500 transition-all"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="rounded-2xl h-12 w-12 flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg"
                  style={{ 
                    background: inputText.trim() 
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                      : '#9ca3af'
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fundo escuro no modo fullscreen */}
      {isOpen && isFullscreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          style={{
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}
