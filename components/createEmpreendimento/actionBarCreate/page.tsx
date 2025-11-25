"use client";

import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import { CreateDocumentoPayload, DocumentoService } from "@/lib/api";

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
  const [status, setStatus] = useState("Editando");
  const menuRef = useRef<Menu>(null);
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const router = useRouter();

  const statusOpcoes = [
    {
      label: "Editando",
      command: () => setStatus("Editando"),
    },
    {
      label: "Pendente de aprovação",
      command: () => setStatus("Pendente de aprovação"),
    },
    {
      label: "Em revisão",
      command: () => setStatus("Em revisão"),
    },
    {
      label: "Aprovado",
      command: () => setStatus("Aprovado"),
    },
    {
      label: "Rejeitado",
      command: () => setStatus("Rejeitado"),
    },
  ];

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

        const response = await DocumentoService.createDocumento(payload);

        toast.current?.show({
          severity: "success",
          summary: "Sucesso",
          detail: "Informações do empreendimento salvas com sucesso!",
          life: 3000,
        });

        setTimeout(() => {
          router.push(`/empreendimento/${response.data.id}`);
          console.log("O bagui foi enviado");
        }, 1500);

        return;
      } catch (error) {
        console.error("Erro ao criar um novo documento", error);
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

  const getStatuscolor = () => {
    switch (status) {
      case "Editando":
        return { backgroundColor: "#A8E6A1", color: "white", border: "none" };
      case "Pendente de aprovação":
        return { backgroundColor: "#FFD966", color: "white", border: "none" };
      case "Em revisão":
        return { backgroundColor: "#FF9800", color: "white", border: "none" };
      case "Aprovado":
        return { backgroundColor: "#4CAF50", color: "white", border: "none" };
      case "Rejeitado":
        return { backgroundColor: "#F44336", color: "white", border: "none" };
    }
  };

  return (
    <div className="flex sm:flex-row justify-end gap-3 mb-6">
      <Toast ref={toast} />
      <Menu model={statusOpcoes} popup ref={menuRef} />
      <Button
        label={`Status: ${status}`}
        style={{ ...getStatuscolor(), fontSize: "0.8rem" }}
        className="h-11 w-40 sm:w-48 sm:h-12"
        onClick={(e) => menuRef.current?.toggle(e)}
      />
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
