import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import {
  AmbienteService,
  CreateAmbientePayload,
  topicoService,
} from "@/lib/api";

interface AdicionarNovoAmbienteProps {
  ambienteSelecionado: string;
  onCreateNewSubItem?: () => void;
}

export default function AdicionarNovoAmbiente({
  ambienteSelecionado,
  onCreateNewSubItem,
}: AdicionarNovoAmbienteProps) {
  const [visible, setVisible] = useState<boolean>(false);

  const [novoAmbiente, setNovoAmbiente] = useState<string>("");

  const handleCriarAmbiente = async () => {
    if (!novoAmbiente.trim()) {
      alert("Digite um nome válido para o ambiente.");
      return;
    }

    const allTopic = await topicoService.getAllTopic();
    const topic = allTopic.find((t) => t.nome === ambienteSelecionado);

    if (!topic) {
      console.error("Tópico não encontrado", ambienteSelecionado);
      return;
    }

    const payloadNovoAmbiente: CreateAmbientePayload = {
      nome: novoAmbiente,
      topicoId: topic.id,
    };

    try {
      await AmbienteService.createAmbiente(payloadNovoAmbiente);
      setVisible(false);
      onCreateNewSubItem?.();
    } catch (error) {
      console.error("Erro ao criar um ambiente", error);
    }
  };

  return (
    <div className="card flex justify-content-center">
      <button
        onClick={() => setVisible(true)}
        className="px-4 py-3 border border-gray-300 rounded-lg text-[#0f582a] cursor-pointer hover:bg-gray-100"
      >
        <i className="pi pi-plus"></i>
      </button>

      <Dialog
        header="Título do Ambiente"
        visible={visible}
        modal={false}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex flex-col">
              <label className="mb-4">Digite o nome do item</label>
              <input
                type="text"
                placeholder="Nome do item"
                className="p-2 border border-gray-300 rounded-lg mb-4"
                required
                onChange={(e) => setNovoAmbiente(e.target.value)}
              />
              <button
                type="submit"
                className="cursor-pointer bg-[#0f582a] p-3 text-white rounded-lg hover:opacity-95"
                onClick={handleCriarAmbiente}
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
