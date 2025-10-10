// components>EmpreendimentoEditor>AddedItemsInDocument>SelecionaAmbiente>page.tsx

import React, { useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
// 1. IMPORTAR OS DADOS DO menuData
import { menuData } from "../../getTopicos/getTopicos";

// 2. Definir a interface dos itens que o Dropdown irá usar
interface Ambiente {
  name: string;
  code: string; // Usaremos o próprio nome ou um índice como código, se necessário
}

// Função para transformar os dados do menuData para o formato do Dropdown
const transformMenuData = (data: typeof menuData): Ambiente[] => {
  const ambientes: Ambiente[] = [];

  // Itera sobre cada seção (ex: "1. Unidades privativas", "2. Área comum")
  data.forEach((section, sectionIndex) => {
    // Itera sobre cada item dentro da seção
    section.items.forEach((itemName, itemIndex) => {
      // Cria um objeto no formato Ambiente, usando o nome do item e um código único
      ambientes.push({
        name: itemName,
        // Cria um código único (ex: UP-01, AC-05) para o 'code' do PrimeReact
        code: `${section.title.split(".")[0]}-${sectionIndex}-${itemIndex}`,
      });
    });
  });
  return ambientes;
};

export default function SelecioneItemAmbiente() {
  const [selectedAmbiente, setSelectedAmbiente] = useState<Ambiente | null>(
    null
  );

  // 3. TRANSFORMAR E USAR OS DADOS
  const ambientes: Ambiente[] = transformMenuData(menuData);

  return (
    <div className="card flex justify-content-center">
      <Dropdown
        value={selectedAmbiente}
        onChange={(e: DropdownChangeEvent) => setSelectedAmbiente(e.value)}
        options={ambientes} // Passa o array transformado
        optionLabel="name"
        placeholder="Selecione um Ambiente"
        className="w-full md:w-14rem"
      />
    </div>
  );
}
