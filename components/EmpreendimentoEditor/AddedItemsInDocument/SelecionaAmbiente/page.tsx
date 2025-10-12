// components>EmpreendimentoEditor>AddedItemsInDocument>SelecionaAmbiente>page.tsx (Títulos)

import React, { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { topicoService, Topico } from "@/lib/api";

// 1. DADOS MOCKADOS (Simulando o resultado da transformação de TÍTULOS)
interface TituloAmbiente {
  name: string;
  code: string;
}

export default function SelecionaAmbiente() {
  const [titulos, setTitulos] = useState<TituloAmbiente[]>([]);
  const [selectedTitulo, setSelectedTitulo] = useState<TituloAmbiente | null>();

  useEffect(() => {
    async function fetchTopicos() {
      try {
        const allTopicos: Topico[] = await topicoService.getAllTopic();

        const titulosFormatados: TituloAmbiente[] = allTopicos.map(
          (topico, index) => ({
            name: `${index + 1}. ${topico.nome}`,
            code: topico.id.toString(),
          })
        );

        setTitulos(titulosFormatados);
      } catch (error) {
        console.error("Erro ao buscar tópicos", error);
      }
    }

    fetchTopicos();
  }, []);

  return (
    <div className="card flex justify-content-center mb-5 w-[50%]">
      <Dropdown
        value={selectedTitulo}
        onChange={(e: DropdownChangeEvent) => setSelectedTitulo(e.value)}
        options={titulos} // Usa os dados mockados diretamente
        optionLabel="name"
        placeholder="Selecione Ambiente"
        className="w-full md:w-14rem"
      />
    </div>
  );
}
