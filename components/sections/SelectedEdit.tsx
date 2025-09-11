import React, { useState, useRef } from "react";
import {
  MultiSelect,
  MultiSelectChangeEvent,
  MultiSelect as MultiSelectRef,
} from "primereact/multiselect";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Plus } from "lucide-react";
import ItemPage from "../item/page"; // Assumindo que isso é um array de objetos com propriedade `nome`

interface Items {
  name: string;
  code: string;
}

export default function FilterDemo() {
  const [selectedItems, setSelectedItems] = useState<Items[] | null>(null);

  // Ref para acessar o MultiSelect
  const multiSelectRef = useRef<MultiSelectRef>(null);

  // Montando os items dinamicamente com base em ItemPage
  const items: Items[] = ItemPage.map((item) => ({
    name: item.nome,
    code: item.nome,
  }));

  // Template personalizado (sem ícone de verificado)
  const itemTemplate = (option: Items) => (
    <div className="px-3 py-2 text-sm text-black hover:bg-blue-100 rounded-md">
      {option.name}
    </div>
  );

  return (
    <div className="flex w-full p-4 px-0">
      <MultiSelect
        ref={multiSelectRef} // <== Referência aqui
        value={selectedItems}
        onChange={(e: MultiSelectChangeEvent) =>
          setSelectedItems(e.value as Items[])
        }
        options={items}
        display="chip"
        optionLabel="name"
        placeholder="Selecione os items"
        maxSelectedLabels={3}
        itemTemplate={itemTemplate}
        className="w-full max-w-md border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        panelClassName="no-check-icon max-h-60 overflow-y-auto border border-gray-200 shadow-md rounded-md"
        filter
        filterDelay={400}
      />
      <button
        type="button"
        className="ml-2 p-2 rounded-sm hover:bg-gray-100 border border-gray-200 cursor-pointer"
        onClick={() => multiSelectRef.current?.show()} // <== Abrir o dropdown
      >
        <Plus className="w-4 h-4 text-green-500" />
      </button>
    </div>
  );
}
