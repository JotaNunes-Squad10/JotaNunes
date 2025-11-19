"use client";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useParams, useRouter } from "next/navigation";
import {
  empreendimentoService,
} from "@/lib/api";

interface Props {
  ambienteSelecionado: any;
  setAmbienteSelecionado: (value: any) => void;
}

export default function Comparacao({
}: Props) {

  const router = useRouter();

  // ------------------------------------------
  // 🔧 CONVERTER PADRÃO STRING ➝ NÚMERO
  // ------------------------------------------

  function converterPadrao(padrao: string | number) {
    if (typeof padrao === "number") return padrao;

    const tabela: Record<string, number> = {
      RESIDENCE: 1,
      "MAIS VIVER": 2,
      "VIDA BELA": 3,
    };

    return tabela[padrao.toUpperCase()] ?? 1;
  }

  // ------------------------------------------
  // 🔧 MONTAR OBJETO PARA CRIAÇÃO
  // ------------------------------------------

  function montarObjetoParaCriacao(empreendimentoOriginal: any) {
    return {
      nome: `Cópia de ${empreendimentoOriginal.nome ?? ""}`,
      descricao: empreendimentoOriginal.descricao ?? "",
      localizacao: empreendimentoOriginal.localizacao ?? "",
      tamanhoArea: empreendimentoOriginal.tamanhoArea ?? 0,
      padrao: converterPadrao(empreendimentoOriginal.padrao),

      empreendimentoTopicos:
        empreendimentoOriginal.empreendimentoTopicos?.map((topico: any) => ({
          topicoId: topico.topicoId,
          posicao: topico.posicao,

          topicoAmbientes:
            topico.topicoAmbientes?.map((amb: any) => ({
              ambienteId: amb.ambienteId,
              area: amb.area ?? 0,
              posicao: amb.posicao,
              ambienteItens:
                amb.ambienteItens?.map((i: any) => ({
                  itemId: i.itemId,
                })) ?? [],
            })) ?? [],

          topicoMateriais:
            topico.topicoMateriais?.map((m: any) => ({
              materialId: m.materialId,
            })) ?? [],
        })) ?? [],
    };
  }

  // ------------------------------------------
  // 🔍 BUSCAR POR ID
  // ------------------------------------------
  async function buscarEmpreendimentoPorId(id: number) {
    try {
      const response = await empreendimentoService.getEmpreendimentoById(
        String(id)
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar empreendimento:", error);
    }
  }

  // 🔍 BUSCAR VERSÃO CORRETA
  async function buscarEmpreendimentoPorVersao(id: number, versao: number) {
    try {
      const response = await empreendimentoService.getEmpreendimentoByVersion(
        String(id),
        versao
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar empreendimento pela versão:", error);
    }
  }

  // ------------------------------------------
  // FUNÇÃO FINAL: COPIAR APENAS PELO ID
  // ------------------------------------------
  async function copiarEmpreendimento(id: number) {
    try {
      const info = await buscarEmpreendimentoPorId(id);
      if (!info) return;

      const versaoAtual = info.versao;

      const empreendimentoDaVersao = await buscarEmpreendimentoPorVersao(
        id,
        versaoAtual
      );
      if (!empreendimentoDaVersao) return;

      const objetoParaCriacao =
        montarObjetoParaCriacao(empreendimentoDaVersao);

      const criado =
        await empreendimentoService.createEmpreendimento(
          objetoParaCriacao
        );

      console.log("Empreendimento copiado com sucesso:", criado);

      const novoId = criado.data?.id ?? criado.id ?? null;

      if (novoId) {
        router.push(`/empreendimento/${novoId}`);
      } else {
        console.error("ID do empreendimento criado não encontrado!", criado);
      }

    } catch (error) {
      console.error("Erro ao copiar empreendimento:", error);
    }
  }


  return (
    <div>
      <div className="mt-[100px] mx-10 flex flex-col justify-between gap-6">
        <div className="w-full flex gap-[20px] justify-center mb-5 flex-1">

          {/* Coluna do botão - agora clicável */}
          <div className="flex items-end">
          <button
            className="z-50 relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer shadow"
            onClick={() =>
              copiarEmpreendimento(
                "5aa5b2a6-2961-4a08-9049-71aafc9f9e22" as any
              )
            }
          >
            Copiar Empreendimento
          </button>
          </div>

        </div>
      </div>
    </div>
  );
}
