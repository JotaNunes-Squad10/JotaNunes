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
  MarcaMateriais,
  marcaService,
} from "@/lib/api1";

/**
 * EmpreendimentoEditor/page.tsx
 *
 * - Componente completo que trata ambientes e marcas (tópicoId = 3).
 * - Todos os handlers retornam payloads compatíveis com UpdateEmpreendimentoRequest.
 * - optimistic update + rollback.
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
  const [status, setStatus] = useState<string>("");
  const [idDocumento, setIdDocumento] = useState<string>("");

  // Carrega marcas-materials (fonte para adicionar em MARCAS)
  useEffect(() => {
    const getMarcaMaterial = async () => {
      try {
        const response = await marcaService.getAllMarcaMateriais();
        setMarcaMaterial(response);
      } catch (error) {
        console.error("Erro ao buscar marca-material:", error);
      }
    };

    getMarcaMaterial();
  }, []);

  // monta payload estritamente compatível com a API
  const buildPayloadForApi = (
    doc: UpdateEmpreendimento
  ): UpdateEmpreendimento => {
    const padraoNumber = Number(doc.padrao) || 1;

    const empreendTopicos =
      (doc.empreendimentoTopicos || []).map((t: any, ti: number) => {
        // ============
        // CASO MARCAS
        // ============
        if (Number(t.topicoId) === 3) {
          return {
            topicoId: 3,
            posicao: t.posicao ?? ti + 1,
            topicoAmbientes: [], // 🔥 OBRIGATÓRIO PARA NÃO QUEBRAR A API
            topicoMateriais: Array.isArray(t.topicoMateriais)
              ? t.topicoMateriais.map((m: any) => ({
                  materialId: Number(m.materialId),
                }))
              : [],
          };
        }

        // ===========================
        // TOPICOS NORMAIS (AMBIENTES)
        // ===========================
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

        return {
          topicoId: Number(t.topicoId),
          posicao: t.posicao ?? ti + 1,
          topicoAmbientes,
          topicoMateriais:
            Array.isArray(t.topicoMateriais) && t.topicoMateriais.length > 0
              ? t.topicoMateriais.map((m: any) => ({
                  materialId: Number(m.materialId),
                  versoes: m.versoes ?? [],
                }))
              : [],
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

  // Carrega documento
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

        // Resgata o status que está o documento
        setStatus(documentData.status);
        setIdDocumento(documentData.id);

        // Normaliza a resposta em UpdateEmpreendimento (formato que usamos internamente)
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
                        materialId: Number(
                          m.materialId ?? m.material?.id ?? m.id ?? 0
                        ),
                        // se vier com 'versoes' adicione aqui: versoes: m.versoes || []
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

  // Atualiza campos simples
  const updateEmpreendimento = (
    field: keyof UpdateEmpreendimento,
    value: any
  ) => {
    setEmpreendimento((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  //
  // ADICIONAR ITENS EM AMBIENTE (tópicos com topicoAmbientes)
  //
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

    // ambienteId pode ser 0 in case of materials, but here it's for ambiente items
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
    console.log("Payload gerado (ADD ITEMS em ambiente):", payload);

    try {
      setLoading(true);
      await DocumentoService.updateEmpreendimento(payload);
      // mantém estado com o que foi enviado
      setEmpreendimento(payload);
      toast.current?.show?.({
        severity: "success",
        summary: "Sucesso",
        detail: "Itens adicionados ao documento!",
        life: 3000,
      });
    } catch (err) {
      console.error("Erro ao adicionar itens:", err);
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

  //
  // REMOVER ITEM DE AMBIENTE
  //
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
    console.log("Payload gerado (REMOVE ITEM em ambiente):", payload);

    try {
      setLoading(true);
      await DocumentoService.updateEmpreendimento(payload);
      setEmpreendimento(payload);
      toast.current?.show?.({
        severity: "info",
        summary: "Removido",
        detail: "Item removido com sucesso!",
        life: 3000,
      });
    } catch (err) {
      console.error("Erro ao remover item:", err);
      setEmpreendimento(before);
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

  //
  // ADICIONAR MATERIAIS (TÓPICO = 3 — MARCAS)
  // topicoMateriais é um array de { materialId: number }
  //
  const handleAddMateriais = async (ids: number[], topicoId: number) => {
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

    // garantir que topicoMateriais é array
    if (!Array.isArray(topico.topicoMateriais)) topico.topicoMateriais = [];

    const existentes = (topico.topicoMateriais || []).map((m: any) =>
      Number(m.materialId)
    );
    const novos = ids.filter((id) => !existentes.includes(Number(id)));
    if (novos.length === 0) {
      toast.current?.show?.({
        severity: "warn",
        summary: "Aviso",
        detail: "Nenhum material novo para adicionar.",
        life: 2500,
      });
      return;
    }

    novos.forEach((id) => {
      topico.topicoMateriais.push({ materialId: Number(id) });
    });

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);
    console.log("PAYLOAD GERADO (ADD MATERIAIS):", payload);

    try {
      setLoading(true);
      await DocumentoService.updateEmpreendimento(payload);
      setEmpreendimento(payload);
      toast.current?.show?.({
        severity: "success",
        summary: "Sucesso",
        detail: "Materiais adicionados!",
        life: 3000,
      });
    } catch (err) {
      console.error("Erro ao adicionar materiais:", err);
      setEmpreendimento(before);
      toast.current?.show?.({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao adicionar materiais. Revertendo.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  //
  // REMOVER MATERIAL (TÓPICO = 3)
  //
  const handleRemoveMaterial = async (materialId: number, topicoId: number) => {
    if (!empreendimento) return;

    const before = JSON.parse(
      JSON.stringify(empreendimento)
    ) as UpdateEmpreendimento;
    const clone = JSON.parse(
      JSON.stringify(empreendimento)
    ) as UpdateEmpreendimento;

    const topico = (clone.empreendimentoTopicos || []).find(
      (t) => Number(t.topicoId) === Number(topicoId)
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

    topico.topicoMateriais = (topico.topicoMateriais || []).filter(
      (m: any) => Number(m.materialId) !== Number(materialId)
    );

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);
    console.log("PAYLOAD GERADO (REMOVE MATERIAL):", payload);

    try {
      setLoading(true);
      await DocumentoService.updateEmpreendimento(payload);
      setEmpreendimento(payload);
      toast.current?.show?.({
        severity: "info",
        summary: "Removido",
        detail: "Material removido com sucesso!",
        life: 3000,
      });
    } catch (err) {
      console.error("Erro ao remover material:", err);
      setEmpreendimento(before);
      toast.current?.show?.({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao remover material. Revertendo.",
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
            status={status}
            idDocumento={idDocumento}
          />

          <AddedItemsInDocument
            ambienteSelecionado={ambienteSelecionado}
            setAmbienteSelecionado={setAmbienteSelecionado}
            itemAmbienteSelecionado={itemAmbienteSelecionado}
            setItemAmbienteSelecionado={setItemAmbienteSelecionado}
            empreendimento={empreendimento}
            itensDocumento={[]} // componente lê do empreendimento
            itemMarcaMateriais={marcaMaterial}
            // handlers: itens ambientes e materiais (marcas)
            onAddItems={handleAddItems}
            onAddMateriais={handleAddMateriais}
          />

          <div className="w-full overflow-x-auto">
            <TabelaItens
              empreendimento={empreendimento}
              topicoSelecionado={ambienteSelecionado}
              ambienteSelecionado={itemAmbienteSelecionado}
              onRemoveItem={handleRemoveItem}
              onRemoveMaterial={handleRemoveMaterial}
            />
          </div>

          <ObservationDocument />
        </div>
      </div>
      <footer className="mb-10"></footer>
    </div>
  );
}
