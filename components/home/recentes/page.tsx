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
  status?: string;
  dataHoraAlteracao?: string;
}

export default function Recentes() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    axios.get("https://jotanunesservice.onrender.com/api/v1/empreendimento/GetAllEmpreendimentos")
      .then((res) => {
      const lista = Array.isArray(res.data) ? res.data : res.data.data;
      const sorted = (lista || []).slice().sort((a: { [key: string]: unknown }, b: { [key: string]: unknown }) => {
        const ta = a['dataHoraAlteracao'] ? new Date(String(a['dataHoraAlteracao'])).getTime() : 0;
        const tb = b['dataHoraAlteracao'] ? new Date(String(b['dataHoraAlteracao'])).getTime() : 0;
        return tb - ta;
      });
      setDocumentos(sorted);
      setLoading(false);
    })
    .catch(err => {
      console.error("Erro ao buscar documentos recentes:", err);
      const erro = "Erro ao consultar o arquivos recentes. Tente mais tarde ou entre em contato com o suporte. " + err;
      setError(erro);
      setLoading(false);
    });
  }, []);

  const router = useRouter();

  const navigateByStatus = (id: number, status?: string) => {
    const s = (status ?? "").toLowerCase();
    try { console.log("Recentes.navigateByStatus -> id:", id, "status:", status); } catch {}

    if (s.includes("revis")) {
      try { sessionStorage.setItem("empreendimentoSelecionado", String(id)); } catch {}
      router.push(`/docCorrecao`);
      return;
    }

    if (s.includes("pend")) {
      try { sessionStorage.setItem("empreendimentoSelecionado", String(id)); } catch {}
      router.push(`/revisao`);
      return;
    }

    if (s.includes("edit")) {
      router.push(`/empreendimento/${id}`);
      return;
    }

    if (s.includes("aprov")) {
      router.push(`/pdfEmpreendimento?id=${id}`);
      return;
    }

    router.push(`/empreendimento/${id}`);
  };

  const getStatusStyles = (status?: string): { bg: string; color: string } => {
    switch (status) {
      case "Editando":
        return { bg: "#A8E6A1", color: "#000000" };
      case "Pendente":
        return { bg: "#FFD966", color: "#000000" };
      case "Em revisão":
        return { bg: "#FF9800", color: "#ffffff" };
      case "Aprovado":
        return { bg: "#4CAF50", color: "#ffffff" };
      case "Cancelado":
        return { bg: "#F44336", color: "#ffffff" };
      default:
        return { bg: "#E5E7EB", color: "#374151" };
    }
  };

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
            : documentos
              .filter((d) => (d.status ?? "").toLowerCase() !== "cancelado")
              .slice(0, 4)
              .map((r) => (
          <div
            key={r.id}
            role="button"
            tabIndex={0}
            aria-label={`Abrir empreendimento ${r.nome}`}
            onClick={() => navigateByStatus(r.id, r.status)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') navigateByStatus(r.id, r.status); }}
            className="group bg-gray-50 hover:bg-gray-100 flex flex-col items-start border border-gray-200 rounded-lg p-5 h-[200px] min-w-[200px] w-full transition-transform transform hover:-translate-y-1 hover:shadow-sm active:scale-99 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-red-500 motion-safe:transition-transform"
          >
            {/* Ícone de notícias (SVG) */}
            <Newspaper color="currentColor" size={30} strokeWidth={1} className="text-red-500 group-hover:text-red-700 transition-colors" />
            <div>
              <div className="font-semibold text-base transition-colors group-hover:text-gray-900">{r.nome}</div>

              <div className="text-sm text-gray-400">
                <span>Padrão:</span> {r.padrao}</div>

              <div className="text-sm text-gray-400 transition-colors group-hover:text-gray-600">
                <span>Descrição:</span> 
                {r.descricao.length > 80 ? r.descricao.slice(0, 80) + "..." : r.descricao}</div>
              
              <div className="mt-2">
                {r.status ? (
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium transform transition-all group-hover:scale-105"
                    style={{
                      backgroundColor: getStatusStyles(r.status).bg,
                      color: getStatusStyles(r.status).color,
                    }}
                  >
                    {r.status}
                  </span>
                ) : (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700">Versão: {r.versao}</span>
                )}
              </div>
            </div>
          </div>
          ))}  
      </div>
    </>
  );
}