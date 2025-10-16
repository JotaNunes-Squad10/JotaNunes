"use client";

import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import ActionBar from "./ActionBar/page";
import { Dispatch, SetStateAction } from "react";

interface InfosDocument {
  nomeDocumento: string;
  setNomeDocumento: Dispatch<SetStateAction<string>>;
  descricaoDocumento: string;
  setDescricaoDocumento: Dispatch<SetStateAction<string>>;
  localizacaoDocumento: string;
  setLocalizacaoDocumento: Dispatch<SetStateAction<string>>;
  tamanhoAreaDocumento: number | undefined;
  setTamanhoAreaDocumento: Dispatch<SetStateAction<number | undefined>>;
  padraoDocumento: string;
  setPadraoDocumento: Dispatch<SetStateAction<string>>;
  statusDocumento: string;
  setStatusDocumento: Dispatch<SetStateAction<string>>;
  versaoDocumento: number | undefined;
  setVersaoDocumento: Dispatch<SetStateAction<number | undefined>>;
}

interface FormEmpreendimentoProps {
  params: InfosDocument;
}

export default function FormEmpreendimento({
  params,
}: FormEmpreendimentoProps) {
  return (
    <div>
      <ActionBar />
      <Card className="shadow-md p-6 w-full ">
        {/* Campo Empreendimento */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
            Empreendimento:
          </label>
          <InputText
            value={params.nomeDocumento}
            onChange={(e) => params.setNomeDocumento(e.target.value)}
            placeholder="Digite o nome do empreendimento"
            className="flex-1"
          />
        </div>
        {/* Campo Localização */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
            Localização:
          </label>
          <InputText
            value={params.localizacaoDocumento}
            onChange={(e) => params.setLocalizacaoDocumento(e.target.value)}
            placeholder="Digite a localização"
            className="flex-1"
          />
        </div>
        {/* Campo Descrição */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            Descrição do Empreendimento:
          </label>
          <InputTextarea
            value={params.descricaoDocumento}
            onChange={(e) => params.setDescricaoDocumento(e.target.value)}
            placeholder="Digite a descrição"
            rows={6}
            autoResize
            className="w-full"
          />
        </div>
      </Card>
    </div>
  );
}
