"use client";

import React from "react";
import { useState } from "react";
import Sidebar from "@/components/sections/Sidebar";
import Button from "@/components/sections/Button";
import DropDown from "@/components/sections/DropBox";
import DropBoxSubSelect from "@/components/sections/DropBoxSubSelect";
import SelectedEdit from "@/components/sections/SelectedEdit";
import CustomTable from "@/components/tableInfo/page";
import ObserverComponent from "@/components/ObserverComponent/page";
import ItemPage from "@/components/item/page";
import FilterDemo from "@/components/sections/SelectedEdit";

interface Items {
  name: string;
  code: string;
}

const EmpreendimentoPage: React.FC = () => {
  const [selectedItemsTemp, setSelectedItemsTemp] = useState<Items[] | null>(
    null
  );
  const [tableItems, setTableItems] = useState<Items[]>([]);

  const items: Items[] = ItemPage.map((item) => ({
    name: item.nome,
    code: item.nome,
  }));

  const handleAddItems = () => {
    if (selectedItemsTemp && selectedItemsTemp.length > 0) {
      const newItems = selectedItemsTemp.filter(
        (item) => !tableItems.some((t) => t.code === item.code)
      );
      setTableItems([...tableItems, ...newItems]);
      setSelectedItemsTemp(null);
    }
  };

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 bg-white p-6 shadow-md overflow-auto">
          <h2 className="text-black font-semibold mb-4">Adicionar Itens</h2>
          <div>
            <div>
              <DropDown
                options={[
                  "1. Unidades Privativas",
                  "2. Área Comum",
                  "3. Marcas",
                ]}
              />
              <DropBoxSubSelect options={["Opção 1", "Opção 2"]} />
            </div>

            <div>
              <label className="text-black">Item</label>
              <div className="flex flex-col items-center space-y4 md:items-start">
                <FilterDemo
                  items={items}
                  selectedItems={selectedItemsTemp}
                  onSelectionChange={setSelectedItemsTemp}
                />

                <Button color="green" onClick={() => handleAddItems()}>
                  Adicionar Item
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <CustomTable data={tableItems || []} />
            </div>
            <div>
              <ObserverComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpreendimentoPage;
