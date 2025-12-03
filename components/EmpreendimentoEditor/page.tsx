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
  MaterialService,
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

/**
 * Tipos locais para dar segurança em runtime/compile-time
 * - Raw* : representam dados vindos da API que podem ter formatos variados (por isso usam `unknown` internamente)
 * - Topico*, TopicoAmbiente*, AmbienteItem*, TopicoMaterial* : tipos usados internamente no componente
 */

type UnknownRecord = Record<string, unknown>;

interface RawItem {
  itemId?: unknown;
}

interface RawAmbiente {
  ambienteId?: unknown;
  area?: unknown;
  posicao?: unknown;
  ambienteItens?: unknown;
}

interface RawMaterial {
  materialId?: unknown;
  versoes?: unknown;
  material?: { id?: unknown } | unknown;
  id?: unknown;
}

interface RawTopico {
  topicoId?: unknown;
  posicao?: unknown;
  topicoAmbientes?: unknown;
  topicoMateriais?: unknown;
}

interface RawDocumentData {
  id: string;
  nome?: unknown;
  descricao?: unknown;
  localizacao?: unknown;
  tamanhoArea?: unknown;
  padrao?: unknown;
  status?: string;
  empreendimentoTopicos?: unknown;
}

/* Tipos internos que descrevem a forma utilizada no componente */
interface AmbienteItem {
  itemId: number;
}

interface TopicoAmbiente {
  ambienteId: number;
  area: number;
  posicao: number;
  ambienteItens: AmbienteItem[];
}

interface TopicoMaterial {
  materialId: number;
  versoes?: unknown[];
}

interface EmpreendimentoTopico {
  topicoId: number;
  posicao: number;
  topicoAmbientes: TopicoAmbiente[];
  topicoMateriais: TopicoMaterial[];
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
  const toast = useRef<Toast | null>(null);
  const [materiais, setMateriais] = useState<{ id: number; nome: string }[]>(
    []
  );
  const [status, setStatus] = useState<string>("");
  const [idDocumento, setIdDocumento] = useState<string>("");

