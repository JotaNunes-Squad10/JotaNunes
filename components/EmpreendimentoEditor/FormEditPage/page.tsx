"use client";

import React, { useRef, useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import ActionBar from "./ActionBar/page";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { DocumentoService, UpdateEmpreendimento } from "@/lib/api";

interface FormEmpreendimentoProps {
  empreendimento: UpdateEmpreendimento;
  updateEmpreendimento: (field: keyof UpdateEmpreendimento, value: any) => void;
  status: string;
  idDocumento: string;
}

export default function FormEmpreendimento({
  empreendimento,
  updateEmpreendimento,
  status,
  idDocumento,
}: FormEmpreendimentoProps) {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    console.log(empreendimento);

    try {
      await DocumentoService.updateEmpreendimento(empreendimento);

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Informações do empreendimento salvas com sucesso!",
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail:
          "Erro ao salvar o empreendimento. Verifique os campos obrigatórios ou tente mais tarde.",
        life: 3000,
      });
      console.error("Falha ao salvar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <ActionBar statusEmpreendimento={status} idDocumento={idDocumento} />
      <Card className="shadow-md p-6 w-full ">
        {/* Campo Empreendimento */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
            Empreendimento:
          </label>
          <InputText
            value={empreendimento.nome}
            onChange={(e) => updateEmpreendimento("nome", e.target.value)}
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
            value={empreendimento.localizacao}
            onChange={(e) =>
              updateEmpreendimento("localizacao", e.target.value)
            }
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
            value={empreendimento.descricao}
            onChange={(e) => updateEmpreendimento("descricao", e.target.value)}
            placeholder="Digite a descrição"
            rows={4}
            autoResize
            className="w-full"
          />
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <Button
            label="Guardar"
            icon="pi pi-check"
            className="p-button-next px-4 py-2"
            onClick={handleSave}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
}
