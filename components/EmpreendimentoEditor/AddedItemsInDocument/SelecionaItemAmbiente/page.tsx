"use client";

import React, { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { subTopicosAmbienteService, SubTopic } from "@/lib/api";
import AdicionarNovoAmbiente from "./AdicionarNovoAmbiente/page";

interface Props {
  itemAmbienteSelecionado: any;
  setItemAmbienteSelecionado: (value: any) => void;
  ambienteSelecionado: string; // ex: "ÁREA COMUM"
}

interface DropdownOption {
  name: string;
  code: string;
}

export default function SelecioneItemAmbiente({
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
  ambienteSelecionado,
}: Props) {
  const [opcoesFiltradas, setOpcoesFiltradas] = useState<DropdownOption[]>([]);
  const [reloadFlag, setReloadFlag] = useState(false);

  useEffect(() => {
    async function fetchSubTopicos() {
      try {
        const allSubTopicos = await subTopicosAmbienteService.getAllAmbiente();

        let opcoes: DropdownOption[] = [];

        if (ambienteSelecionado === "ÁREA COMUM") {
          opcoes = allSubTopicos
            .filter((item) => item.topico.nome === "ÁREA COMUM")
            .map((item) => ({
              name: item.nome,
              code: item.id.toString(),
            }));
        } else if (ambienteSelecionado === "UNIDADES PRIVATIVAS") {
          opcoes = allSubTopicos
            .filter((item) => item.topico.nome === "UNIDADES PRIVATIVAS")
            .map((item) => ({
              name: item.nome,
              code: item.id.toString(),
            }));
        } else if (ambienteSelecionado === "MARCAS") {
          // Caso padrão, se quiser adicionar outros ambientes com apenas 1 subitem
          opcoes = [
            {
              name: "Descrição Marcas",
              code: "Descrição Marcas",
            },
          ];
        } else if (ambienteSelecionado) {
          // Caso padrão, se quiser adicionar outros ambientes com apenas 1 subitem
          opcoes = [
            {
              name: "Subitem 1",
              code: "subitem1",
            },
          ];
        }

        setOpcoesFiltradas(opcoes);
      } catch (error) {
        console.error("Erro ao buscar subitens", error);
      }
    }

    if (ambienteSelecionado) {
      fetchSubTopicos();
    } else {
      setOpcoesFiltradas([]);
    }
  }, [ambienteSelecionado, reloadFlag]);

  const handleCreateNewSubItem = () => {
    setReloadFlag((prev) => !prev);
  };

  return (
    <div className="flex gap-3 mb-5">
      <div className="card flex justify-content-center w-[50%]">
        <Dropdown
          value={
            opcoesFiltradas.find((i) => i.name === itemAmbienteSelecionado) ||
            null
          }
          onChange={(e: DropdownChangeEvent) =>
            setItemAmbienteSelecionado(e.value.name)
          }
          options={opcoesFiltradas}
          optionLabel="name"
          placeholder="Selecione Item do Ambiente"
          className="w-full md:w-14rem"
        />
      </div>
      <AdicionarNovoAmbiente
        ambienteSelecionado={ambienteSelecionado}
        onCreateNewSubItem={handleCreateNewSubItem}
      />
    </div>
  );
}
