"use client";

import Header from "@/components/gerenciamentoUser/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";
import TabelaItens from "./ViewMateralsDocument/page";
import ObservationDocument from "./ObservationDocument/page";
import { useEffect, useState } from "react";
import axios from "axios";

interface EmpreendimentoEditorProps {
  documentId: number;
}

export default function EmpreendimentoEditor({
  documentId,
}: EmpreendimentoEditorProps) {
  // Gerenciamento dos ambientes e itens dos ambientes.
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
      axios
        .get(
          `https://jotanunesservice.onrender.com/api/v1/empreendimento/GetEmpreendimentoById/${documentId}`
        )
        .then((res) => {
          setNomeDocumento(res.data.data.nome);
          setDescricaoDocumento(res.data.data.descricao);
          setLocalizacaoDocumento(res.data.data.localizacao);
          setTamanhoAreaDocumento(res.data.data.tamanhoArea);
          setPadraoDocumento(res.data.data.padrao);
          setStatusDocumento(res.data.data.status);
          setVersaoDocumento(res.data.data.versao);
        });
    }
    // console.log(nomeDocumento);
    // console.log(descricaoDocumento);
    // console.log(localizacaoDocumento);
    // console.log(tamanhoAreaDocumento);
    // console.log(padraoDocumento);
    // console.log(statusDocumento);
    // console.log(versaoDocumento);
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
