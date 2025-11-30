"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { MaterialService, marcaService, Material } from "@/lib/api1";

interface Props {
  onReload: () => void;
}

interface MarcaOption {
  name: string;
  code: string;
}

export default function AdicionarNovoMaterial({ onReload }: Props) {
  const [visible, setVisible] = useState(false);
  const [nome, setNome] = useState("");
  const [marcas, setMarcas] = useState<MarcaOption[]>([]);
  const [selected, setSelected] = useState<MarcaOption[]>([]);
  const [loading, setLoading] = useState(false);

  const toast = useRef<Toast>(null);

  useEffect(() => {
    async function load() {
      const todas = await marcaService.getAllMarca();
      setMarcas(
        todas.map((m) => ({
          name: m.nome,
          code: String(m.id),
        }))
      );
    }
    load();
  }, []);

  const save = async () => {
    try {
      setLoading(true);

      // VALIDAR DUPLICIDADE
      const all: Material[] = await MaterialService.getAllMateriais();

      const exists = all.some(
        (m) => m.nome.toLowerCase() === nome.trim().toLowerCase()
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

      await MaterialService.createMaterial({
        nome: nome.trim(),
        marcaIds: selected.map((m) => Number(m.code)),
      });

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Material criado!",
        life: 3000,
      });

      onReload();
      setVisible(false);
      setNome("");
      setSelected([]);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: "Falha ao criar material.",
        life: 3000,
      });

      console.error("Erro ao criar material", err);
    } finally {
      setLoading(false);
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
        header="Novo Material"
        visible={visible}
        style={{ width: "40vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={() => setVisible(false)}
      >
        <div className="flex flex-col gap-4">
          <label>Nome</label>
          <input
            className="p-2 border rounded"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label>Marcas</label>
          <MultiSelect
            value={selected}
            onChange={(e: MultiSelectChangeEvent) => setSelected(e.value)}
            options={marcas}
            optionLabel="name"
            display="chip"
            filter
          />

          <button
            onClick={save}
            disabled={loading}
            className="bg-[#0f582a] text-white p-3 rounded"
          >
            Criar Material
          </button>
        </div>
      </Dialog>
    </div>
  );
}
