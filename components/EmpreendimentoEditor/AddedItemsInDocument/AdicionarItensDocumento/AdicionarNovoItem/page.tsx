"use client";

import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Item, itemService, ItemsServie } from "@/lib/api1";
import { Toast } from "primereact/toast";

interface Props {
  onReload: () => void;
}

export default function AdicionarNovoItem({ onReload }: Props) {
  const [visible, setVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const toast = useRef<Toast>(null);

  const create = async () => {
    try {
      // validar duplicidade
      const all: Item[] = await itemService.getAllItem();

      const exists = all.some(
        (i) => i.nome.toLowerCase() === nome.trim().toLowerCase()
      );

      if (exists) {
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Já existe um item com esse nome.",
          life: 3000,
        });
        return;
      }

      await ItemsServie.createItem({
        nome: nome.trim(),
        descricao,
      });

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Item criado!",
        life: 3000,
      });

      onReload();
      setVisible(false);
      setNome("");
      setDescricao("");
    } catch (err) {
      console.error("Erro ao criar item:", err);
    }
  };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <button
        onClick={() => setVisible(true)}
        className="px-4 py-3 border rounded-lg cursor-pointer hover:bg-gray-100 text-[#0f582a] border-gray-300"
      >
        <i className="pi pi-plus"></i>
      </button>

      <Dialog
        header="Novo Item"
        visible={visible}
        style={{ width: "35vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-col gap-3">
          <label>Nome</label>
          <input
            className="p-2 border rounded"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label>Descrição</label>
          <input
            className="p-2 border rounded"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button
            onClick={create}
            className="bg-[#0f582a] text-white p-3 rounded"
          >
            Criar Item
          </button>
        </div>
      </Dialog>
    </div>
  );
}
