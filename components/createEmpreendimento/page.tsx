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
import { DocumentoService, CreateDocumentoPayload } from "@/lib/api";
import { useRouter } from "next/navigation";
import Header from "../gerenciamentoUser/headerUser/page";
import FormCreateEmpreendimento from "./formCriarCabecalho/page";

export default function CreateEmpreendimento() {
  // Estados para os campos do formulário
  const router = useRouter();

  const [nomeDocumento, setNomeDocumento] = useState<string>("");
  const [descricaoDocumento, setDescricaoDocumento] = useState<string>("");
  const [localizacaoDocumento, setLocalizacaoDocumento] = useState<string>("");
  const [tamanhoAreaDocumento, setTamanhoAreaDocumento] = useState<number>();
  const [padraoDocumento, setPadraoDocumento] = useState<number>(0);
  const [statusDocumento, setStatusDocumento] = useState<string>("");
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
      const payload: CreateDocumentoPayload = {
        nome: nomeDocumento,
        descricao: descricaoDocumento,
        tamanhoArea: tamanhoAreaDocumento || 0,
        localizacao: localizacaoDocumento,
        padrao: padraoDocumento || 1,
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
      <Header />
      <div className="pt-30 flex justify-center w-full">
        <div className="flex flex-col w-full max-screen-lg px-4 lg:w-[60%]">
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
      </div>
    </div>
  );
}
