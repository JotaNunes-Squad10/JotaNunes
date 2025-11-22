"use client";

import React, { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import {
  subTopicosAmbienteService,
  SubTopic,
  topicoService,
  Topico,
} from "@/lib/api1";
import AdicionarNovoAmbiente from "./AdicionarNovoAmbiente/page";

interface Props {
  itemAmbienteSelecionado: any;
  setItemAmbienteSelecionado: (value: any) => void;
  ambienteSelecionado: string;
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
        const allSubTopicos: SubTopic[] =
          await subTopicosAmbienteService.getAllAmbiente();
        const allTopics: Topico[] = await topicoService.getAllTopic();

        let opcoes: DropdownOption[] = [];

        allTopics.forEach((t) => {
          if (ambienteSelecionado === t.nome) {
            opcoes = allSubTopicos
              .filter((item) => item.topico.id === t.id)
              .map((item) => ({
                name: item.nome,
                code: item.id.toString(),
              }));
          }
        });

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

    console.log(ambienteSelecionado);
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
          disabled={
            ambienteSelecionado.toLocaleLowerCase() === "marcas" ? true : false
          }
        />
      </div>
      <AdicionarNovoAmbiente
        ambienteSelecionado={ambienteSelecionado}
        onCreateNewSubItem={handleCreateNewSubItem}
      />
    </div>
  );
}
