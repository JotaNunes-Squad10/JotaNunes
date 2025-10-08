import React from "react";
import DropDown from "@/components/sections/DropBox"; // Ajuste o caminho se necessário
import DropBoxSubSelect from "@/components/sections/DropBoxSubSelect"; // Ajuste o caminho se necessário
import FilterDemo from "@/components/sections/SelectedEdit"; // Ajuste o caminho se necessário
import Button from "@/components/sections/Button"; // Ajuste o caminho se necessário
import CustomTable from "@/components/tableInfo/page"; // Ajuste o caminho se necessário
import ObserverComponent from "@/components/ObserverComponent/page"; // Ajuste o caminho se necessário
import { Categories } from "@/app/features/docs/docsTypes";
import { ItemOption } from "@/app/hooks/useEmpreendimentoData"; // O tipo ItemOption que criamos

// Interfaces para os dados da tabela
interface TableItem {
  name: string;
  code: string;
}

interface ItemAdditionSectionProps {
  categories: Categories[];
  availableItems: ItemOption[];
  tableItems: TableItem[];
  selectedCategory: string | null;
  selectedItem: string | null;
  selectedItemsTemp: TableItem[] | null;
  onCategorySelect: (category: string | null) => void;
  onItemSelect: (item: string | null) => void;
  onSelectionChange: (items: TableItem[] | null) => void;
  onAddItems: () => void;
  onRemoveItem: (itemCode: string) => void;
}

const ItemAdditionSection: React.FC<ItemAdditionSectionProps> = ({
  categories,
  availableItems,
  tableItems,
  selectedCategory,
  selectedItem,
  selectedItemsTemp,
  onCategorySelect,
  onItemSelect,
  onSelectionChange,
  onAddItems,
  onRemoveItem,
}) => {
  // Encontra as opções do sub-dropdown com base na categoria selecionada
  const currentOptions =
    categories.find((c) => c.title === selectedCategory)?.items || [];

  return (
    <div>
      <h2 className="text-black font-semibold mb-4 py-5">Adicionar Itens</h2>

      {/* Dropdowns de Categoria e Item */}
      <div>
        <div>
          <DropDown
            options={categories.map((c) => c.title)}
            defaultLabel="Selecione a categoria"
            onSelect={(category) => {
              onCategorySelect(category);
              onItemSelect(null); // Reseta o item ao mudar a categoria
            }}
          />
          <DropBoxSubSelect
            options={currentOptions}
            defaultLabel="Selecione o item"
            onSelect={onItemSelect}
          />
        </div>

        {/* Seleção de Itens (FilterDemo) e Botão de Adicionar */}
        <div>
          <label className="text-black">Item</label>
          <div className="flex flex-col items-center space-y4 md:items-start">
            <FilterDemo
              items={availableItems}
              selectedItems={selectedItemsTemp}
              onSelectionChange={onSelectionChange}
            />

            <Button
              color="green"
              onClick={onAddItems}
              disabled={
                !selectedCategory ||
                !selectedItem ||
                !selectedItemsTemp ||
                selectedItemsTemp.length === 0
              }
            >
              Adicionar Item
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela e Observer */}
      <div className="flex justify-center">
        <CustomTable data={tableItems || []} onRemoveItem={onRemoveItem} />
      </div>
      <div>
        <ObserverComponent />
      </div>
    </div>
  );
};

export default ItemAdditionSection;
