import React, { useState, useRef } from "react";
import {
  MultiSelect,
  MultiSelectChangeEvent,
  MultiSelect as MultiSelectRef,
} from "primereact/multiselect";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Plus } from "lucide-react";
import BasicDoc from "../modal/page";

interface Items {
  name: string;
  code: string;
}

interface FilterDemoProps {
  items: Items[];
  selectedItems: Items[] | null;
  onSelectionChange: (items: Items[] | null) => void;
}

export default function FilterDemo({
  items,
  selectedItems,
  onSelectionChange,
}: FilterDemoProps) {
  const multiSelectRef = useRef<MultiSelectRef>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex w-full max-w-4xl p-4 px-0">
      <MultiSelect
        ref={multiSelectRef}
        value={selectedItems}
        onChange={(e: MultiSelectChangeEvent) =>
          onSelectionChange((e.value as Items[]) || null)
        }
        options={items}
        display="chip"
        optionLabel="name"
        placeholder="Selecione os items"
        maxSelectedLabels={3}
        className="w-full max-w-4xl border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
        panelClassName="no-check-icon max-h-60 overflow-y-auto border border-gray-200 shadow-md rounded-md"
        filter
        filterDelay={400}
      />

      <button
        type="button"
        className="ml-2 p-2 rounded-sm hover:bg-gray-100 border border-gray-200 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <Plus className="w-4 h-4 text-green-500" />
      </button>

      <BasicDoc visible={showModal} onHide={() => setShowModal(false)} />
    </div>
  );
}
