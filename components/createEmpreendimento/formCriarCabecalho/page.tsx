"use client";

import React, { useRef, useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dispatch, SetStateAction } from "react";
import { Toast } from "primereact/toast";
import ActionBarCreate from "../actionBarCreate/page";
import { CreateDocumentoPayload } from "@/lib/api";

interface FormEmpreendimentoProps {
  documento: CreateDocumentoPayload;
  updateDocumento: (field: keyof CreateDocumentoPayload, value: any) => void;
}

export default function FormCreateEmpreendimento({
  documento,
  updateDocumento,
}: FormEmpreendimentoProps) {
  const toast = useRef<Toast>(null);

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <ActionBarCreate
        nomeDocumento={documento.nome}
        descricaoDocumento={documento.descricao}
        localizacaoDocumento={documento.localizacao}
      />
      <Card className="shadow-md p-6 w-full ">
        {/* Campo Empreendimento */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
            Empreendimento:
          </label>
          <InputText
            value={documento.nome}
            onChange={(e) => updateDocumento("descricao", e.target.value)}
            placeholder="Digite o nome do empreendimento"
            className="flex-1"
            required
          />
        </div>
        {/* Campo Localização */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
            Localização:
          </label>
          <InputText
            value={documento.localizacao}
            onChange={(e) => updateDocumento("localizacao", e.target.value)}
            placeholder="Digite a localização"
            className="flex-1"
            required
          />
        </div>
        {/* Campo Descrição */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            Descrição do Empreendimento:
          </label>
          <InputTextarea
            value={documento.descricao}
            onChange={(e) => updateDocumento("descricao", e.target.value)}
            placeholder="Digite a descrição"
            rows={4}
            autoResize
            className="w-full"
            required
          />
        </div>
        <div className="flex justify-end gap-2 mt-3"></div>
      </Card>
    </div>
  );
}
