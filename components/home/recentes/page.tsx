"use client";
import { Newspaper } from 'lucide-react';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

interface Documento {
  id: number;
  nome: string;
  descricao: string;
  padrao: string;
  versao: number;
  status?: string;
  dataHoraAlteracao?: string;
}

type RecentesProps = {
  documentos?: Documento[]; // dados vindos da página
  loading?: boolean;        // loading controlado pela página
};

export default function Recentes({ documentos: propDocumentos, loading: propLoading }: RecentesProps) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState<boolean>(propLoading ?? true);
  const [error] = useState<string | null>(null);

  // quando a página passar os documentos, ordena por data e atualiza local state
  useEffect(() => {
    if (!propDocumentos) return;

    const lista: Documento[] = Array.isArray(propDocumentos)
      ? propDocumentos
      : [];

    const sorted = lista.slice().sort((a, b) => {
      const ta = a.dataHoraAlteracao ? new Date(a.dataHoraAlteracao).getTime() : 0;
      const tb = b.dataHoraAlteracao ? new Date(b.dataHoraAlteracao).getTime() : 0;
      return tb - ta;
    });

    setDocumentos(sorted as Documento[]);
    // usa o loading controlado pela página; se não informado, assume false (dados já chegaram)
    setLoading(Boolean(propLoading ?? false));
  }, [propDocumentos, propLoading]);

  const router = useRouter();

  // PEGAR PERFIL DO TOKEN USANDO getCookie + jwtDecode
  const [perfil, setPerfil] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie("accessToken");

    if (!token || typeof token !== "string") {
      console.warn("Token não encontrado.");
      return;
    }

    try {
      interface MyJwtPayload {
        groups?: string[];
      }

      const decoded = jwtDecode<MyJwtPayload>(token);

      const grupo = decoded.groups?.[0];

      const mapPerfil: Record<string, string> = {
        Administrador: "Administrador",
        Gestor: "Gestor",
        Operador: "Operador",
      };

      setPerfil(mapPerfil[grupo ?? ""] ?? null);

    } catch (err) {
      console.error("Erro ao decodificar JWT:", err);
      toast.error("Erro na autenticação.");
    }
  }, []);

  const navigateByStatus = (id: number, status?: string) => {
    if (!perfil) return; // ainda carregando

    const s = (status ?? "").toLowerCase();
    try { console.log("Recentes.navigateByStatus -> id:", id, "status:", status); } catch {}

    const podeDocCorrecao = ["Operador", "Administrador"].includes(perfil);
    const podeRevisao = ["Gestor", "Administrador"].includes(perfil);
    const podeEmpreendimento = ["Operador", "Administrador"].includes(perfil);

    if (s.includes("revis")) {
      if (!podeDocCorrecao) return toast.warning("Usuário sem permissão para Revisar");
      sessionStorage.setItem("empreendimentoSelecionado", String(id));
      return router.push(`/docCorrecao`);
    }

    if (s.includes("pend")) {
      if (!podeRevisao) return toast.warning("Usuário sem permissão para Verificar");
      sessionStorage.setItem("empreendimentoSelecionado", String(id));
      return router.push(`/revisao`);
    }

    if (s.includes("edit")) {
      if (!podeEmpreendimento) return toast.warning("Usuário sem permissão para Editar");
      return router.push(`/empreendimento/${id}`);
    }

    if (s.includes("aprov")) {
      return router.push(`/pdfEmpreendimento?id=${id}`);
    }

    if (!podeEmpreendimento) {
      return toast.warning("Usuário sem permissão para Editar");
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
      <ToastContainer autoClose={2000} theme="colored" />
    </>
  );
}