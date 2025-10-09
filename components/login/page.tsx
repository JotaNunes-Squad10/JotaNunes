/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

const BG_VIDEO_1 = "/img/videobackground.mp4";   
const BG_VIDEO_2 = "/img/videobackground2.mp4";  
const BG_IMAGE = "/img/background.png";
const LOGO_IMAGE = "/img/LogoPreta.png";

export default function JotanunesLogin() {
  const [showSupport, setShowSupport] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [videoSrc, setVideoSrc] = useState(BG_VIDEO_1);

  useEffect(() => {
    const updateVideo = () => {
      if (window.innerWidth < 1024) {
        setVideoSrc(BG_VIDEO_2); 
      } else {
        setVideoSrc(BG_VIDEO_1); 
      }
    };

    updateVideo(); 
    window.addEventListener("resize", updateVideo);
    return () => window.removeEventListener("resize", updateVideo);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const _axios = axios.create({
      baseURL: "https://jotanunesservice.onrender.com", 
      timeout: 10000,
    });
    toast.promise(
      _axios.post("/api/v1/authentication/Authenticate", {
        username: username,
        password: senha,
      }).then((response) => {
  const token = response?.data?.data?.accessToken?.trim();
        if (!token || typeof token !== "string") {
          console.error("Token inválido ou não é uma string:", token);
        }
        interface JwtPayload {
          groups?: string[];
        }
        try {
          const payload = jwtDecode<JwtPayload>(token);
          setCookie("accessToken", token);
          if (payload.groups?.includes("Administrador")) {
            router.push("/adm");
          } else {
            router.push("/dashboard");
          }
          return Promise.resolve();
        } catch (err) {
          console.error("Erro ao decodificar JWT:", err);
          return Promise.reject(new Error("Token inválido"));
        }
      }),
      {
        pending: {
          render() {
            return "Autenticando...";
          },
        },
        success: {
          render() {
            return "Login realizado com sucesso!";
          },
        },
        error: {
          render() {
            return "Usuário ou senha inválidos!";
          },
        },
      }
    );
  };

  return (
    <main
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      <ToastContainer theme="colored" />
      {/* Vídeo de fundo */}
      <video
        key={videoSrc} 
        className="absolute top-0 left-0 h-full w-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Logo + Formulário */}
      <section className="relative z-10 flex min-h-screen w-full items-center justify-center md:justify-end md:pr-10">
        <div className="w-full max-w-md rounded-xl px-6 py-10 md:px-8 bg-white/5 backdrop-blur-md">                  
          <div className="mb-10 flex justify-center">
            <img
              src={LOGO_IMAGE}
              alt="Logo Jotanunes"
              className="max-h-44 object-contain"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Usuário
              </label>
              <input 
                type="text"
                inputMode="text"
                placeholder="Digite o nome do usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300/50 bg-white/70 px-3 py-2.5 text-[15px] outline-none ring-2 ring-transparent transition focus:border-neutral-400 focus:ring-red-100 text-neutral-800 placeholder-neutral-500 shadow-md"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-300/50 bg-white/70 px-3 py-2.5 text-[15px] pr-10 outline-none ring-2 ring-transparent transition focus:border-neutral-400 focus:ring-red-100 text-neutral-800 placeholder-neutral-500 shadow-md"
                />
                <button
                  type="button"                  
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm text-neutral-700 hover:text-neutral-900"
                >                  
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-blue-700 hover:underline"
                  onClick={() => setShowSupport(true)}
                >
                  Problemas com o Login?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-red-700 px-4 py-2.5 text-base font-semibold text-white shadow-md transition hover:bg-red-600 active:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Entrar
            </button>
          </form>
        </div>
      </section>

      {/* Modal de Suporte */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fundo translúcido para destacar o modal, mas permitindo ver o fundo */}
          <div className="absolute inset-0"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[320px] flex flex-col items-center border border-gray-200">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowSupport(false)}
              aria-label="Fechar"
            >                                           
              ×
            </button>
            <h2 className="text-lg font-bold mb-2 text-gray-800">Problemas com o Login?</h2>
            <p className="mb-4 text-sm text-gray-600 text-center">Entre em contato para resetar sua senha ou resolver problemas de login:</p>
            <div className="flex flex-col gap-2 w-full items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Telefone:</span>
                <a href="tel:+5511999999999" className="text-blue-700 hover:underline">(11) 99999-9999</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">E-mail:</span>
                <a href="mailto:suporte@jotanunes.com" className="text-blue-700 hover:underline">suporte@jotanunes.com</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}