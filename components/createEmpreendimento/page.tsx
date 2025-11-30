"use client";

import { useState } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import Header from "../../components/headerUser/page";
import FormCreateEmpreendimento from "./formCriarCabecalho/page";

export default function CreateEmpreendimento() {
  // Estados para os campos do formulário

  // const [ambienteSelecionado, setAmbienteSelecionado] = useState();
  // const [itemAmbienteSelecionado, setItemAmbienteSelecionado] = useState();

  const [nomeDocumento, setNomeDocumento] = useState<string>("");
  const [descricaoDocumento, setDescricaoDocumento] = useState<string>("");
  const [localizacaoDocumento, setLocalizacaoDocumento] = useState<string>("");
  const [tamanhoAreaDocumento, setTamanhoAreaDocumento] = useState<number>();
  const [padraoDocumento, setPadraoDocumento] = useState<number>(0);
  const [statusDocumento, setStatusDocumento] = useState<string>("");
  const [versaoDocumento, setVersaoDocumento] = useState<number>();

  return (
    <div className="min-h-screen">
      <Header />

      {/* <CustomSidebarComponent
        ambienteSelecionado={ambienteSelecionado}
        setAmbienteSelecionado={setAmbienteSelecionado}
        itemAmbienteSelecionado={itemAmbienteSelecionado}
        setItemAmbienteSelecionado={setItemAmbienteSelecionado}
      /> */}

      <div className="pt-8 flex justify-center w-full">
        <div className="flex flex-col w-full max-screen-lg px-4 lg:w-[60%]">
          <div>
            <FormCreateEmpreendimento
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

          {/* <AddedItemsInDocument
            ambienteSelecionado={ambienteSelecionado}
            setAmbienteSelecionado={setAmbienteSelecionado}
            itemAmbienteSelecionado={itemAmbienteSelecionado}
            setItemAmbienteSelecionado={setAmbienteSelecionado}
          /> */}

          <div className="w-full overflow-x-auto">{/* <TabelaItens /> */}</div>
          <div>{/* <ObservationDocument /> */}</div>
        </div>
      </div>
      <footer className="mb-10"></footer>
    </div>
  );
}
