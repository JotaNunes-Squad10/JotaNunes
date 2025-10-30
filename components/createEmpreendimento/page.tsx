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
import { DocumentoService } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateEmpreendimento() {
  // Estados para os campos do formulário
  const router = useRouter();

  const [nomeDocumento, setNomeDocumento] = useState<string>("");
  const [descricaoDocumento, setDescricaoDocumento] = useState<string>("");
  const [localizacaoDocumento, setLocalizacaoDocumento] = useState<string>("");
  const [tamanhoAreaDocumento, setTamanhoAreaDocumento] = useState<number>();
  const [padraoDocumento, setPadraoDocumento] = useState<number>();
  const [statusDocumento, setStatusDocumento] = useState<number>();
  const [versaoDocumento, setVersaoDocumento] = useState<number>();

  const toast = useRef<Toast>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async () => {
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

    setLoading(true);

    try {
      const payload = {
        nome: nomeDocumento,
        descricao: descricaoDocumento,
        tamanhoArea: tamanhoAreaDocumento || 0,
        localizacao: localizacaoDocumento,
        padrao: padraoDocumento || 1,
        status: statusDocumento || 3,
        empreendimentoTopicos: [],
      };

      const response = await DocumentoService.createDocumento(payload);

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Empreendimento criado com sucesso!",
        life: 3000,
      });

      setTimeout(() => {
        router.push(`/empreendimento/${response.data.id}`);
      }, 1500);

      return;
    } catch (error) {
      console.error("Erro ao criar empreendimento:", error);
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail:
          "Houve um erro ao criar o empreendimento. Tente novamente mais tarde.",
        life: 3000,
      });
    } finally {
      setLoading(false);
    }

    setTimeout(() => {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail:
          "Os campos empreendimento, localização e descrição são obrigatórios",
        life: 3000,
      });
    }, 1500);
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
                  label="Criar Empreendimento"
                  loading={loading}
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
