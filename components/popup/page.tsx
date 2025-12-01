"use client";

import { useState, useRef, useEffect } from "react";
import RobotIcon from "./RobotIcon";

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
  const [isHidden, setIsHidden] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // ⭐ POSIÇÃO INICIAL (0,0) e só depois define
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // ⭐ O chatbot só aparece depois da posição final estar calculada
  const [isReady, setIsReady] = useState(false);

  // Ajusta a posição no canto inferior direito
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 100,
      y: window.innerHeight - 120,
    });

    setIsReady(true);
  }, []);

  // DRAG CORE
  const dragRef = useRef<HTMLButtonElement>(null);
  const isDragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // Scroll automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Primeira mensagem automática
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

  // Balão flutuante
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

  // Limpeza de frame vindo do n8n
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

  // Envio de mensagem
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

  // Abrir e fechar chat
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

  // ⭐ DRAG FUNCIONAL COM TIPAGEM PERFEITA
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      moved.current = false;

      const startX =
        e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
      const startY =
        e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;

      const rect = el.getBoundingClientRect();

      offset.current = {
        x: startX - rect.left,
        y: startY - rect.top,
      };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;

      const moveX =
        e instanceof TouchEvent ? e.touches[0].clientX : e.clientX;
      const moveY =
        e instanceof TouchEvent ? e.touches[0].clientY : e.clientY;

      const newX = moveX - offset.current.x;
      const newY = moveY - offset.current.y;

      if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
        moved.current = true;
      }

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
  }, [isOpen, position]);

  return (
    <>
      {/* BOTÃO FLUTUANTE */}
      {!isOpen && isReady && !isHidden && (
        <div
          className="fixed z-50"
          style={{
            left: position.x,
            top: position.y,
            transition: isDragging.current ? "none" : "all 0.3s ease",
            transform: showMessage
              ? "translateY(-12px) scale(1.1)"
              : "translateY(0) scale(1)",
          }}
        >
          {/* Botão fechar (oculta o ícone até recarregar a página) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsHidden(true);
            }}
            title="Fechar"
            aria-label="Fechar assistente"
            className="absolute -top-6 -left-6 h-8 w-8 bg-white rounded-full shadow flex items-center justify-center text-sm z-50 pointer-events-auto"
          >
            ✕
          </button>
          {/* Mensagem flutuante */}
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
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-600">JotaNunes Assistant</span>
            </div>
          </div>

          {/* BOTÃO PRINCIPAL */}
          <button
            ref={dragRef}
            onClick={() => {
              if (!moved.current) toggleChat();
            }}
            className={`relative h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg text-white text-2xl flex items-center justify-center transition-all hover:scale-110 ${
              !isReady
                ? "opacity-0"
                : showMessage
                ? "animate-chatbot-jump"
                : "animate-chatbot-float"
            }`}
            style={{
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
            }}
          >
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background:
                  "radial-gradient(circle, rgba(239, 68, 68, 0.3), transparent)",
              }}
            />

            <RobotIcon className="w-8 h-8 relative z-10" />

            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* JANELA DO CHAT */}
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
            className={`h-full flex flex-col bg-white shadow-2xl border border-gray-200 ${
              isFullscreen ? "rounded-none" : "rounded-2xl"
            }`}
            style={{ overflow: "hidden" }}
          >
            {/* HEADER */}
            <div
              className="flex items-center justify-between p-4 border-b text-white rounded-t-2xl"
              style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-chatbot-pulse">
                  <RobotIcon className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="font-semibold text-sm sm:text-base">
                    Assistente Virtual JotaNunes
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-xs">Online agora</p>
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

            {/* MENSAGENS */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  {message.sender === "bot" && (
                    <div className="flex items-end">
                      <div className="mr-3 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        <RobotIcon className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col min-w-0 ${message.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`p-3 sm:p-4 rounded-2xl ${
                        message.sender === "user"
                          ? "max-w-[90%] text-white shadow-md"
                          : "max-w-[80%] bg-white border border-gray-200 text-gray-800 shadow-sm"
                      }`}
                      style={
                        message.sender === "user"
                          ? { background: "linear-gradient(135deg, #ef4444, #dc2626)" }
                          : {}
                      }
                    >
                      <p className="leading-relaxed break-normal whitespace-pre-wrap">{message.text}</p>
                    </div>

                    <div className={`text-xs text-gray-400 mt-1 ${message.sender === "user" ? "mr-1" : "ml-1"}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>

                  {message.sender === "user" && (
                    <div className="flex items-end">
                      <div className="ml-3 w-9 h-9 rounded-full bg-red-600 flex items-center justify-center shadow-sm">
                        {/* Ícone de usuário com gravata: silhueta branca e gravata vermelha */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                          <g fill="white">
                            <circle cx="12" cy="7" r="3" />
                            <path d="M4 20c0-3.3137 3.582-6 8-6s8 2.6863 8 6v1H4v-1z" />
                          </g>
                          <path fill="#ef4444" d="M11 11.5l1 3 1-3 1.5 1.5-2.5 2.5-2.5-2.5L11 11.5z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT MODIFICADO (placeholder preto, texto preto, borda preta fina) */}
            <div className="p-4 border-t border-gray-200 flex gap-2 bg-white">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 rounded-2xl px-4 py-3 outline-none
                           placeholder-black text-black border border-black/40"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                aria-label="Enviar mensagem"
                title="Enviar"
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 shadow-lg"
                style={{
                  background: inputText.trim()
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "#a3a3a3",
                }}
              >
                {/* Ícone SVG substitui o caractere ➤ — usa `currentColor` para herdar a cor do botão */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  {/* Triângulo preenchido apontando para a direita, visual próximo ao emoji ➤ */}
                  <polygon points="6,4 18,12 6,20" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fundo do fullscreen */}
      {isOpen && isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}