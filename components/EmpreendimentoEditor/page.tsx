"use client";

import Header from "../../components/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";
import TabelaItens from "./ViewMateralsDocument/page";
import ObservationDocument from "./ObservationDocument/page";
import { useEffect, useState } from "react";
import { DocumentoService, UpdateEmpreendimento } from "@/lib/api";

interface EmpreendimentoEditorProps {
  documentId: string;
}

export default function EmpreendimentoEditor({
  documentId,
}: EmpreendimentoEditorProps) {
  const [ambienteSelecionado, setAmbienteSelecionado] = useState("");
  const [itemAmbienteSelecionado, setItemAmbienteSelecionado] = useState("");
  const [itensDocumento, setItensDocumento] = useState<number[]>([]);

  const [empreendimento, setEmpreendimento] = useState<UpdateEmpreendimento>({
    id: documentId,
    nome: "",
    descricao: "",
    localizacao: "",
    tamanhoArea: 0,
    padrao: 1,
    empreendimentoTopicos: [],
  });

  // 🟢 Carregar o documento
  useEffect(() => {
    const getInfoDocument = async () => {
      try {
        const documentData = await DocumentoService.getDocumentoById(
          documentId
        );
        if (!documentData) return;

        const doc = documentData || documentData; // compatibilidade com retorno

        setEmpreendimento({
          id: doc.id,
          nome: doc.nome,
          descricao: doc.descricao,
          localizacao: doc.localizacao,
          tamanhoArea: doc.tamanhoArea || 0,
          padrao: Number(doc.padrao) || 1,
          empreendimentoTopicos: doc.empreendimentoTopicos || [],
        });

        // coletar todos os itemIds
        const idsInDoc = doc.empreendimentoTopicos.flatMap((t: any) =>
          t.topicoAmbientes.flatMap((a: any) =>
            a.ambienteItens.map((i: any) => i.itemId)
          )
        );
        setItensDocumento(idsInDoc);
      } catch (error) {
        console.error("Erro ao carregar documento:", error);
      }
    };

    getInfoDocument();
  }, [documentId]);

  // 🟡 Atualiza qualquer campo do documento
  const updateEmpreendimento = (
    field: keyof UpdateEmpreendimento,
    value: any
  ) => {
    setEmpreendimento((prev) => ({ ...prev, [field]: value }));
  };

  // 🟢 Adicionar itens no payload local
  const handleAddItems = (
    ids: number[],
    topicoId: number,
    ambienteId: number
  ) => {
    setEmpreendimento((prev) => {
      const clone = structuredClone(prev);
      const topico = clone.empreendimentoTopicos.find(
        (t) => t.topicoId === topicoId
      );
      if (!topico) return prev;

      const ambiente = topico.topicoAmbientes.find(
        (a: any) => a.ambienteId === ambienteId
      );
      if (!ambiente) return prev;

      const existentes = ambiente.ambienteItens.map((i: any) => i.itemId);
      const novos = ids.filter((id) => !existentes.includes(id));
      ambiente.ambienteItens.push(
        ...novos.map((id) => ({ itemId: id, versoes: [] }))
      );

      return { ...clone };
    });
  };

  // 🟠 Remover item localmente
  const handleRemoveItem = (
    itemId: number,
    topicoId: number,
    ambienteId: number
  ) => {
    setEmpreendimento((prev) => {
      const clone = structuredClone(prev);
      const topico = clone.empreendimentoTopicos.find(
        (t) => t.topicoId === topicoId
      );
      if (!topico) return prev;

      const ambiente = topico.topicoAmbientes.find(
        (a: any) => a.ambienteId === ambienteId
      );
      if (!ambiente) return prev;

      ambiente.ambienteItens = ambiente.ambienteItens.filter(
        (i: any) => i.itemId !== itemId
      );
      return { ...clone };
    });
  };

  if (!empreendimento) return <div>Carregando documento...</div>;

  return (
    <div className="min-h-screen">
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
            itensDocumento={itensDocumento}
            onAddItems={handleAddItems}
          />

          <TabelaItens
            empreendimento={empreendimento}
            topicoSelecionado={ambienteSelecionado}
            ambienteSelecionado={itemAmbienteSelecionado}
            onRemoveItem={handleRemoveItem}
          />

          <ObservationDocument />
        </div>
      </div>
    </div>
  );
}
