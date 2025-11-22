"use client";

import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { DocumentoService } from "@/lib/api1";
import { Toast } from "primereact/toast";

interface ActionBarProps {
  statusEmpreendimento: string;
  idDocumento: string;
}

export default function ActionBar({
  statusEmpreendimento,
  idDocumento,
}: ActionBarProps) {
  const [status, setStatus] = useState(statusEmpreendimento);
  const menuRef = useRef<Menu>(null);
  const toast = useRef<Toast>(null);

  const statusOpcoes = [
    {
      label: "Editando",
      command: async () => {
        setStatus("Editando");
        // 4
        try {
          await DocumentoService.updateEmpreendimentoStatus(idDocumento, 4);
          toast.current?.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Status do Documento salvo com sucesso!",
            life: 3000,
          });
        } catch (error) {
          console.error("Houve um erro ao salvar status", error);
        }
      },
    },
    {
      label: "Pendente",
      command: async () => {
        setStatus("Pendente");
        // 3
        try {
          await DocumentoService.updateEmpreendimentoStatus(idDocumento, 3);
          toast.current?.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Status do documento salvo com sucesso!",
            life: 3000,
          });
        } catch (error) {
          console.error("Houve um erro ao salvar status", error);
        }
      },
    },
    {
      label: "Em revisão",
      command: async () => {
        setStatus("Em revisão");
        // 2
        try {
          await DocumentoService.updateEmpreendimentoStatus(idDocumento, 2);
          toast.current?.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Status do documento salvo com sucesso!",
            life: 3000,
          });
        } catch (error) {
          console.error("Houve um erro ao salvar status", error);
        }
      },
    },
    {
      label: "Aprovado",
      command: async () => {
        setStatus("Aprovado");
        // 1
        try {
          await DocumentoService.updateEmpreendimentoStatus(idDocumento, 1);
          toast.current?.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Status do documento salvo com sucesso!",
            life: 3000,
          });
        } catch (error) {
          console.error("Houve um erro ao salvar status", error);
        }
      },
    },
    {
      label: "Cancelado",
      command: async () => {
        setStatus("Cancelado");
        // 5
        try {
          await DocumentoService.updateEmpreendimentoStatus(idDocumento, 5);
          toast.current?.show({
            severity: "success",
            summary: "Sucesso",
            detail: "Status do documento salvo com sucesso!",
            life: 3000,
          });
        } catch (error) {
          console.error("Houve um erro ao salvar status", error);
        }
      },
    },
  ];

  const getStatuscolor = () => {
    switch (status) {
      case "Editando":
        return { backgroundColor: "#A8E6A1", color: "white", border: "none" };
      case "Pendente":
        return { backgroundColor: "#FFD966", color: "white", border: "none" };
      case "Em revisão":
        return { backgroundColor: "#FF9800", color: "white", border: "none" };
      case "Aprovado":
        return { backgroundColor: "#4CAF50", color: "white", border: "none" };
      case "Cancelado":
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
    </div>
  );
}