"use client";

import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import {
  AmbienteService,
  CreateAmbientePayload,
  topicoService,
  subTopicosAmbienteService,
} from "@/lib/api1";
import { Toast } from "primereact/toast";

interface AdicionarNovoAmbienteProps {
  ambienteSelecionado: string; // nome do tópico selecionado
  onCreateNewSubItem?: () => void;
  disabled?: boolean;
}

export default function AdicionarNovoAmbiente({
  ambienteSelecionado,
  onCreateNewSubItem,
  disabled,
}: AdicionarNovoAmbienteProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [novoAmbiente, setNovoAmbiente] = useState<string>("");
  const toast = useRef<Toast>(null);

  const showError = (msg: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Erro",
      detail: msg,
      life: 3000,
    });
  };

  const showSuccess = (msg: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Sucesso",
      detail: msg,
      life: 3000,
    });
  };

  const handleCriarAmbiente = async () => {
    const nome = novoAmbiente.trim();
    if (!nome) {
      showError("Digite um nome válido para o ambiente.");
      return;
    }

    const allTopic = await topicoService.getAllTopic();
    const topic = allTopic.find((t) => t.nome === ambienteSelecionado);

    if (!topic) {
      showError("Tópico não encontrado.");
      return;
    }

    // 🔍 NOVA REGRA: validar se existe ambiente com este nome EM QUALQUER TÓPICO
    const allAmbientes = await subTopicosAmbienteService.getAllAmbiente();

    const existe = allAmbientes.some(
      (a) => a.nome.trim().toLowerCase() === nome.toLowerCase()
    );

    if (existe) {
      showError("Já existe um ambiente com esse nome em outro tópico.");
      return;
    }

    const payload: CreateAmbientePayload = {
      nome,
      topicoId: topic.id,
    };

    try {
      await AmbienteService.createAmbiente(payload);

      showSuccess("Ambiente criado com sucesso!");
      setVisible(false);
      setNovoAmbiente("");
      onCreateNewSubItem?.();
    } catch (error) {
      console.error("Erro ao criar um ambiente", error);
      showError("Erro ao criar ambiente.");
    }
  };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <button
        onClick={() => setVisible(true)}
        className={`
          px-4 py-3 border rounded-lg
          ${
            disabled
              ? "cursor-not-allowed opacity-40 bg-gray-200 border-gray-300 text-gray-400"
              : "cursor-pointer hover:bg-gray-100 text-[#0f582a] border-gray-300"
          }
        `}
      >
        <i className="pi pi-plus"></i>
      </button>

      <Dialog
        header="Criar Ambiente"
        visible={visible}
        modal={false}
        style={{ width: "35vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={() => setVisible(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCriarAmbiente();
          }}
        >
          <div className="flex flex-col">
            <label className="mb-4">Nome do ambiente</label>

            <input
              type="text"
              placeholder="Nome do ambiente"
              className="p-2 border border-gray-300 rounded-lg mb-4"
              required
              value={novoAmbiente}
              onChange={(e) => setNovoAmbiente(e.target.value)}
            />

            <button
              type="submit"
              className="cursor-pointer bg-[#0f582a] p-3 text-white rounded-lg hover:opacity-95"
            >
              Criar Ambiente
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
