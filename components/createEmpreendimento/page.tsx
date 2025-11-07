"use client";

import { useState } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { useRouter } from "next/navigation";
import Header from "../../components/headerUser/page";
import FormCreateEmpreendimento from "./formCriarCabecalho/page";
import CustomSidebarComponent from "../EmpreendimentoEditor/SideBar/page";
import AddedItemsInDocument from "../EmpreendimentoEditor/AddedItemsInDocument/page";
import TabelaItensInitial from "./TabelaItensInitial/page";
import ObservationDocument from "../EmpreendimentoEditor/ObservationDocument/page";
import { CreateDocumentoPayload, EmpreendimentosTopicos } from "@/lib/api";

export default function CreateEmpreendimento() {
  // Estados para os campos do formulário
  const router = useRouter();

  const [ambienteSelecionado, setAmbienteSelecionado] = useState("");
  const [itemAmbienteSelecionado, setItemAmbienteSelecionado] = useState("");

  // const [nomeDocumento, setNomeDocumento] = useState<string>("");
  // const [descricaoDocumento, setDescricaoDocumento] = useState<string>("");
  // const [localizacaoDocumento, setLocalizacaoDocumento] = useState<string>("");
  // const [tamanhoAreaDocumento, setTamanhoAreaDocumento] = useState<number>();
  // const [padraoDocumento, setPadraoDocumento] = useState<number>(0);
  // const [statusDocumento, setStatusDocumento] = useState<string>("");
  // const [versaoDocumento, setVersaoDocumento] = useState<number>();

  const [documento, setDocumento] = useState<CreateDocumentoPayload>({
    nome: "",
    descricao: "",
    localizacao: "",
    tamanhoArea: 0,
    padrao: 0,
    empreendimentoTopicos: [],
  });

  // Funções de atualização
  const updateDocumento = (field: keyof CreateDocumentoPayload, value: any) => {
    setDocumento((prev) => ({ ...prev, [field]: value }));
  };

  const addTopico = (novoTopico: EmpreendimentosTopicos) => {
    setDocumento((prev) => ({
      ...prev,
      empreendimentoTopicos: [...prev.empreendimentoTopicos, novoTopico],
    }));
  };

  const resetDocumento = () => {
    setDocumento({
      nome: "",
      descricao: "",
      localizacao: "",
      tamanhoArea: 0,
      padrao: 0,
      empreendimentoTopicos: [],
    });
  };

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
          <div>
            <FormCreateEmpreendimento
              documento={documento}
              updateDocumento={updateDocumento}
            />
          </div>
          <div>
            <AddedItemsInDocument
              ambienteSelecionado={ambienteSelecionado}
              setAmbienteSelecionado={setAmbienteSelecionado}
              itemAmbienteSelecionado={itemAmbienteSelecionado}
              setItemAmbienteSelecionado={setAmbienteSelecionado}
            />
          </div>
          <div className="w-full overflow-x-auto">
            <TabelaItensInitial
              documento={documento}
              setDocumento={setDocumento}
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
