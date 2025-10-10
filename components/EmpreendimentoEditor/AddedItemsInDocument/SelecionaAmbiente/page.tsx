// components>EmpreendimentoEditor>AddedItemsInDocument>SelecionaAmbiente>page.tsx

import React, { useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
// Importa os dados do menuData
import { menuData } from "../../getTopicos/getTopicos";

// 1. Definir a interface para os títulos
interface TituloAmbiente {
  name: string; // O título da seção (o que será exibido)
  code: string; // O código interno (pode ser o próprio título)
}

// Função para transformar apenas os títulos para o formato do Dropdown
const transformTitulos = (data: typeof menuData): TituloAmbiente[] => {
  // Mapeia o array, transformando cada seção em um objeto { name, code }
  return data.map((section) => ({
    name: section.title,
    code: section.title.split(".")[0], // Usa apenas o número (ex: "1" ou "2") como código
  }));
};

export default function SelecionaAmbiente() {
  const [selectedTitulo, setSelectedTitulo] = useState<TituloAmbiente | null>(
    null
  );

  // 2. Transforma os dados para obter apenas os títulos
  const titulosAmbiente: TituloAmbiente[] = transformTitulos(menuData);

  return (
    <div className="card flex justify-content-center">
      <Dropdown
        value={selectedTitulo}
        onChange={(e: DropdownChangeEvent) => setSelectedTitulo(e.value)}
        options={titulosAmbiente} // Passa o array de títulos
        optionLabel="name"
        placeholder="Selecione a Categoria" // Placeholder mais adequado
        className="w-full md:w-14rem"
      />
    </div>
  );
}
