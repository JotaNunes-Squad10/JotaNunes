"use client";

import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect } from "react";
import { itemService, Item } from "@/lib/api";

interface Props {
  visible: boolean;
  onHide: () => void;
  item: { id: number; nome: string; descricao: string } | null;
  onUpdated: () => void;
}

export default function EditItemModal({
  visible,
  onHide,
  item,
  onUpdated,
}: Props) {
  const toast = useRef<Toast>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  // atualizar campos ao abrir modal
  useEffect(() => {
    setNome(item?.nome ?? "");
    setDescricao(item?.descricao ?? "");
  }, [item]);

  const save = async () => {
    if (!item) return;

    try {
      setLoading(true);

      // VALIDAR NOME EXISTENTE
      const all: Item[] = await itemService.getAllItem();

      const existe = all.some(
        (i) =>
          i.nome.toLowerCase() === nome.trim().toLowerCase() && i.id !== item.id
      );

      if (existe) {
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Já existe um item com esse nome.",
          life: 3000,
        });
        setLoading(false);
        return;
      }

      await itemService.updateItem({
        id: item.id,
        nome: nome.trim(),
        descricao,
      });

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Item atualizado!",
        life: 3000,
      });

      onUpdated();
      onHide();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao atualizar item.",
        life: 3000,
      });

      console.error("Erro ao atualizar item", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={visible}
        header="Editar Item"
        style={{ width: "40vw" }}
        onHide={onHide}
      >
        <div className="flex flex-col gap-3">
          <label>Nome</label>
          <input
            className="p-2 border rounded"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label>Descrição</label>
          <textarea
            className="p-2 border rounded"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <button
            onClick={save}
            disabled={loading}
            className="bg-[#0f582a] text-white p-3 rounded mt-3"
          >
            Salvar
          </button>
        </div>
      </Dialog>
    </>
  );
}
