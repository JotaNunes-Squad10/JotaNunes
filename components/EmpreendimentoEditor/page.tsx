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
  // Gerenciamento dos ambientes e itens dos ambientes.
  const [ambienteSelecionado, setAmbienteSelecionado] = useState("");
  const [itemAmbienteSelecionado, setItemAmbienteSelecionado] = useState("");

  // Estados relacionados aos itens no documento (Apenas busca)
  // const [empreendimentoTopicos, setEmpreendimentoTopicos] = useState<
  //   EmpreendimentosTopicos[]
  // >([]);

  const [itensDocumento, setItensDocumento] = useState<number[]>([]);

  // Estado que gerencia o documento para editar
  const [empreendimento, setEmpreendimento] = useState<UpdateEmpreendimento>({
    id: documentId,
    nome: "",
    descricao: "",
    localizacao: "",
    tamanhoArea: 0,
    padrao: 1, // Requer alterar de forma dinâmica o padrão
    empreendimentoTopicos: [],
  });

  // Busca inicial do documento
  useEffect(() => {
    const getInfoDocument = async () => {
      try {
        const documentData = await DocumentoService.getDocumentoById(
          documentId
        );
        if (!documentData) return;

        setEmpreendimento({
          id: documentData.id,
          nome: documentData.nome,
          descricao: documentData.descricao,
          localizacao: documentData.localizacao,
          tamanhoArea: documentData.tamanhoArea,
          padrao: Number(documentData.padrao) || 1,
          empreendimentoTopicos: documentData.empreendimentoTopicos || [],
        });
      } catch (error) {
        console.error("Erro ao carregar documento:", error);
      }
    };

    getInfoDocument();
  }, [documentId]);

  // Função de atualização de campos simples
  const updateEmpreendimento = (
    field: keyof UpdateEmpreendimento,
    value: any
  ) => {
    setEmpreendimento((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * ✅ handleAddItems — lógica completa
   *  - cria topico se não existir
   *  - cria ambiente se não existir
   *  - adiciona itens novos
   */
  const handleAddItems = async (
    ids: number[],
    topicoId: number,
    ambienteId: number
  ) => {
    if (!ids || ids.length === 0) return;

    setEmpreendimento((prev) => {
      if (!prev) return prev;
      const clone = structuredClone(prev);

      // Verifica se o tópico já existe no documento
      let topico = clone.empreendimentoTopicos.find(
        (t) => t.topicoId === topicoId
      );

      if (!topico) {
        // Cria um novo tópico se não existir
        topico = {
          topicoId,
          posicao: clone.empreendimentoTopicos.length + 1,
          topicoAmbientes: [],
          topicoMateriais: [],
        };
        clone.empreendimentoTopicos.push(topico);
      }

      // Verifica se o ambiente já existe dentro do tópico
      let ambiente = topico.topicoAmbientes.find(
        (a: any) => a.ambienteId === ambienteId
      );

      if (!ambiente) {
        // Cria um novo ambiente dentro do tópico
        ambiente = {
          ambienteId,
          area: 0,
          posicao: topico.topicoAmbientes.length + 1,
          ambienteItens: [],
        };
        topico.topicoAmbientes.push(ambiente);
      }

      // Adiciona os itens (sem duplicar)
      const existentes = ambiente.ambienteItens.map((i: any) => i.itemId);
      const novos = ids.filter((id) => !existentes.includes(id));

      ambiente.ambienteItens.push(
        ...novos.map((id) => ({ itemId: id, versoes: [] }))
      );

      console.log("✅ Novo estado do payload após adicionar item:");
      console.log(JSON.stringify(clone, null, 2));

      return { ...clone };
    });

    // TODO: 🚀 PUT do documento após adição
    // await DocumentoService.updateEmpreendimento(empreendimento);
  };

  /**
   * ✅ handleRemoveItem — remove item do payload
   */
  const handleRemoveItem = (
    itemId: number,
    topicoId: number,
    ambienteId: number
  ) => {
    setEmpreendimento((prev) => {
      if (!prev) return prev;
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

      console.log("🗑️ Payload após remoção:");
      console.log(JSON.stringify(clone, null, 2));

      return { ...clone };
    });

    // TODO: 🚀 PUT do documento após remoção
    // await DocumentoService.updateEmpreendimento(empreendimento);
  };

  if (!empreendimento) return <div>Carregando documento...</div>;

  return (
    <div className="min-h-screen">
      <div>
        <Header />
      </div>

      <CustomSidebarComponent
        ambienteSelecionado={ambienteSelecionado}
        setAmbienteSelecionado={setAmbienteSelecionado}
        itemAmbienteSelecionado={itemAmbienteSelecionado}
        setItemAmbienteSelecionado={setItemAmbienteSelecionado}
      />

      <div className="pt-30 flex justify-center w-full">
        <div className="flex flex-col w-full max-screen-lg px-4 lg:w-[60%]">
          <div>
            <FormEmpreendimento
              empreendimento={empreendimento}
              updateEmpreendimento={updateEmpreendimento}
            />
          </div>

          <div>
            <AddedItemsInDocument
              ambienteSelecionado={ambienteSelecionado}
              setAmbienteSelecionado={setAmbienteSelecionado}
              itemAmbienteSelecionado={itemAmbienteSelecionado}
              setItemAmbienteSelecionado={setItemAmbienteSelecionado}
              empreendimento={empreendimento}
              itensDocumento={itensDocumento}
              onAddItems={handleAddItems}
            />
          </div>

          <div className="w-full overflow-x-auto">
            <TabelaItens
              empreendimento={empreendimento}
              topicoSelecionado={ambienteSelecionado}
              ambienteSelecionado={itemAmbienteSelecionado}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <div>
            <ObservationDocument />
          </div>
        </div>
      </div>

      <footer className="mb-10"></footer>
    </div>
  );
}