  // Carrega marcas-materials (fonte para adicionar em MARCAS)
  useEffect(() => {
    const getMarcaMaterial = async () => {
      try {
        const response = await MaterialService.getAllMateriais();
        setMateriais(response);
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
    const padraoNumber = Number(String(doc.padrao)) || 1;

    const empreendTopicos: EmpreendimentoTopico[] =
      (doc.empreendimentoTopicos || []).map(
        (t: EmpreendimentoTopico | unknown, ti: number) => {
          // Se esse topico tiver topicoId === 3 => Marcas
          const topicoIdNum = Number(
            String((t as EmpreendimentoTopico).topicoId)
          );

          // ============
          // CASO MARCAS
          // ============
          if (topicoIdNum === 3) {
            const topicoMateriaisRaw = Array.isArray(
              (t as EmpreendimentoTopico).topicoMateriais
            )
              ? (t as EmpreendimentoTopico).topicoMateriais
              : [];
            return {
              topicoId: 3,
              posicao: (t as EmpreendimentoTopico).posicao ?? ti + 1,
              topicoAmbientes: [], // 🔥 OBRIGATÓRIO PARA NÃO QUEBRAR A API
              topicoMateriais: Array.isArray(topicoMateriaisRaw)
                ? (topicoMateriaisRaw as TopicoMaterial[]).map((m) => ({
                    materialId: Number(
                      String((m as TopicoMaterial).materialId)
                    ),
                  }))
                : [],
            } as EmpreendimentoTopico;
          }

          // ===========================
          // TOPICOS NORMAIS (AMBIENTES)
          // ===========================
          const topicoAmbientes =
            ((t as EmpreendimentoTopico).topicoAmbientes || []).map(
              (a: TopicoAmbiente | unknown, ai: number) => ({
                ambienteId: Number(String((a as TopicoAmbiente).ambienteId)),
                area: (a as TopicoAmbiente).area ?? 0,
                posicao: (a as TopicoAmbiente).posicao ?? ai + 1,
                ambienteItens:
                  (
                    ((a as TopicoAmbiente).ambienteItens ||
                      []) as AmbienteItem[]
                  ).map((it) => ({
                    itemId: Number(String(it.itemId)),
                  })) || [],
              })
            ) || [];

          const topicoMateriais =
            Array.isArray((t as EmpreendimentoTopico).topicoMateriais) &&
            ((t as EmpreendimentoTopico).topicoMateriais || []).length > 0
              ? ((t as EmpreendimentoTopico).topicoMateriais || []).map(
                  (m: TopicoMaterial | unknown) => ({
                    materialId: Number(
                      String((m as TopicoMaterial).materialId)
                    ),
                    versoes: (m as TopicoMaterial).versoes ?? [],
                  })
                )
              : [];

          return {
            topicoId: Number(String((t as EmpreendimentoTopico).topicoId)),
            posicao: (t as EmpreendimentoTopico).posicao ?? ti + 1,
            topicoAmbientes,
            topicoMateriais,
          } as EmpreendimentoTopico;
        }
      ) || [];

    return {
      id: doc.id,
      nome: doc.nome ?? "",
      descricao: doc.descricao ?? "",
      localizacao: doc.localizacao ?? "",
      tamanhoArea: Number(String(doc.tamanhoArea)) || 0,
      padrao: padraoNumber,
      empreendimentoTopicos:
        empreendTopicos as unknown as UpdateEmpreendimento["empreendimentoTopicos"],
    };
  };

  // Carrega documento
  useEffect(() => {
    let mounted = true;
    const loadDocument = async () => {
      try {
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
        const doc = documentData as RawDocumentData;

        const normalized: UpdateEmpreendimento = {
          id: doc.id,
          nome: doc.nome ? String(doc.nome) : "",
          descricao: doc.descricao ? String(doc.descricao) : "",
          localizacao: doc.localizacao ? String(doc.localizacao) : "",
          tamanhoArea: Number(String(doc.tamanhoArea)) || 0,
          padrao: Number(String(doc.padrao)) || 1,
          empreendimentoTopicos:
            ((doc.empreendimentoTopicos as RawTopico[]) || []).map(
              (t: RawTopico, ti: number) => {
                // topicoId
                const topicoIdNum = Number(String(t.topicoId ?? 0));

                // topicoAmbientes
                const topicoAmbientes: TopicoAmbiente[] =
                  ((t.topicoAmbientes as RawAmbiente[]) || []).map(
                    (a: RawAmbiente, ai: number) => {
                      const ambienteItens =
                        ((a.ambienteItens as RawItem[]) || []).map((it) => ({
                          itemId: Number(String(it.itemId ?? 0)),
                        })) || [];

                      return {
                        ambienteId: Number(String(a.ambienteId ?? 0)),
                        area: (a.area as number) ?? 0,
                        posicao: (a.posicao as number) ?? ai + 1,
                        ambienteItens,
                      } as TopicoAmbiente;
                    }
                  ) || [];

                const topicoMateriais: TopicoMaterial[] =
                  Array.isArray(t.topicoMateriais as RawMaterial[]) &&
                  ((t.topicoMateriais as RawMaterial[]) || []).length > 0
                    ? ((t.topicoMateriais as RawMaterial[]) || []).map(
                        (m: RawMaterial) => ({
                          materialId: Number(
                            String(
                              m.materialId ??
                                (m.material &&
                                  (m.material as UnknownRecord).id) ??
                                m.id ??
                                0
                            )
                          ),
                          // se vier com 'versoes' adicione aqui:
                          versoes: Array.isArray(m.versoes)
                            ? (m.versoes as unknown[])
                            : [],
                        })
                      )
                    : [];

                return {
                  topicoId: topicoIdNum,
                  posicao: t.posicao ? Number(String(t.posicao)) : ti + 1,
                  topicoAmbientes,
                  topicoMateriais,
                } as unknown as NonNullable<
                  UpdateEmpreendimento["empreendimentoTopicos"]
                >[number];
              }
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
    value: UpdateEmpreendimento[keyof UpdateEmpreendimento]
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

    let topico = (clone.empreendimentoTopicos || []).find(
      (t) =>
        Number(String((t as EmpreendimentoTopico).topicoId)) ===
        Number(String(topicoId))
    ) as EmpreendimentoTopico | undefined;

    if (!topico) {
      topico = {
        topicoId: Number(String(topicoId)),
        posicao: (clone.empreendimentoTopicos || []).length + 1,
        topicoAmbientes: [],
        topicoMateriais: [],
      } as unknown as EmpreendimentoTopico;
      clone.empreendimentoTopicos.push(
        topico as unknown as NonNullable<
          UpdateEmpreendimento["empreendimentoTopicos"]
        >[number]
      );
    }

    // ambienteId pode ser 0 in case of materials, but here it's for ambiente items
    let ambiente = (topico.topicoAmbientes || []).find(
      (a) =>
        Number(String((a as TopicoAmbiente).ambienteId)) ===
        Number(String(ambienteId))
    ) as TopicoAmbiente | undefined;

    if (!ambiente) {
      ambiente = {
        ambienteId: Number(String(ambienteId)),
        area: 0,
        posicao: (topico.topicoAmbientes || []).length + 1,
        ambienteItens: [],
      } as TopicoAmbiente;
      topico.topicoAmbientes = [...(topico.topicoAmbientes || []), ambiente];
    }

    const existentes = (ambiente.ambienteItens || []).map((i) =>
      Number(String(i.itemId))
    );
    const novos = ids.filter((id) => !existentes.includes(Number(String(id))));
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
      ...novos.map((id) => ({ itemId: Number(String(id)) })),
    ];

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);
    console.log("Payload gerado (ADD ITEMS em ambiente):", payload);

    try {
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
      (t) =>
        Number(String((t as EmpreendimentoTopico).topicoId)) ===
        Number(String(topicoId))
    ) as EmpreendimentoTopico | undefined;

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
      (a) =>
        Number(String((a as TopicoAmbiente).ambienteId)) ===
        Number(String(ambienteId))
    ) as TopicoAmbiente | undefined;

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
      (i) => Number(String(i.itemId)) !== Number(String(itemId))
    );

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);
    console.log("Payload gerado (REMOVE ITEM em ambiente):", payload);

    try {
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

    let topico = (clone.empreendimentoTopicos || []).find(
      (t) =>
        Number(String((t as EmpreendimentoTopico).topicoId)) ===
        Number(String(topicoId))
    ) as EmpreendimentoTopico | undefined;

    if (!topico) {
      topico = {
        topicoId: Number(String(topicoId)),
        posicao: (clone.empreendimentoTopicos || []).length + 1,
        topicoAmbientes: [],
        topicoMateriais: [],
      } as EmpreendimentoTopico;
      clone.empreendimentoTopicos.push(
        topico as unknown as NonNullable<
          UpdateEmpreendimento["empreendimentoTopicos"]
        >[number]
      );
    }

    // garantir que topicoMateriais é array
    if (!Array.isArray(topico.topicoMateriais)) topico.topicoMateriais = [];

    const existentes = (topico.topicoMateriais || []).map((m) =>
      Number(String((m as TopicoMaterial).materialId))
    );
    const novos = ids.filter((id) => !existentes.includes(Number(String(id))));
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
      topico.topicoMateriais.push({ materialId: Number(String(id)) });
    });

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);
    console.log("PAYLOAD GERADO (ADD MATERIAIS):", payload);

    try {
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
      (t) =>
        Number(String((t as EmpreendimentoTopico).topicoId)) ===
        Number(String(topicoId))
    ) as EmpreendimentoTopico | undefined;

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
      (m) =>
        Number(String((m as TopicoMaterial).materialId)) !==
        Number(String(materialId))
    );

    // optimistic update
    setEmpreendimento(clone);

    const payload = buildPayloadForApi(clone);
    console.log("PAYLOAD GERADO (REMOVE MATERIAL):", payload);

    try {
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
    }
  };

  if (!empreendimento) {
    return <div className="p-4 text-center">Carregando documento...</div>;
  }

  return (
    <div className="min-h-screen pt-[60px] sm:pt-[70px]">
      <Toast ref={toast} />
      <Header />
      <CustomSidebarComponent
        ambienteSelecionado={ambienteSelecionado}
        setAmbienteSelecionado={setAmbienteSelecionado}
        itemAmbienteSelecionado={itemAmbienteSelecionado}
        setItemAmbienteSelecionado={setItemAmbienteSelecionado}
      />

      <div className="pt-8 flex justify-center w-full">
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
            itemMarcaMateriais={materiais}
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
