"use client";

import { useRouter } from "next/navigation";
import { empreendimentoService } from "@/lib/api";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

export function useCopiarEmpreendimento() {
  const router = useRouter();

  async function getUserProfile(): Promise<number | null> {
  try {
    const token = await getCookie("accessToken"); // <--- AQUI: await

    if (!token || typeof token !== "string") return null;

    const decoded: any = jwtDecode(token);
    const grupo = decoded.groups?.[0];

    const mapPerfil: Record<string, number> = {
      Administrador: 1,
      Gestor: 2,
      Operador: 3,
    };

    return mapPerfil[grupo] ?? null;
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    return null;
  }
}


  function converterPadrao(padrao: string | number) {
    if (typeof padrao === "number") return padrao;

    const tabela: Record<string, number> = {
      RESIDENCE: 1,
      "MAIS VIVER": 2,
      "VIDA BELA": 3,
    };

    return tabela[padrao.toUpperCase()] ?? 1;
  }

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

  async function buscarEmpreendimentoPorId(id: string) {
    try {
      const response = await empreendimentoService.getEmpreendimentoById(id);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar empreendimento:", error);
    }
  }

  async function buscarEmpreendimentoPorVersao(id: string, versao: number) {
    try {
      const response = await empreendimentoService.getEmpreendimentoByVersion(id, versao);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar empreendimento pela versão:", error);
    }
  }

  async function copiarEmpreendimento(id: string) {
    try {
      // -------- PERMISSÃO --------
      const perfil = await getUserProfile();

      if (perfil !== 1 && perfil !== 3) {
        console.warn("Usuário não possui permissão para copiar empreendimento.");
        return; // bloqueia
      }
      // ---------------------------

      const info = await buscarEmpreendimentoPorId(id);
      if (!info) return;

      const versaoAtual = info.versao;
      const empreendimentoDaVersao = await buscarEmpreendimentoPorVersao(id, versaoAtual);
      if (!empreendimentoDaVersao) return;

      const objetoParaCriacao = montarObjetoParaCriacao(empreendimentoDaVersao);

      const criado = await empreendimentoService.createEmpreendimento(objetoParaCriacao);

      const novoId = criado.data?.id ?? criado.id ?? null;

      if (novoId) {
        router.push(`/empreendimento/${novoId}`);
      }
    } catch (error) {
      console.error("Erro ao copiar empreendimento:", error);
    }
  }

  return { copiarEmpreendimento };
}