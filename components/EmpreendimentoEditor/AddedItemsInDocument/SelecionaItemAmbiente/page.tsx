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
  itemAmbienteSelecionado: string;
  setItemAmbienteSelecionado: (value: string) => void;
  ambienteSelecionado: string;
}

interface DropdownOption {
  name: string;
  code: string; // id do subtopico convertido para string
}

export default function SelecioneItemAmbiente({
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
  ambienteSelecionado,
}: Props) {
  const [opcoesFiltradas, setOpcoesFiltradas] = useState<DropdownOption[]>([]);
  const [reloadFlag, setReloadFlag] = useState<boolean>(false);

  // ---------------------------------------------------
  // LOAD SUBTOPICOS QUANDO TROCA O TÓPICO PRINCIPAL
  // ---------------------------------------------------
  useEffect(() => {
    async function fetchSubTopicos() {
      try {
        const allSubTopicos: SubTopic[] =
          await subTopicosAmbienteService.getAllAmbiente();

        const allTopics: Topico[] = await topicoService.getAllTopic();

        const topicoMatch = allTopics.find(
          (t) => t.nome === ambienteSelecionado
        );

        if (!topicoMatch) {
          setOpcoesFiltradas([]);
          return;
        }

        const opcoes = allSubTopicos
          .filter((sub) => sub.topico.id === topicoMatch.id)
          .map((sub) => ({
            name: sub.nome,
            code: String(sub.id),
          }));

        setOpcoesFiltradas(opcoes);
      } catch (error) {
        console.error("Erro ao buscar subitens", error);
      }
    }

    if (ambienteSelecionado) fetchSubTopicos();
    else setOpcoesFiltradas([]);
  }, [ambienteSelecionado, reloadFlag]);

  const handleCreateNewSubItem = () => {
    setReloadFlag((prev) => !prev);
  };

  // Valor selecionado deve bater pelo "code", não pelo "name"
  const selectedValue =
    opcoesFiltradas.find((o) => o.code === itemAmbienteSelecionado) || null;

  return (
    <div className="flex gap-3 mb-5">
      <div className="card flex justify-content-center w-[50%]">
        <Dropdown
          value={selectedValue}
          onChange={(e: DropdownChangeEvent) => {
            const option = e.value as DropdownOption;
            setItemAmbienteSelecionado(option.code);
          }}
          options={opcoesFiltradas}
          optionLabel="name"
          placeholder="Selecione Item do Ambiente"
          className="w-full md:w-14rem"
          disabled={ambienteSelecionado.toLowerCase() === "marcas"}
        />
      </div>

      <AdicionarNovoAmbiente
        ambienteSelecionado={ambienteSelecionado}
        onCreateNewSubItem={handleCreateNewSubItem}
      />
    </div>
  );
}
