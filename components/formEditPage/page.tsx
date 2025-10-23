"use client";

import React, { useRef, useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export default function FormEmpreendimento() {
  const [empreendimento, setEmpreendimento] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [descricao, setDescricao] = useState("");
  const toast = useRef<Toast>(null);
  const itemNameref = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if(!empreendimento.trim() || !localizacao.trim()) {
      toast.current?.show({
        severity: "error",       
        summary: "Erro",
        detail: "Os campos empreendimento e localização são obrigatórios.",
        life: 3000,
      });
      return;
    }

    console.log("Dados Salvos",{
      empreendimento,
      localizacao,
      descricao,
    });

    toast.current?.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Empreendimento e Localização salvos com sucesso",
      life: 3000,
    });

    setEmpreendimento("");
    setLocalizacao("");
    setDescricao("");
  };

  const handleEnterKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="w-full max-w-[911px] ml-1 pr-4"> 
      {/* max-w-2xl limita largura, ml-8 joga mais pra esquerda, pr-4 dá respiro à direita */}
      <Toast ref={toast} position="top-right"/>

      <Card className="shadow-md p-4 w-full">
        {/* Campo Empreendimento */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4">
          <label className="sm:w-40 text-sm font-semibold text-gray-700 mb-1 sm:mb-0">
            Empreendimento:
          </label>
          <InputText
            value={empreendimento}
            onChange={(e) => setEmpreendimento(e.target.value)}
            placeholder="Digite o nome do empreendimento"
            className="flex-1"
            onKeyDown={handleEnterKey}
          />
        </div>

        {/* Campo Localização */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4">
          <label className="sm:w-40 text-sm font-semibold text-gray-700 mb-1 sm:mb-0">
            Localização:
          </label>
          <InputText
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            placeholder="Digite a localização"
            className="flex-1"
            onKeyDown={handleEnterKey}
          />
        </div>

        {/* Campo Descrição */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Descrição do Empreendimento:
          </label>
          <InputTextarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Digite a descrição"
            rows={6}
            autoResize
            className="w-full"
          />
        </div>

        {/* Campo dos Botões*/}
        <div className="flex justify-end gap-2 mt-3">
          <Button
            label="Salvar"
            icon="pi pi-check"
            className="p-button-next px-4 py-2"
            onClick={handleSave}
          />  
        </div>
      </Card>
    </div>
  );
}
