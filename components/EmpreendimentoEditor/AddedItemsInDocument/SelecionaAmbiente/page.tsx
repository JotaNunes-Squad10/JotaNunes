// components>EmpreendimentoEditor>AddedItemsInDocument>SelecionaAmbiente>page.tsx (Títulos)

import React, { useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

// 1. DADOS MOCKADOS (Simulando o resultado da transformação de TÍTULOS)
interface TituloAmbiente {
  name: string;
  code: string;
}

const mockTitulos: TituloAmbiente[] = [
  { name: "1. Unidades privativas", code: "1" },
  { name: "2. Área comum", code: "2" },
  { name: "3. Marcas", code: "3" },
];

export default function SelecionaAmbiente() {
  const [selectedTitulo, setSelectedTitulo] = useState<TituloAmbiente | null>(
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
