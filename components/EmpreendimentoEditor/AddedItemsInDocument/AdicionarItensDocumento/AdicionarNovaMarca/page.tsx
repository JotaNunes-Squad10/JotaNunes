"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { MaterialService, marcaService } from "@/lib/api";
import { CreateMaterialPayload } from "@/lib/api"; // vamos criar essa interface abaixo!

interface Props {
  onReload: () => void;
}

interface MarcaOption {
  name: string;
  code: string;
}

export default function AdicionarNovoMaterial({ onReload }: Props) {
  const [visible, setVisible] = useState<boolean>(false);
  const [nomeMaterial, setNomeMaterial] = useState<string>("");

  const [marcas, setMarcas] = useState<MarcaOption[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<MarcaOption[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Material criado com sucesso!",
      life: 3000,
    });
  };

  const showError = () => {
    toast.current?.show({
      severity: "error",
      summary: "Erro",
      detail: "Não foi possível criar o material.",
      life: 3000,
    });
  };

  // ----------------------------------------------------------
  // Carregar marcas existentes
  // ----------------------------------------------------------
  useEffect(() => {
    const loadMarcas = async () => {
      try {
        const listaMarcas = await marcaService.getAllMarca();

        const formatted = listaMarcas.map((m) => ({
          name: m.nome,
          code: String(m.id),
        }));

        setMarcas(formatted);
      } catch (error) {
        console.error("Erro ao buscar marcas:", error);
      }
    };

    loadMarcas();
  }, []);

  // ----------------------------------------------------------
  // Criar Material
  // ----------------------------------------------------------
  const handleCreateMaterial = async () => {
    if (!nomeMaterial.trim()) {
      showError();
      return;
    }

    const payload: CreateMaterialPayload = {
      nome: nomeMaterial.trim(),
      marcaIds: selectedMarcas.map((m) => Number(m.code)),
    };

    try {
      setLoading(true);

      await MaterialService.createMaterial(payload);

      showSuccess();
      onReload();
      setVisible(false);

      // resetar modal
      setNomeMaterial("");
      setSelectedMarcas([]);
    } catch (err) {
      console.error("Erro ao criar material:", err);
      showError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />

      <button
        onClick={() => setVisible(true)}
        className="px-4 py-3 border border-gray-300 rounded-lg text-[#0f582a] cursor-pointer hover:bg-gray-100"
      >
        <i className="pi pi-plus"></i>
      </button>

      <Dialog
        header="Novo Material"
        visible={visible}
        modal={false}
        style={{ width: "40vw" }}
        onHide={() => setVisible(false)}
      >
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateMaterial();
            }}
          >
            <div className="flex flex-col gap-4">
              <label>Nome do novo material</label>
              <input
                type="text"
                placeholder="Nome do material"
                className="p-2 border border-gray-300 rounded-lg"
                value={nomeMaterial}
                onChange={(e) => setNomeMaterial(e.target.value)}
              />

              <label>Selecione as marcas do material</label>
              <MultiSelect
                value={selectedMarcas}
                onChange={(e: MultiSelectChangeEvent) =>
                  setSelectedMarcas(e.value)
                }
                options={marcas}
                optionLabel="name"
                placeholder="Selecione uma ou mais marcas"
                className="w-full md:w-14rem"
                display="chip"
                filter
              />

              <button
                type="submit"
                className="cursor-pointer bg-[#0f582a] p-3 text-white rounded-lg hover:opacity-95"
                disabled={loading}
              >
                Criar Material
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
