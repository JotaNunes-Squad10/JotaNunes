"use client";

import Header from "../../components/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";
import TabelaItens from "./ViewMateralsDocument/page";
import ObservationDocument from "./ObservationDocument/page";
import { useEffect, useState } from "react";
import {
  DocumentoService,
  EmpreendimentosTopicos,
  itemService,
  UpdateEmpreendimento,
} from "@/lib/api";

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
  const [empreendimentoTopicos, setEmpreendimentoTopicos] = useState<
    EmpreendimentosTopicos[]
  >([]);
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

  // Funções de atualização
  const updateEmpreendimento = (
    field: keyof UpdateEmpreendimento,
    value: any
  ) => {
    setEmpreendimento((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItems = (ids: number[]) => {
    setItensDocumento((prev) => [...prev, ...ids]);
  };

  const handleRemoveItem = (id: number) => {
    setItensDocumento((prev) => prev.filter((itemId) => itemId !== id));
  };

  // Buscar as informações do documento ao carregar o componente
  useEffect(() => {
    const getInfoDocument = async () => {
      const documentData = await DocumentoService.getDocumentoById(documentId);
      console.log("Dados do documento:", documentData);
      if (documentData) {
        setEmpreendimentoTopicos(documentData.empreendimentoTopicos);
        const idsInDocumento = documentData.empreendimentoTopicos.flatMap(
          (topico) =>
            topico.topicoAmbientes.flatMap((amb) =>
              amb.ambienteItens.map((i) => i.itemId)
            )
        );

        console.log(idsInDocumento);

        setItensDocumento(idsInDocumento);
        updateEmpreendimento("nome", documentData.nome);
        updateEmpreendimento("descricao", documentData.descricao);
        updateEmpreendimento("localizacao", documentData.localizacao);
      }
    };

    getInfoDocument();
  }, [documentId]);

  // console.log("Document ID:", documentId);
  // console.log("Nome Documento:", nomeDocumento);
  // console.log("Descrição Documento:", descricaoDocumento);
  // console.log("Localização Documento:", localizacaoDocumento);
  // console.log("Tamanho Área Documento:", tamanhoAreaDocumento);
  // console.log("Padrão Documento:", padraoDocumento);
  // console.log("Status Documento:", statusDocumento);
  // console.log("Versão Documento:", versaoDocumento);
  console.log(empreendimentoTopicos);

  // TODO: usar empreendimentoTopicos nos componentes de adicionar itens no documento para fazer o filtro dos intens que já estão dentro dele.

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
              empreendimentoTopicos={empreendimentoTopicos}
              itensDocumento={itensDocumento}
              onAddItems={handleAddItems}
            />
          </div>
          <div className="w-full overflow-x-auto">
            <TabelaItens
              empreendimentoTopicos={empreendimentoTopicos}
              topicoSelecionado={ambienteSelecionado}
              ambienteSelecionado={itemAmbienteSelecionado}
              itensDocumento={itensDocumento}
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
