/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";

const BG_IMAGE = "/img/background.png";
const LOGO_IMAGE = "/img/LogoPreta.png";


export default function JotanunesLogin() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      <section className="relative flex min-h-screen w-full items-center justify-center md:justify-end md:pr-10">
        <div className="z-10 w-full max-w-md rounded-xl px-6 py-10 md:px-8">
          <div className="mb-10 flex justify-center">
            <img
              src={LOGO_IMAGE}
              alt="Logo Jotanunes"
              className="max-h-44 object-contain"
            />
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Usuário
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Digite sua matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
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
                  className="w-full rounded-lg border border-neutral-300/50 bg-white/70 px-3 py-2.5 text-[15px] pr-10 outline-none ring-2 ring-transparent transition focus:border-neutral-400 focus:ring-red-100 text-neutral-800 placeholder-neutral-500 shadow-md"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm text-neutral-700 hover:text-neutral-900"
                >
                  {showPass ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <div className="mt-2 text-right">
                <a
                  href="#"
                  className="text-sm font-medium text-blue-500 hover:underline"
                >
                  Suporte
                </a>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-red-700 px-4 py-2.5 text-base font-semibold text-white shadow-md transition hover:bg-red-600 active:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 "
            >
              Entrar
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
