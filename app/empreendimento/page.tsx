"use client";

import React, { useState, useEffect, useMemo } from "react";
// Componentes importados
import Sidebar from "@/components/sections/Sidebar";
// import CustomTable from "@/components/tableInfo/page"; // Manter só para tipagem se necessário, mas está em ItemAdditionSection
import FormEmpreendimento from "@/components/formEditPage/page";
import ActionBar from "@/components/componentHeader/page";
import Header from "@/components/teste/header/page";
// Novo componente de adição de itens
import ItemAdditionSection from "@/components/sections/ItemAdditionSection";

// Tipagem de dados e Redux
import { useAppSelector, useAppDispatch } from "../hooks";
import { addMaterials } from "../features/docs/docsSlice";
// Custom Hook
import {
  useEmpreendimentoData,
  ItemOption,
} from "../hooks/useEmpreendimentoData";

// Reutilizar a interface de Items para o estado da tabela
interface TableItem {
  name: string;
  code: string;
}

const EmpreendimentoPage: React.FC = () => {
  // --- 1. Lógica de Dados (Custom Hook) ---
  const { categories, availableItemOptions, refetchTopicos } =
    useEmpreendimentoData();

  // --- 2. Lógica de Estado Local ---
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedItemsTemp, setSelectedItemsTemp] = useState<
    TableItem[] | null
  >(null);
  const [tableItems, setTableItems] = useState<TableItem[]>([]);

  // Filtra itens disponíveis removendo aqueles já na tabela
  const availableItems = useMemo(() => {
    return availableItemOptions.filter(
      (item) => !tableItems.some((t) => t.code === item.code)
    );
  }, [availableItemOptions, tableItems]);

  // --- 3. Lógica de Redux ---
  const DocumentoEmpreendimento = useAppSelector((state) => state.docs);
  const dispatch = useAppDispatch();

  // --- 4. Funções de Manipulação ---

  const handleAddItems = () => {
    if (
      selectedItemsTemp &&
      selectedItemsTemp.length > 0 &&
      selectedCategory &&
      selectedItem
    ) {
      // Filtra itens para garantir que apenas novos itens sejam adicionados
      const newItemsToAdd = selectedItemsTemp.filter(
        (item) => !tableItems.some((t) => t.code === item.code)
      );

      if (newItemsToAdd.length === 0) return;

      // Atualiza o estado da tabela (visível na UI)
      setTableItems((prev) => [...prev, ...newItemsToAdd]);

      // Dispara a ação do Redux Toolkit
      dispatch(
        addMaterials({
          topicSelected: selectedCategory,
          itemSelected: selectedItem,
          itemsAdded: newItemsToAdd.map((ni) => ({
            id: ni.code,
            nome: ni.name,
          })),
        })
      );

      // Limpa a seleção temporária
      setSelectedItemsTemp(null);

      // Logica de console (opcional, manter apenas para debug)
      console.log(`Tópico selecionado: ${selectedCategory}`);
      console.log(`Item tópico selecionado: ${selectedItem}`);
      console.log(
        `Items adicionados: ${newItemsToAdd.map((items) => items.name)}`
      );
    }
  };

  // Log do Redux (opcional, manter apenas para debug)
  // console.log(DocumentoEmpreendimento);

  // --- 5. Renderização (UI) ---
  return (
    <div>
      <div>
        <Header />
      </div>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          sections={categories}
          selectedCategory={selectedCategory}
          selectedItem={selectedItem}
          onSelect={(category, item) => {
            setSelectedCategory(category);
            setSelectedItem(item);
          }}
          onTopicCreated={refetchTopicos}
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 bg-white p-6 shadow-md overflow-auto">
          <div>
            <ActionBar />
          </div>
          <div>
            <FormEmpreendimento />
          </div>

          {/* Seção de Adição de Itens (Componente Filho) */}
          <ItemAdditionSection
            categories={categories}
            availableItems={availableItems as ItemOption[]} // Usamos o availableItems filtrado
            tableItems={tableItems}
            selectedCategory={selectedCategory}
            selectedItem={selectedItem}
            selectedItemsTemp={selectedItemsTemp}
            onCategorySelect={setSelectedCategory}
            onItemSelect={setSelectedItem}
            onSelectionChange={setSelectedItemsTemp}
            onAddItems={handleAddItems}
          />
        </div>
      </div>
    </div>
  );
};

export default EmpreendimentoPage;
