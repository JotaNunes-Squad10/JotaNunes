import React, { useState } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Plus } from "lucide-react";
import ItemPage from "../item/page";

interface Items {
  name: string;
  code: string;
}

export default function ChipsDemo() {
  const [selectedItems, setSelectedItems] = useState<Items[]>([]);
  const items: Items[] = [];

  ItemPage.forEach((item) => {
    items.push({ name: item.nome, code: item.nome });
  });

  // Template para remover o ícone de verificado
  const itemTemplate = (option: Items) => (
    <div className="px-3 py-2 text-sm text-black hover:bg-blue-100 rounded-md">
      {option.name}
    </div>
  );

  return (
    <div className="flex w-full p-4">
      <MultiSelect
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
      />
      <button
        type="button"
        className="ml-2 p-2 rounded-sm hover:bg-gray-100 border border-gray-200 cursor-pointer"
      >
        <Plus className="w-4 h-4 text-green-500" />
      </button>
    </div>
  );
}
