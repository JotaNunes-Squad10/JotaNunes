"use client";

import Header from "@/components/gerenciamentoUser/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";
import TabelaItens from "./ViewMateralsDocument/page";
import ObservationDocument from "./ObservationDocument/page";
import { useEffect, useState } from "react";

interface EmpreendimentoEditorProps {
  documentId?: number;
}

export default function EmpreendimentoEditor({
  documentId,
}: EmpreendimentoEditorProps) {
  const [ambienteSelecionado, setAmbienteSelecionado] = useState();
  const [itemAmbienteSelecionado, setItemAmbienteSelecionado] = useState();

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
