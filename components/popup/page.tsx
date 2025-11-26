"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const welcomeMessages = ["Precisa de informações? Estou online!"];

export default function AnimatedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // 🔥 Drag core
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // Posição inicial (igual ao design original)
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 100,
      y: window.innerHeight - 120,
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Primeira mensagem
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

  useEffect(() => scrollToBottom(), [messages]);

  // Mensagem flutuante
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setShowMessage(true);
        setCurrentMessage((prev) => (prev + 1) % welcomeMessages.length);

        setTimeout(() => setShowMessage(false), 4000);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Limpar iframe vindo do servidor
  const cleanReply = (raw: string) => {
    let txt = raw;

    const iframeMatch = raw.match(
      /<iframe[^>]*srcdoc="([^"]*)"[^>]*><\/iframe>/i
    );

    if (iframeMatch) {
      const parser = new DOMParser();
      const srcdoc = iframeMatch[1];
      txt =
        parser.parseFromString(srcdoc, "text/html").documentElement
          .textContent || srcdoc;
    }

    if (txt.startsWith('"') && txt.endsWith('"')) txt = txt.slice(1, -1);

    return txt.replace(/\\n/g, "\n").trim();
  };

  // Enviar mensagem
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
      const res = await fetch(
        "https://n8natos-n8n.4ecf9x.easypanel.host/webhook/captarmensagem",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage.text }),
        }
      );

      const raw = await res.text();
      const botReply = cleanReply(raw);

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text:
            botReply ||
            "Infelizmente tive um problema no processamento. Tente novamente.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Erro ao obter resposta do servidor.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Abrir/fechar chat
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

  // 🔥 DRAG FINAL COM DESIGN ORIGINAL
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      moved.current = false;

      const startX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const startY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = el.getBoundingClientRect();

      offset.current = {
        x: startX - rect.left,
        y: startY - rect.top,
      };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;

      const moveX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const moveY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const newX = moveX - offset.current.x;
      const newY = moveY - offset.current.y;

      if (
        Math.abs(newX - position.x) > 3 ||
        Math.abs(newY - position.y) > 3
      ) {
        moved.current = true;
      }

      // limites
      setPosition({
        x: Math.min(Math.max(newX, 10), window.innerWidth - 80),
        y: Math.min(Math.max(newY, 10), window.innerHeight - 80),
      });
    };

    const handleUp = () => {
      isDragging.current = false;
    };

    el.addEventListener("mousedown", handleDown);
    el.addEventListener("touchstart", handleDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);

    return () => {
      el.removeEventListener("mousedown", handleDown);
      el.removeEventListener("touchstart", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
    };
  }, [position]);

  return (
    <>
      {/* BOTÃO FLUTUANTE ORIGINAL + ARRÁSTAVEL */}
      {!isOpen && (
        <div
          ref={dragRef}
          className="fixed z-50"
          style={{
            left: position.x,
            top: position.y,
            transition: isDragging.current ? "none" : "all .3s ease",
            transform: showMessage
              ? "translateY(-12px) scale(1.1)"
              : "translateY(0) scale(1)",
          }}
        >
          {/* Mensagem flutuante ORIGINAL */}
          <div
            className={`absolute bottom-full right-0 mb-4 px-4 py-3 bg-white rounded-xl shadow-xl border border-gray-200 transition-all duration-300 ${
              showMessage
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
            style={{ minWidth: "200px" }}
          >
            <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
              {welcomeMessages[currentMessage]}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">JotaNunes Assistant</span>
            </div>
          </div>

          {/* BOTÃO ORIGINAL IGUALZINHO */}
          <button
            onClick={() => {
              if (!moved.current) toggleChat();
            }}
            className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg transition-all duration-500 text-white text-2xl flex items-center justify-center hover:scale-110 ${
              showMessage ? "animate-chatbot-jump" : "animate-chatbot-float"
            }`}
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              boxShadow: showMessage
                ? "0 0 40px rgba(239, 68, 68, 0.6)"
                : "0 10px 30px -10px rgba(239, 68, 68, 0.4)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background:
                  "radial-gradient(circle, rgba(239, 68, 68, 0.3), transparent)",
              }}
            ></div>

            🤖

            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </button>
        </div>
      )}

      {/* JANELA ORIGINAL DO CHAT (SEM ALTERAR NADA DO DESIGN) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out animate-scale-in ${
            isFullscreen
              ? "inset-0"
              : "bottom-4 right-4 w-[90vw] max-w-sm h-[70vh] max-h-[600px] sm:w-96 sm:h-[500px]"
          }`}
          style={{ overflow: "hidden" }}
        >
          <div
            className={`h-full flex flex-col bg-white shadow-2xl border ${
              isFullscreen ? "rounded-none" : "rounded-2xl"
            }`}
          >
            {/* Cabeçalho original */}
            <div
              className="flex items-center justify-between p-4 border-b rounded-t-2xl text-white"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl animate-chatbot-pulse">
                  🤖
                </div>

                <div>
                  <h3 className="font-semibold text-sm sm:text-base">
                    Assistente Virtual JotaNunes
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs text-white text-opacity-90">
                      Online agora
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white text-lg"
                >
                  {isFullscreen ? "🗗" : "🗖"}
                </button>

                <button
                  onClick={toggleChat}
                  className="h-8 w-8 rounded-lg hover:bg-white/20 flex items-center justify-center text-white text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mensagens originais */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex animate-fade-in ${
                    message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                      message.sender === "user"
                        ? "text-white"
                        : "bg-white border text-gray-800"
                    }`}
                    style={
                      message.sender === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, #ef4444, #dc2626)",
                          }
                        : {}
                    }
                  >
                    <p>{message.text}</p>
                    <p className="text-[10px] opacity-80 mt-2">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Input original */}
            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 border rounded-2xl px-4 py-3 outline-none"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shadow-lg"
                style={{
                  background: inputText.trim()
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "#a3a3a3",
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fundo escuro */}
      {isOpen && isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}
