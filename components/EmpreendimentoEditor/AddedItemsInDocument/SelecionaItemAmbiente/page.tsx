// components>EmpreendimentoEditor>AddedItemsInDocument>SelecioneItemAmbiente>page.tsx (Itens)

import React, { useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

// 1. DADOS MOCKADOS (Simulando o resultado da combinação de TODOS os sub-itens)
interface Ambiente {
  name: string;
  code: string;
}

const mockItensAmbiente: Ambiente[] = [
  { name: "Sala de Estar/Jantar", code: "UP-7" },
  { name: "Área Técnica", code: "UP-1" },
  { name: "Academia", code: "AC-1" },
  { name: "Brinquedoteca", code: "AC-4" },
  { name: "Descrição Marcas", code: "MA-1" },
];

export default function SelecioneItemAmbiente() {
  const [selectedAmbiente, setSelectedAmbiente] = useState<Ambiente | null>(
    null
  );

  return (
    <div className="card flex justify-content-center w-[50%]">
      <Dropdown
        value={selectedAmbiente}
        onChange={(e: DropdownChangeEvent) => setSelectedAmbiente(e.value)}
        options={mockItensAmbiente} // Usa os dados mockados diretamente
        optionLabel="name"
        placeholder="Selecione um Item de Ambiente"
        className="w-full md:w-14rem"
      />
      <button>
        <p>Something</p>
      </button>
    </div>
  );
}
