"use client";

import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";
import TabelaItens from "./ViewMateralsDocument/page";
import ObservationDocument from "./ObservationDocument/page";
import { Toast } from "primereact/toast";
import {
  DocumentoService,
  UpdateEmpreendimento,
  topicoService,
  subTopicosAmbienteService,
  MarcaMateriais,
  marcaService,
} from "@/lib/api";

/**
 * EmpreendimentoEditor/page.tsx
 *
 * Versão corrigida e completa do componente principal:
 * - carrega documento
 * - edita localmente (add / remove) com optimistic updates
 * - monta payload defensivo compatível com a API
 * - faz PUT (updateEmpreendimento) e faz rollback em caso de falha
 * - exibe toasts para sucesso/erro/aviso
 *
 * Observações:
 * - A API mostrou-se sensível a fields nulos; por isso garantimos arrays vazios em vez de null.
 * - Se o backend eventualmente exigir `topicoMateriais: null` especificamente, adapte a função buildPayloadForApi.
 */

interface EmpreendimentoEditorProps {
  documentId: string;
}

export default function EmpreendimentoEditor({
  documentId,
}: EmpreendimentoEditorProps) {
  const [ambienteSelecionado, setAmbienteSelecionado] = useState<string>("");
  const [itemAmbienteSelecionado, setItemAmbienteSelecionado] =
    useState<string>("");
  const [empreendimento, setEmpreendimento] = useState<
    UpdateEmpreendimento | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useRef<Toast | null>(null);
  const [marcaMaterial, setMarcaMaterial] = useState<MarcaMateriais[]>([]);

  // Get de Marcas Material
  useEffect(() => {
    const getMarcaMaterial = async () => {
      try {
        const response = await marcaService.getAllMarcaMateriais();
        setMarcaMaterial(response);
      } catch (error) {
        console.error(error);
      }
    };

    getMarcaMaterial();
  }, []);

  /**
   * buildPayloadForApi
   * Recebe estado local e retorna um payload estritamente compatível com o contrato esperado pela API.
   * Garante:
   * - campos numéricos como number
   * - strings não-nulas
   * - topicoMateriais como array (não null) — a API já respondeu que espera o campo presente
   */
  const buildPayloadForApi = (
    doc: UpdateEmpreendimento
  ): UpdateEmpreendimento => {
    const padraoNumber = Number(doc.padrao) || 1;

    const empreendTopicos =
      (doc.empreendimentoTopicos || []).map((t: any, ti: number) => {
        const topicoAmbientes =
          (t.topicoAmbientes || []).map((a: any, ai: number) => ({
            ambienteId: Number(a.ambienteId),
            area: a.area ?? 0,
            posicao: a.posicao ?? ai + 1,
            ambienteItens:
              (a.ambienteItens || []).map((it: any) => ({
                itemId: Number(it.itemId),
              })) || [],
          })) || [];

        // Mantemos array (mesmo que vazio). Se a API quiser null, alterar aqui.
        const topicoMateriais =
          Array.isArray(t.topicoMateriais) && t.topicoMateriais.length > 0
            ? t.topicoMateriais.map((m: any) => ({
                materialId: Number(m.materialId),
                ...(m.versoes ? { versoes: m.versoes } : {}),
              }))
            : [];

        return {
          topicoId: Number(t.topicoId),
          posicao: t.posicao ?? ti + 1,
          topicoAmbientes,
          topicoMateriais,
        };
      }) || [];

    return {
      id: doc.id,
      nome: doc.nome ?? "",
      descricao: doc.descricao ?? "",
      localizacao: doc.localizacao ?? "",
      tamanhoArea: Number(doc.tamanhoArea) || 0,
      padrao: padraoNumber,
      empreendimentoTopicos: empreendTopicos as any,
    };
  };

  // Carrega documento ao montar / quando documentId mudar
  useEffect(() => {
    let mounted = true;
    const loadDocument = async () => {
      try {
        setLoading(true);
        const documentData = await DocumentoService.getDocumentoById(
          documentId
        );
        if (!documentData) {
          if (mounted) setEmpreendimento(undefined);
          return;
        }

        // Normaliza o documento recebido para o formato UpdateEmpreendimento
        const normalized: UpdateEmpreendimento = {
          id: documentData.id,
          nome: documentData.nome ?? "",
          descricao: documentData.descricao ?? "",
          localizacao: documentData.localizacao ?? "",
          tamanhoArea: Number(documentData.tamanhoArea) || 0,
          padrao: Number(documentData.padrao) || 1,
          empreendimentoTopicos:
            (documentData.empreendimentoTopicos || []).map(
              (t: any, ti: number) => ({
                topicoId: Number(t.topicoId),
                posicao: t.posicao ?? ti + 1,
                topicoAmbientes:
                  (t.topicoAmbientes || []).map((a: any, ai: number) => ({
                    ambienteId: Number(a.ambienteId),
                    area: a.area ?? 0,
                    posicao: a.posicao ?? ai + 1,
                    ambienteItens:
                      (a.ambienteItens || []).map((it: any) => ({
                        itemId: Number(it.itemId),
                      })) || [],
                  })) || [],
                topicoMateriais:
                  Array.isArray(t.topicoMateriais) &&
                  t.topicoMateriais.length > 0
                    ? t.topicoMateriais.map((m: any) => ({
                        materialId: Number(m.materialId),
                        versoes: m.versoes || [],
                      }))
                    : [],
              })
            ) || [],
        };

        if (mounted) setEmpreendimento(normalized);
      } catch (error) {
        console.error("Erro ao carregar documento:", error);
        toast.current?.show?.({
          severity: "error",
          summary: "Erro",
          detail: "Falha ao carregar documento.",
          life: 4000,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDocument();
    return () => {
      mounted = false;
    };
  }, [documentId]);

  // Atualiza campos simples (nome, localizacao, ...)
  const updateEmpreendimento = (
    field: keyof UpdateEmpreendimento,
    value: any
  ) => {
    setEmpreendimento((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  /**
   * handleAddItems
   * - ids: array de ids a adicionar
   * - topicoId / ambienteId: onde adicionar
   *
   * Fluxo:
   *  - snapshot (before) para rollback
   *  - aplica alteração no clone (optimistic)
   *  - atualiza state local imediatamente
   *  - monta payload defensivo e chama API
   *  - em sucesso: atualiza state com o payload retornado (ou mantem clone)
   *  - em erro: faz rollback e mostra toast
   */
  const handleAddItems = async (
    ids: number[],
    topicoId: number,
    ambienteId: number
  ) => {
    if (!empreendimento) return;
    if (!Array.isArray(ids) || ids.length === 0) return;

    const before = JSON.parse(
      JSON.stringify(empreendimento)
    ) as UpdateEmpreendimento;
    const clone = JSON.parse(
      JSON.stringify(empreendimento)
    ) as UpdateEmpreendimento;

    if (!Array.isArray(clone.empreendimentoTopicos))
      clone.empreendimentoTopicos = [];

    let topico = clone.empreendimentoTopicos.find(
      (t) => Number(t.topicoId) === Number(topicoId)
    ) as any;

    if (!topico) {
      topico = {
        topicoId: Number(topicoId),
        posicao: (clone.empreendimentoTopicos || []).length + 1,
        topicoAmbientes: [],
        topicoMateriais: [],
      };
      clone.empreendimentoTopicos.push(topico);
    }

    let ambiente = (topico.topicoAmbientes || []).find(
      (a: any) => Number(a.ambienteId) === Number(ambienteId)
    ) as any;

    if (!ambiente) {
      ambiente = {
        ambienteId: Number(ambienteId),
        area: 0,
        posicao: (topico.topicoAmbientes || []).length + 1,
        ambienteItens: [],
      };
      topico.topicoAmbientes = [...(topico.topicoAmbientes || []), ambiente];
    }

    const existentes = (ambiente.ambienteItens || []).map((i: any) =>
      Number(i.itemId)
    );
    const novos = ids.filter((id) => !existentes.includes(Number(id)));
    if (novos.length === 0) {
      toast.current?.show?.({
        severity: "warn",
        summary: "Aviso",
        detail: "Nenhum item novo para adicionar.",
        life: 2500,
      });
      return;
    }

    ambiente.ambienteItens = [
      ...(ambiente.ambienteItens || []),
      ...novos.map((id) => ({ itemId: Number(id) })),
    ];

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);

    try {
      setLoading(true);
      console.log("📤 Payload enviado (PUT):", payload);
      await DocumentoService.updateEmpreendimento(payload);
      // no retorno da API o backend não envia o recurso atualizado completo (depende do backend).
      // Para manter o state consistente com o que foi enviado:
      setEmpreendimento(payload);
      toast.current?.show?.({
        severity: "success",
        summary: "Sucesso",
        detail: "Itens adicionados ao documento!",
        life: 3000,
      });
    } catch (err) {
      console.error("❌ Erro ao salvar (add):", err);
      setEmpreendimento(before); // rollback
      toast.current?.show?.({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao salvar alterações (adição). Revertendo.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleRemoveItem
   * - optimistic update + PUT + rollback em erro
   */
  const handleRemoveItem = async (
    itemId: number,
    topicoId: number,
    ambienteId: number
  ) => {
    if (!empreendimento) return;

    const before = JSON.parse(
      JSON.stringify(empreendimento)
    ) as UpdateEmpreendimento;
    const clone = JSON.parse(
      JSON.stringify(empreendimento)
    ) as UpdateEmpreendimento;

    const topico = (clone.empreendimentoTopicos || []).find(
      (t: any) => Number(t.topicoId) === Number(topicoId)
    ) as any;

    if (!topico) {
      toast.current?.show?.({
        severity: "warn",
        summary: "Aviso",
        detail: "Tópico não encontrado no documento.",
        life: 3000,
      });
      return;
    }

    const ambiente = (topico.topicoAmbientes || []).find(
      (a: any) => Number(a.ambienteId) === Number(ambienteId)
    ) as any;

    if (!ambiente) {
      toast.current?.show?.({
        severity: "warn",
        summary: "Aviso",
        detail: "Ambiente não encontrado no documento.",
        life: 3000,
      });
      return;
    }

    ambiente.ambienteItens = (ambiente.ambienteItens || []).filter(
      (i: any) => Number(i.itemId) !== Number(itemId)
    );

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);

    try {
      setLoading(true);
      console.log("📤 Payload enviado (PUT):", payload);
      await DocumentoService.updateEmpreendimento(payload);
      setEmpreendimento(payload);
      toast.current?.show?.({
        severity: "info",
        summary: "Removido",
        detail: "Item removido com sucesso!",
        life: 3000,
      });
    } catch (err) {
      console.error("❌ Erro ao salvar (remove):", err);
      setEmpreendimento(before); // rollback
      toast.current?.show?.({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao remover item no servidor. Revertendo.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!empreendimento) {
    return <div className="p-4 text-center">Carregando documento...</div>;
  }

  return (
    <div className="min-h-screen">
      <Toast ref={toast} />
      <Header />
      <CustomSidebarComponent
        ambienteSelecionado={ambienteSelecionado}
        setAmbienteSelecionado={setAmbienteSelecionado}
        itemAmbienteSelecionado={itemAmbienteSelecionado}
        setItemAmbienteSelecionado={setItemAmbienteSelecionado}
      />

      <div className="pt-30 flex justify-center w-full">
        <div className="flex flex-col w-full max-screen-lg px-4 lg:w-[60%]">
          <FormEmpreendimento
            empreendimento={empreendimento}
            updateEmpreendimento={updateEmpreendimento}
          />

          <AddedItemsInDocument
            ambienteSelecionado={ambienteSelecionado}
            setAmbienteSelecionado={setAmbienteSelecionado}
            itemAmbienteSelecionado={itemAmbienteSelecionado}
            setItemAmbienteSelecionado={setItemAmbienteSelecionado}
            empreendimento={empreendimento}
            itensDocumento={[]} // o componente lê do empreendimento
            itemMarcaMateriais={marcaMaterial}
            onAddItems={handleAddItems}
          />

          <div className="w-full overflow-x-auto">
            <TabelaItens
              empreendimento={empreendimento}
              topicoSelecionado={ambienteSelecionado}
              ambienteSelecionado={itemAmbienteSelecionado}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <ObservationDocument />
        </div>
      </div>
      <footer className="mb-10"></footer>
    </div>
  );
}
