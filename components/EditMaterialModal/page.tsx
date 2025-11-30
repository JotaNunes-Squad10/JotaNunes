"use client";

import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { useRef, useState, useEffect } from "react";
import { MaterialService, marcaService, Marca, Material } from "@/lib/api1";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";

interface Props {
  visible: boolean;
  onHide: () => void;
  material: { id: number; nome: string; marcaIds: number[] } | null;
  onUpdated: () => void;
}

interface MarcaOption {
  name: string;
  code: string;
}

export default function EditMaterialModal({
  visible,
  onHide,
  material,
  onUpdated,
}: Props) {
  const toast = useRef<Toast>(null);

  const [nome, setNome] = useState("");
  const [marcas, setMarcas] = useState<MarcaOption[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<MarcaOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const todasMarcas: Marca[] = await marcaService.getAllMarca();

      const formatted = todasMarcas.map((m) => ({
        name: m.nome,
        code: String(m.id),
      }));

      setMarcas(formatted);

      if (material) {
        setNome(material.nome);

        const selecionadas = formatted.filter((m) =>
          material.marcaIds.includes(Number(m.code))
        );

        setSelectedMarcas(selecionadas);
      }
    }

    load();
  }, [material]);

  const save = async () => {
    if (!material) return;

    try {
      setLoading(true);

      // VALIDAR NOME DUPLICADO
      const all: Material[] = await MaterialService.getAllMateriais();

      const exists = all.some(
        (m) =>
          m.nome.toLowerCase() === nome.trim().toLowerCase() &&
          m.id !== material.id
      );

      if (exists) {
        toast.current?.show({
          severity: "error",
          summary: "Erro",
          detail: "Já existe um material com esse nome.",
          life: 3000,
        });
        setLoading(false);
        return;
      }

      await MaterialService.updateMaterial({
        id: material.id,
        nome: nome.trim(),
        marcaIds: selectedMarcas.map((m) => Number(m.code)),
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

      console.error("Erro ao atualizar material", err);
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
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={onHide}
      >
        <div className="flex flex-col gap-3">
          <label>Nome</label>
          <input
            className="p-2 border rounded"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label>Marcas relacionadas</label>
          <MultiSelect
            value={selectedMarcas}
            onChange={(e: MultiSelectChangeEvent) => setSelectedMarcas(e.value)}
            options={marcas}
            optionLabel="name"
            display="chip"
            filter
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
