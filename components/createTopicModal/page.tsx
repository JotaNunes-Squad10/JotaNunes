"use client";

import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import axios from "axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

interface CreateTopicProps {
  visible: boolean;
  onHide: () => void;
}

export default function CreateTopic({ visible, onHide }: CreateTopicProps) {
  const [nome, setNome] = useState<string>("");

  //   Configgurações do Toast
  const toast = useRef<Toast>(null);

  const showInfo = () => {
    toast.current?.show({
      severity: "info",
      summary: "Info",
      detail: "Enviando informações...",
      life: 3000,
    });
  };

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Novo tópico criado com sucesso",
      life: 3000,
    });
  };

  const showError = (error: any) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: `Erro: ${error}`,
      life: 3000,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando...");
    try {
      const response = await axios.post(
        "https://jotanunesservice.onrender.com/api/v1/topico/CreateTopico",
        {
          nome: nome,
        }
      );
      showSuccess();
    } catch (error: any) {
      showError(error);
      if (error.response) {
        console.error("Erro da API:", error.response.data);
      }
    }
  };

  return (
    <Dialog
      header="Novo tópico"
      visible={visible}
      style={{ width: "50vw" }}
      onHide={onHide}
    >
      <Toast ref={toast} />
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label>Nome do tópico</label>
        <input
          type="text"
          placeholder="Digite o nome do tópico"
          onChange={(e) => setNome(e.target.value)}
          required
          value={nome}
        />

        <Button
          type="submit"
          severity="info"
          label="Enviar"
          onClick={showInfo}
        />
      </form>
    </Dialog>
  );
}
