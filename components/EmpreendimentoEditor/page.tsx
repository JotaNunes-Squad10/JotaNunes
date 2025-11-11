"use client";

import Header from "../../components/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";
import TabelaItens from "./ViewMateralsDocument/page";
import ObservationDocument from "./ObservationDocument/page";
import { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { DocumentoService, UpdateEmpreendimento } from "@/lib/api";

interface EmpreendimentoEditorProps {
  documentId: string;
}

export default function EmpreendimentoEditor({
  documentId,
}: EmpreendimentoEditorProps) {
  const [ambienteSelecionado, setAmbienteSelecionado] = useState("");
  const [itemAmbienteSelecionado, setItemAmbienteSelecionado] = useState("");
  const [empreendimento, setEmpreendimento] = useState<UpdateEmpreendimento>();
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  // 🔹 Buscar documento
  useEffect(() => {
    const getInfoDocument = async () => {
      try {
        setLoading(true);
        const documentData = await DocumentoService.getDocumentoById(
          documentId
        );
        if (!documentData) return;

        setEmpreendimento({
          id: documentData.id,
          nome: documentData.nome || "",
          descricao: documentData.descricao || "",
          localizacao: documentData.localizacao || "",
          tamanhoArea: documentData.tamanhoArea || 0,
          padrao: Number(documentData.padrao) || 1,
          empreendimentoTopicos:
            documentData.empreendimentoTopicos?.map((t: any) => ({
              topicoId: t.topicoId,
              posicao: t.posicao ?? 0,
              topicoAmbientes:
                t.topicoAmbientes?.map((a: any) => ({
                  ambienteId: a.ambienteId,
                  area: a.area ?? 0,
                  posicao: a.posicao ?? 0,
                  ambienteItens:
                    a.ambienteItens?.map((i: any) => ({ itemId: i.itemId })) ||
                    [],
                })) || [],
              topicoMateriais:
                Array.isArray(t.topicoMateriais) && t.topicoMateriais.length > 0
                  ? t.topicoMateriais.map((m: any) => ({
                      materialId: m.materialId,
                      versoes: m.versoes || [],
                    }))
                  : [], // nunca null
            })) || [],
        });
      } catch (error) {
        console.error("Erro ao carregar documento:", error);
      } finally {
        setLoading(false);
      }
    };

    getInfoDocument();
  }, [documentId]);

  // 🔹 Atualiza campo simples do empreendimento
  const updateEmpreendimento = (
    field: keyof UpdateEmpreendimento,
    value: any
  ) => {
    setEmpreendimento((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // 🔹 Adicionar itens
  const handleAddItems = async (
    ids: number[],
    topicoId: number,
    ambienteId: number
  ) => {
    if (!empreendimento) return;

    // ✅ Cópia profunda e limpeza
    const clone: UpdateEmpreendimento = JSON.parse(
      JSON.stringify(empreendimento)
    );

    clone.nome = clone.nome?.trim() || "Sem nome";
    clone.descricao = clone.descricao?.trim() || "Sem descrição";
    clone.localizacao = clone.localizacao?.trim() || "Não informado";
    clone.padrao = Number(clone.padrao) || 1;

    if (!Array.isArray(clone.empreendimentoTopicos))
      clone.empreendimentoTopicos = [];

    // 🧩 Garante tópico
    let topico = clone.empreendimentoTopicos.find(
      (t) => t.topicoId === topicoId
    );
    if (!topico) {
      topico = {
        topicoId,
        posicao: clone.empreendimentoTopicos.length + 1,
        topicoAmbientes: [],
        topicoMateriais: [],
      };
      clone.empreendimentoTopicos.push(topico);
    }

    // 🧩 Garante ambiente
    let ambiente = topico.topicoAmbientes.find(
      (a) => a.ambienteId === ambienteId
    );
    if (!ambiente) {
      ambiente = {
        ambienteId,
        area: 0,
        posicao: topico.topicoAmbientes.length + 1,
        ambienteItens: [],
      };
      topico.topicoAmbientes.push(ambiente);
    }

    // 🧩 Adiciona novos itens (sem duplicar)
    const existentes = ambiente.ambienteItens.map((i) => i.itemId);
    const novos = ids.filter((id) => !existentes.includes(id));
    ambiente.ambienteItens.push(...novos.map((id) => ({ itemId: id })));

    // 🔧 Limpa duplicações e nulls
    topico.topicoAmbientes = topico.topicoAmbientes
      .filter(Boolean)
      .map((a) => ({
        ...a,
        ambienteItens: a.ambienteItens.filter(Boolean),
      }));

    topico.topicoMateriais =
      Array.isArray(topico.topicoMateriais) && topico.topicoMateriais.length > 0
        ? topico.topicoMateriais
        : null; // ✅ backend feliz

    // ✅ Atualiza state local
    setEmpreendimento(clone);

    const payloadToSend: UpdateEmpreendimento = {
      ...clone,
      empreendimentoTopicos: clone.empreendimentoTopicos.map((t) => ({
        topicoId: t.topicoId,
        posicao: t.posicao ?? 0,
        topicoAmbientes: t.topicoAmbientes.map((a) => ({
          ambienteId: a.ambienteId,
          area: a.area ?? 0,
          posicao: a.posicao ?? 0,
          ambienteItens: a.ambienteItens.map((i) => ({ itemId: i.itemId })),
        })),
        topicoMateriais: Array.isArray(t.topicoMateriais)
          ? t.topicoMateriais.map((m) => ({
              materialId: m.materialId,
              versoes: m.versoes || [],
            }))
          : [],
      })),
    };

    console.log("📤 Payload enviado (PUT):", payloadToSend);

    try {
      setLoading(true);
      console.log(
        "📤 Payload (stringificado):",
        JSON.stringify(clone, null, 2)
      );
      await DocumentoService.updateEmpreendimento(payloadToSend);
      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Itens adicionados com sucesso!",
        life: 3000,
      });
    } catch (error) {
      console.error("❌ Erro ao salvar documento:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao salvar no servidor.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Remover itens
  const handleRemoveItem = async (
    itemId: number,
    topicoId: number,
    ambienteId: number
  ) => {
    if (!empreendimento) return;
    const clone = structuredClone(empreendimento);

    const topico = clone.empreendimentoTopicos.find(
      (t) => t.topicoId === topicoId
    );
    if (!topico) return;

    const ambiente = topico.topicoAmbientes.find(
      (a) => a.ambienteId === ambienteId
    );
    if (!ambiente) return;

    ambiente.ambienteItens = ambiente.ambienteItens.filter(
      (i) => i.itemId !== itemId
    );

    setEmpreendimento(clone);

    try {
      setLoading(true);
      await DocumentoService.updateEmpreendimento(clone);
      toast.current?.show({
        severity: "info",
        summary: "Removido",
        detail: "Item removido com sucesso!",
        life: 3000,
      });
    } catch (error) {
      console.error("Erro ao atualizar documento:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao remover o item do documento.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!empreendimento)
    return <div className="p-4 text-center">Carregando documento...</div>;

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
            itensDocumento={[]}
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
