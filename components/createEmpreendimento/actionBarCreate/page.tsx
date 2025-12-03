"use client";

import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import { CreateDocumentoPayload, empreendimentoService } from "@/lib/api1";
import { getCookie } from "cookies-next";

interface ActionBarCreateProps {
  nomeDocumento: string;
  localizacaoDocumento: string;
  descricaoDocumento: string;
}

export default function ActionBarCreate({
  nomeDocumento,
  localizacaoDocumento,
  descricaoDocumento,
}: ActionBarCreateProps) {
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    if (
      nomeDocumento.trim() ||
      localizacaoDocumento.trim() ||
      descricaoDocumento.trim()
    ) {
      try {
        const payload: CreateDocumentoPayload = {
          nome: nomeDocumento,
          descricao: descricaoDocumento,
          tamanhoArea: 0,
          localizacao: localizacaoDocumento,
          padrao: 1,
          empreendimentoTopicos: [],
        };

        const token = getCookie("accessToken");

        if (!token) {
          toast.current?.show({
            severity: "error",
            summary: "Erro",
            detail: "Token de autenticação não encontrado. Faça login novamente.",
            life: 3000,
          });
          setLoading(false);
          return;
        }

        // Envia o empreendimento com o token de autenticação
        const response = await empreendimentoService.createEmpreendimento(
          payload,
          token as string
        );

        console.log(response);

        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Informações do empreendimento salvas com sucesso!",
          life: 3000,
        });

        setTimeout(() => {
          router.push(`/empreendimento/${response.data.id}`);
        }, 1500);

        return;
      } catch (error) {
        console.error("Erro ao criar um novo documento", error);
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao criar empreendimento. Tente novamente.",
          life: 3000,
        });
      } finally {
        setLoading(false);
      }

      return;
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
    setLoading(false);
  };

  return (
    <div className="flex sm:flex-row justify-end gap-3 mb-6">
      <Toast ref={toast} />
      <Button
        label="Criar Documento"
        icon="pi pi-check"
        className="p-button-next px-4 py-2"
        onClick={handleSave}
        loading={loading}
      />
    </div>
  );
}
