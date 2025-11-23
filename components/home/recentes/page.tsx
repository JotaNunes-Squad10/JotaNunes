"use client";
import { Newspaper } from 'lucide-react';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Documento {
  id: number;
  nome: string;
  descricao: string;
  padrao: string;
  versao: number;
}

export default function Recentes() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    axios.get("https://jotanunesservice.onrender.com/api/v1/empreendimento/GetAllEmpreendimentos")
      .then((res) => {
      const lista = Array.isArray(res.data) ? res.data : res.data.data;
      setDocumentos(lista || []);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar documentos recentes:", err);
      let erro ="Erro ao consultar o arquivos recentes. Tente mais tarde ou entre em contato com o suporte. " + err ;
      setError(erro);
      setLoading(false);
    });
  }, []);

  const router = useRouter();

  return (

    <>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold">Editados Recentemente</span>
        <button onClick={() => router.push("/statusTabela")} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-red-700 transition cursor-pointer">
          Ver Todos
          <svg 
            width="18" 
            height="18" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Lista de documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? 
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 border border-gray-200 rounded-lg p-5 h-[200px] w-full animate-pulse flex flex-col gap-4"
              >
                <div className="w-10 h-10 bg-gray-300 rounded" />
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))
          : documentos.slice(0, 6).map((r) => (
          <div
            key={r.id}
            className="bg-gray-50 flex flex-col items-start border border-gray-200 rounded-lg p-5 h-[200px] min-w-[200px] w-full"
          >
            {/* Ícone de notícias (SVG) */}
            <Newspaper color="red" size={30} strokeWidth={1} />
            <div>
              <div className="font-semibold text-base">{r.nome}</div>

              <div className="text-sm text-gray-400">
                <span>Padrão:</span> {r.padrao}</div>

              <div className="text-sm text-gray-400">
                <span>Descrição:</span> 
                {r.descricao.length > 80 ? r.descricao.slice(0, 80) + "..." : r.descricao}</div>
              
              <div className="text-sm text-gray-400">Ultima versão: {r.versao}</div>
            </div>
          </div>
          ))}  
      </div>
    </>
  );
}