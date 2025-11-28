"use client";

import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect } from "react";
import { MaterialService } from "@/lib/api";
import { Dropdown } from "primereact/dropdown";

interface Props {
  visible: boolean;
  onHide: () => void;
  material: { id: number; nome: string; marcaId: number } | null;
  onUpdated: () => void;
}

export default function EditMaterialModal({
  visible,
  onHide,
  material,
  onUpdated,
}: Props) {
  const toast = useRef<Toast>(null);
  const [nome, setNome] = useState(material?.nome ?? "");
  const [marcaId, setMarcaId] = useState<number>(material?.marcaId ?? 0);
  const [marcas, setMarcas] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const m = await MaterialService.getAllMateriais();
      setMarcas(m.map((x) => ({ label: x.nome, value: x.id })));
    };
    load();
  }, []);

  const save = async () => {
    if (!material) return;

    try {
      setLoading(true);
      await MaterialService.updateMaterial({
        id: material.id,
        nome,
        marcaId,
      });

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Material atualizado!",
        life: 3000,
      });

      onUpdated();
      onHide();
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao atualizar material.",
        life: 3000,
      });

      console.error("Houve um erro ao atualizar o material", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={visible}
        header="Editar Material"
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

          <label>Marca</label>
          <Dropdown
            options={marcas}
            value={marcaId}
            onChange={(e) => setMarcaId(e.value)}
            className="w-full"
            placeholder="Selecione uma marca"
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
