"use client";

import { useState } from "react";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import ActionBar from "../EmpreendimentoEditor/FormEditPage/ActionBar/page";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { useRef } from "react";

export default function CreateEmpreendimento() {
  // Estados para os campos do formulário
  const [nomeDocumento, setNomeDocumento] = useState<string>("");
  const [descricaoDocumento, setDescricaoDocumento] = useState<string>("");
  const [localizacaoDocumento, setLocalizacaoDocumento] = useState<string>("");
  const [tamanhoAreaDocumento, setTamanhoAreaDocumento] = useState<number>();
  const [padraoDocumento, setPadraoDocumento] = useState<string>("");
  const [statusDocumento, setStatusDocumento] = useState<string>("");
  const [versaoDocumento, setVersaoDocumento] = useState<number>();

  const toast = useRef<Toast>(null);
  const handleSave = () => {
    if (
      !nomeDocumento.trim() ||
      !localizacaoDocumento.trim() ||
      !descricaoDocumento.trim()
    ) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail:
          "Os campos empreendimento, localização e descrição são obrigatórios",
        life: 3000,
      });
      return;
    }

    // Lógica para salvar os dados do empreendimento

    toast.current?.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Empreendimento criado com sucesso!",
      life: 3000,
    });
  };

  return (
    <div className="min-h-screen">
      <div className="pt-30 flex justify-center w-full">
        <div className="flex flex-col w-full max-screen-lg px-4 lg:w-[60%]">
          <div>
            <Toast ref={toast} position="top-right" />
            <ActionBar />
            <Card className="shadow-md p-6 w-full ">
              {/* Campo Empreendimento */}
              <div className="flex flex-col sm:flex-row sm:items-center mb-6">
                <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
                  Empreendimento:
                </label>
                <InputText
                  value={nomeDocumento}
                  onChange={(e) => setNomeDocumento(e.target.value)}
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
                  value={localizacaoDocumento}
                  onChange={(e) => setLocalizacaoDocumento(e.target.value)}
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
                  value={descricaoDocumento}
                  onChange={(e) => setDescricaoDocumento(e.target.value)}
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
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
