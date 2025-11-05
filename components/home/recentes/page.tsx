"use client";
import { Newspaper } from 'lucide-react';
import React, { useEffect, useState } from "react";
import axios from "axios";

/*type RecenteItem = {
  title: string;
  description: string;
};*/

interface Documento {
  id: number;
  nome: string;
  descricao: string;
  padrao: string;
  versao: number;
}

export default function Recentes() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  useEffect(() => {
    axios.get("https://jotanunesservice.onrender.com/api/v1/empreendimento/GetAllEmpreendimentos")
      .then(res => {
      // garante que seja um array
      const lista = Array.isArray(res.data) ? res.data : res.data.data;
      setDocumentos(lista || []);
    })
    .catch(err => console.error("Erro ao buscar documentos recentes:", err));
  }, []);

  return (
    <>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold">Editados Recentemente</span>
        <button className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-red-700 transition">
          Ver Todos
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Lista de documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentos.map((r) => (
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