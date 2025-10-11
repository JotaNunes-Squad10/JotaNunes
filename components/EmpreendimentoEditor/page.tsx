"use client";

import Header from "@/components/gerenciamentoUser/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";
import TabelaItens from "./ViewMateralsDocument/page";
import ObservationDocument from "./ObservationDocument/page";
import { useEffect, useState } from "react";
import axios from "axios";
import { documentService } from "@/lib/api";

interface EmpreendimentoEditorProps {
  documentId: number;
}

export default function EmpreendimentoEditor({
  documentId,
}: EmpreendimentoEditorProps) {
  const [ambienteSelecionado, setAmbienteSelecionado] = useState();
  const [itemAmbienteSelecionado, setItemAmbienteSelecionado] = useState();

  // Gerenciamento do documento
  const [nomeDocumento, setNomeDocumento] = useState<string>("");
  const [descricaoDocumento, setDescricaoDocumento] = useState<string>("");
  const [localizacaoDocumento, setLocalizacaoDocumento] = useState<string>("");
  const [tamanhoAreaDocumento, setTamanhoAreaDocumento] = useState<number>();
  const [padraoDocumento, setPadraoDocumento] = useState<string>("");
  const [statusDocumento, setStatusDocumento] = useState<string>("");
  const [versaoDocumento, setVersaoDocumento] = useState<number>();

  // Verificando se é documento existe e adicionando seus valores

  useEffect(() => {
    if (documentId > 0) {
      const document = documentService.getSingleDocument(documentId);

      document.then((res) => {
        setNomeDocumento(res.nome);
        setDescricaoDocumento(res.descricao);
        setLocalizacaoDocumento(res.localizacao);
        setTamanhoAreaDocumento(res.tamanhoArea);
        setPadraoDocumento(res.padrao);
        setStatusDocumento(res.status);
        setVersaoDocumento(res.versao);
      });
    }
  });

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

      <div className="pt-30 flex justify-center">
        <div className="flex flex-col">
          <div>
            <FormEmpreendimento />
          </div>
          <div>
            <AddedItemsInDocument />
          </div>
          <div>
            <TabelaItens />
          </div>
          <div>
            <ObservationDocument />
          </div>
        </div>
      </div>
    </div>
  );
}
