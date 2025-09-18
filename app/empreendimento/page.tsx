"use client";

import React from "react";
import { useState } from "react";
import Sidebar from "@/components/sections/Sidebar";
import Button from "@/components/sections/Button";
import DropDown from "@/components/sections/DropBox";
import DropBoxSubSelect from "@/components/sections/DropBoxSubSelect";
import CustomTable from "@/components/tableInfo/page";
import ObserverComponent from "@/components/ObserverComponent/page";
import ItemPage from "@/components/item/page";
import FilterDemo from "@/components/sections/SelectedEdit";

import UnidadePrivativaPage from "@/components/unidadePrivativa/page";
import AreaComumPage from "@/components/areaComum/page";
import ActionBar from "@/components/componentHeader/page";
import FormEmpreendimento from "@/components/formEditPage/page";

interface Items {
  name: string;
  code: string;
}

const EmpreendimentoPage: React.FC = () => {
  const [selectedItemsTemp, setSelectedItemsTemp] = useState<Items[] | null>(
    null
  );
  const [tableItems, setTableItems] = useState<Items[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const items: Items[] = ItemPage.map((item) => ({
    name: item.nome,
    code: item.nome,
  }));

  const availableItems = items.filter(
    (item) => !tableItems.some((t) => t.code === item.code)
  );

  const handleAddItems = () => {
    if (selectedItemsTemp && selectedItemsTemp.length > 0) {
      const newItems = selectedItemsTemp.filter(
        (item) => !tableItems.some((t) => t.code === item.code)
      );
      setTableItems((prev) => [...prev, ...newItems]);
      setSelectedItemsTemp(null);
    }
  };

  const categories = [
    {
      title: "1. Unidades Privativas",
      items: UnidadePrivativaPage.map((i) => i.nome),
    },
    {
      title: "2. Área Comum",
      items: AreaComumPage.map((i) => i.nome),
    },
    {
      title: "3. Marcas",
      items: ["Descrição das Marcas"],
    },
  ];

  const currentOptions =
    categories.find((c) => c.title === selectedCategory)?.items || [];

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar
          sections={categories}
          selectedCategory={selectedCategory}
          selectedItem={selectedItem}
          onSelect={(category, item) => {
            setSelectedCategory(category);
            setSelectedItem(item);
          }}
        />
        <div className="flex-1 bg-white p-6 shadow-md overflow-auto">
          <div>
            <ActionBar />
          </div>
          <div>
            <FormEmpreendimento />
          </div>

          <h2 className="text-black font-semibold mb-4 py-5">
            Adicionar Itens
          </h2>
          <div>
            <div>
              <DropDown
                options={categories.map((c) => c.title)}
                defaultLabel="Selecione a categoria"
                onSelect={(category) => {
                  setSelectedCategory(category);
                  setSelectedItem(null);
                }}
              />
              <DropBoxSubSelect
                options={currentOptions}
                defaultLabel="Selecione o item"
                onSelect={(item) => {
                  setSelectedItem(item);
                }}
              />
            </div>

            <div>
              <label className="text-black">Item</label>
              <div className="flex flex-col items-center space-y4 md:items-start">
                <FilterDemo
                  items={availableItems}
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
