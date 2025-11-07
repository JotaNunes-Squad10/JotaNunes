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

  // Gerenciamento do documento
  const [nomeDocumento, setNomeDocumento] = useState<string>("");
  const [descricaoDocumento, setDescricaoDocumento] = useState<string>("");
  const [localizacaoDocumento, setLocalizacaoDocumento] = useState<string>("");
  const [tamanhoAreaDocumento, setTamanhoAreaDocumento] = useState<number>(0);
  const [padraoDocumento, setPadraoDocumento] = useState<string>("");
  const [statusDocumento, setStatusDocumento] = useState<string>("");
  const [versaoDocumento, setVersaoDocumento] = useState<number>(1);

  // Estados relacionados aos itens no documento
  const [empreendimentoTopicos, setEmpreendimentoTopicos] = useState<
    EmpreendimentosTopicos[]
  >([]);

  // Buscar as informações do documento ao carregar o componente
  useEffect(() => {
    const getInfoDocument = async () => {
      const documentData = await DocumentoService.getDocumentoById(documentId);
      console.log("Dados do documento:", documentData);
      if (documentData) {
        setNomeDocumento(documentData.nome);
        setDescricaoDocumento(documentData.descricao);
        setLocalizacaoDocumento(documentData.localizacao);
        setEmpreendimentoTopicos(documentData.empreendimentoTopicos);
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
              params={{
                nomeDocumento,
                setNomeDocumento,
                descricaoDocumento,
                setDescricaoDocumento,
                localizacaoDocumento,
                setLocalizacaoDocumento,
                tamanhoAreaDocumento,
                setTamanhoAreaDocumento,
                padraoDocumento,
                setPadraoDocumento,
                statusDocumento,
                setStatusDocumento,
                versaoDocumento,
                setVersaoDocumento,
              }}
            />
          </div>
          <div>
            <AddedItemsInDocument
              ambienteSelecionado={ambienteSelecionado}
              setAmbienteSelecionado={setAmbienteSelecionado}
              itemAmbienteSelecionado={itemAmbienteSelecionado}
              setItemAmbienteSelecionado={setItemAmbienteSelecionado}
            />
          </div>
          <div className="w-full overflow-x-auto">
            <TabelaItens
              empreendimentoTopicos={empreendimentoTopicos}
              topicoSelecionado={ambienteSelecionado}
              ambienteSelecionado={itemAmbienteSelecionado}
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
