"use client";

import Header from "../../components/headerUser/page";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Empreendimento,
  empreendimentoService,
  DocumentoService,
} from "@/lib/api";

function PdfEmpreendimentoContent() {

  const searchParams = useSearchParams();
  const idParam = searchParams?.get("id") ?? null;

  const [empreendimento, setEmpreendimento] = useState<Empreendimento | null>(null);
  const [documentoAtual, setDocumentoAtual] = useState<string | null>(null);

  useEffect(() => {
    if (!idParam) {
      toast.error("Nenhum ID foi informado.");
      return;
    }

    async function fetchEmpreendimentoById() {
      try {
        const all = await empreendimentoService.getAllEmpreendimento();
        const encontrado = all.find(e => String(e.id) === String(idParam));

        if (!encontrado) {
          toast.error("Erro ao buscar empreendimento.");
          return;
        }

        setEmpreendimento(encontrado);

        try {
          const doc = await DocumentoService.generateDocumento({
            id: String(encontrado.id),
            version: encontrado.versao,
          });

          setDocumentoAtual(doc.data);

        } catch {
          toast.error("Erro ao abrir o PDF do empreendimento.");
        }

      } catch {
        toast.error("Erro ao carregar empreendimento.");
      }
    }

    fetchEmpreendimentoById();
  }, [idParam]);

  return (
    <div>
      <ToastContainer autoClose={2000} theme="colored" />

      <div className="mt-8 mx-4 md:mx-10 flex flex-col justify-between gap-6">

        {idParam && !empreendimento && (
          <p className="text-gray-600 text-lg">
            Procurando empreendimento...
          </p>
        )}

        {/* PDF */}
        {empreendimento && documentoAtual && (
          <div className="flex flex-col gap-4">

            <h2 className="text-lg md:text-xl font-bold text-center">
              {empreendimento.nome} — Versão {empreendimento.versao}
            </h2>

            <iframe
              className="w-full h-[60vh] sm:h-[70vh] md:h-[80vh] border rounded max-w-full"
              src={`data:application/pdf;base64,${documentoAtual}`}
              title="PDF do Empreendimento"
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default function PdfEmpreendimento() {
  return (
    <div>
      <Header />
      <Suspense fallback={
        <div className="mt-8 mx-4 md:mx-10">
          <p className="text-gray-600 text-lg">Carregando...</p>
        </div>
      }>
        <PdfEmpreendimentoContent />
      </Suspense>
    </div>
  );
}
