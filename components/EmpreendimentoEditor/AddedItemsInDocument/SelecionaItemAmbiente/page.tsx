// components>EmpreendimentoEditor>AddedItemsInDocument>SelecionaAmbiente>page.tsx (Títulos)

import React, { useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

// 1. DADOS MOCKADOS (Simulando o resultado da transformação de TÍTULOS)
interface SubTituloAmbiente {
  name: string;
  code: string;
}

const mockTitulos: SubTituloAmbiente[] = [
  { name: "Sala de Estar/Jantar", code: "UP-7" },
  { name: "Área Técnica", code: "UP-1" },
  { name: "Academia", code: "AC-1" },
  { name: "Brinquedoteca", code: "AC-4" },
  { name: "Descrição Marcas", code: "MA-1" },
  { name: "Piscina", code: "AC-5" },
  { name: "Garagem", code: "AC-6" },
  { name: "Acabamento Externo", code: "MA-2" },
  { name: "Acabamento Interno", code: "MA-3" },
  { name: "Ar Condicionado", code: "MA-4" },
];

export default function SubSelectAmbiente() {
  const [selectedTitulo, setSelectedTitulo] =
    useState<SubTituloAmbiente | null>(
      mockTitulos[0] // Seleciona o primeiro por padrão
    );

  return (
    <div className="card flex justify-content-center mb-5 w-[50%]">
      <Dropdown
        value={selectedTitulo}
        onChange={(e: DropdownChangeEvent) => setSelectedTitulo(e.value)}
        options={mockTitulos} // Usa os dados mockados diretamente
        optionLabel="name"
        placeholder="Selecione Ambiente"
        className="w-full md:w-14rem"
      />
    </div>
  );
}
