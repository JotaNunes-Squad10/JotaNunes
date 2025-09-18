"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
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
        "http://localhost:5678/webhook-test/captarmensagem",
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
    if (!isOpen) setIsFullscreen(false);
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:scale-110 z-50 text-white text-2xl flex items-center justify-center"
        >
          💬
        </button>
      )}

      {/* Janela do chatbot */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
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
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h3 className="font-semibold">Assistente Virtual JotaNunes</h3>
                  <p className="text-xs text-red-100">Online agora</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="h-8 w-8 p-0 rounded flex items-center justify-center hover:bg-black/20 transition-colors text-lg"
                >
                  {isFullscreen ? "🗗" : "🗖"}
                </button>
                <button
                  onClick={toggleChat}
                  className="h-8 w-8 p-0 rounded flex items-center justify-center hover:bg-black/20 transition-colors text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                        message.sender === "user"
                          ? "bg-red-600 text-black"
                          : "bg-gray-200 text-black-600"
                      }`}
                    >
                      {message.sender === "user" ? "👤" : "🤖"}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-red-600 text-gray rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === "user"
                            ? "text-red-100"
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
            <div className="p-4 border-t bg-red-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-full border border-black-300 px-4 py-2 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-black placeholder-black"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 h-10 w-10 flex items-center justify-center text-red transition-colors"
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fundo escuro no modo fullscreen */}
      {isOpen && isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </>
  );
}
