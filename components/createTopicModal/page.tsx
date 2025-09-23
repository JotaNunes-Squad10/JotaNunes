"use client";

import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import axios from "axios";

interface CreateTopicProps {
  visible: boolean;
  onHide: () => void;
}

export default function CreateTopic({ visible, onHide }: CreateTopicProps) {
  const [nomeTopico, setNomeTopico] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando...");
    try {
      const response = await axios.post(
        "https://jotanunesservice.onrender.com/api/v1/topico/CreateTopico",
        {
          nomeTopico,
        }
      );
      setStatus("Enviado com sucesso!");
    } catch (error) {
      setStatus("Erro ao tentar enviar!");
      console.log(error);
    }
  };

  return (
    <Dialog
      header="Novo tópico"
      visible={visible}
      style={{ width: "50vw" }}
      onHide={onHide}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label>Nome do tópico</label>
        <input
          type="text"
          placeholder="Digite o nome do tópico"
          onChange={(e) => setNomeTopico(e.target.value)}
          required
        />
        <button type="submit" className="cursor-pointer">
          Enviar
        </button>
        {status && <p>{status}</p>}
      </form>
    </Dialog>
  );
}
