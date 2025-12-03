// components/.../CriarNovoAmbiente.tsx
"use client";

import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { CreateTopicPayload, topicoService } from "@/lib/api1";

interface CriarNovoTopicoProps {
  // recebe a lista de nomes já existentes (string[]) ou um setter para atualizar o array de nomes
  setNovoTopico: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CriarNovoAmbiente({
  setNovoTopico,
}: CriarNovoTopicoProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [nomeTopico, setNomeTopico] = useState<string>("");
  const toast = useRef<Toast | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const showError = (detail: string) =>
    toast.current?.show({
      severity: "error",
      summary: "Erro",
      detail,
      life: 3000,
    });

  const showSuccess = (detail: string) =>
    toast.current?.show({
      severity: "success",
      summary: "Sucesso",
      detail,
      life: 3000,
    });

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const nome = nomeTopico.trim();
    if (!nome) {
      showError("Digite um nome válido para o tópico.");
      return;
    }

    try {
      setSaving(true);

      // valida duplicata (case-insensitive)
      const todosTopicos = await topicoService.getAllTopic();
      const existe = todosTopicos.some(
        (t) => String(t.nome).trim().toLowerCase() === nome.toLowerCase()
      );

      if (existe) {
        showError("Já existe um tópico com esse nome.");
        return;
      }

      const payload: CreateTopicPayload = { nome };
      await topicoService.createTopic(payload);

      // atualiza lista local de tópicos (só nomes)
      setNovoTopico((prev) => [...prev, nome]);

      showSuccess("Tópico criado com sucesso!");
      setNomeTopico("");
      setVisible(false);
    } catch (err) {
      console.error("Erro ao criar tópico:", err);
      showError("Erro ao criar tópico.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="
          flex items-center justify-center 
          w-full py-4 px-2 
          text-blue-600 font-semibold 
          bg-white transition duration-150
          border-2 border-dashed border-blue-500 
          rounded-xl 
          hover:bg-blue-50/70
          cursor-pointer
        "
      >
        <i className="pi pi-plus mr-3 text-lg" />
        Criar novo tópico
      </button>

      <Dialog
        header="Criar novo tópico"
        visible={visible}
        modal={false}
        style={{ width: "35vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={() => setVisible(false)}
      >
        <div>
          <form onSubmit={handleCreate}>
            <div className="flex flex-col">
              <label className="mb-4">Digite o nome do tópico</label>

              <input
                type="text"
                placeholder="Nome do tópico"
                className="p-2 border border-gray-300 rounded-lg mb-4"
                required
                value={nomeTopico}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                  setNomeTopico(ev.target.value)
                }
                disabled={saving}
              />

              <button
                type="submit"
                className="cursor-pointer bg-green-700 p-3 text-white rounded-lg hover:opacity-95"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Enviar"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
