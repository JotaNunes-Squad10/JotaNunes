"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
// Componentes importados
import Sidebar from "@/components/sections/Sidebar";
// import CustomTable from "@/components/tableInfo/page"; // Manter só para tipagem se necessário, mas está em ItemAdditionSection
import FormEmpreendimento from "@/components/formEditPage/page";
import ActionBar from "@/components/componentHeader/page";
import Header from "@/components/teste/header/page";
// Novo componente de adição de itens
import ItemAdditionSection from "@/components/sections/ItemAdditionSection";

// Tipagem de dados e Redux
import { useAppSelector, useAppDispatch } from "@/app/hooks";

import {
  loadDocument,
  addMaterials,
  setInitialTopics,
  removeMaterial,
} from "@/app/features/docs/docsSlice";

// Custom Hook
import {
  useEmpreendimentoData,
  ItemOption,
} from "@/app/hooks/useEmpreendimentoData";

import { useParams } from "next/navigation";

import axios from "axios";

// Reutilizar a interface de Items para o estado da tabela
interface TableItem {
  name: string;
  code: string;
}

const EmpreendimentoPage: React.FC = () => {
  // --- 1. Lógica de Dados (Custom Hook) ---

  // Ainda estou aqui ------------------
  const params = useParams();
  const documentId = Number(params.documentId);

  const [document, setDocument] = useState<any>();

  const DocumentoVazio = {
    id: 0,
    nome: "",
    descricao: "",
    localizacao: "",
    tamanhoArea: 0,
    padrao: "",
    status: "",
    versao: 0,
  };

  useEffect(() => {
    if (documentId === 0) {
      dispatch(loadDocument(DocumentoVazio));
      setDocument(DocumentoVazio);
    }

    axios
      .get(
        `https://jotanunesservice.onrender.com/api/v1/empreendimento/GetEmpreendimentoById/${documentId}`
      )
      .then((res) => {
        setDocument(res.data.data);
      })
      .catch((error) => {
        console.log(
          `Houve um erro ao resgatar o documento: ${documentId}`,
          error
        );
        setDocument(null);
      });
  }, []);

  console.log(document);

  const {
    categories,
    availableMaterialOptions,
    availableMarcaOptions,
    refetchTopicos,
    Topic,
  } = useEmpreendimentoData();

  // --- 3. Lógica de Redux ---
  const DocumentoEmpreendimento = useAppSelector((state) => state.docs);
  const dispatch = useAppDispatch();

  // Inicializa o estado do documento no Reduz com os tópicos da API
  useEffect(() => {
    if (Topic.length > 0 && DocumentoEmpreendimento.topicos.length === 0) {
      dispatch(setInitialTopics(Topic));
      console.log("Tópicos da API injetados no Redux.");
    }
  }, [Topic, DocumentoEmpreendimento.topicos.length, dispatch]);

  // --- 2. Lógica de Estado Local ---
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedItemsTemp, setSelectedItemsTemp] = useState<
    TableItem[] | null
  >(null);

  const tableItems = useMemo<TableItem[]>(() => {
    if (
      !selectedCategory ||
      !selectedItem ||
      !DocumentoEmpreendimento.topicos
    ) {
      return [];
    }

    const topic = DocumentoEmpreendimento.topicos.find(
      (t) => t.title === selectedCategory
    );
    if (!topic) return [];

    const item = topic.items.find((i) => i.nome === selectedItem);
    if (!item) return [];

    return item.materiais.map((mat) => ({
      name: mat.nome,
      code: String(mat.id),
    }));
  }, [DocumentoEmpreendimento.topicos, selectedCategory, selectedItem]);

  const currentAvailableOptions = useMemo(() => {
    const isMarcaTopic = selectedCategory?.trim() === "Marcas";

    const isMarcaItem = selectedItem?.trim() === "Descrição da Marca";

    if (selectedCategory && selectedItem && isMarcaTopic && isMarcaItem) {
      return availableMarcaOptions;
    }
    return availableMaterialOptions;
  }, [
    selectedCategory,
    selectedItem,
    availableMaterialOptions,
    availableMarcaOptions,
  ]);

  // Filtra itens disponíveis removendo aqueles já na tabela
  const availableItems = useMemo(() => {
    return currentAvailableOptions.filter(
      (item) => !tableItems.some((t) => t.code === item.code)
    );
  }, [currentAvailableOptions, tableItems]);

  // --- 4. Funções de Manipulação ---

  const handleAddItems = useCallback(() => {
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
  }, [selectedItemsTemp, selectedCategory, tableItems, dispatch]);

  const handleRemoveItem = useCallback(
    (materialCode: string) => {
      if (!selectedCategory || !selectedItem) {
        console.error("Ctegoria ou item não selecionados para remoção");
        return;
      }

      dispatch(
        removeMaterial({
          topicSelected: selectedCategory,
          itemSelected: selectedItem,
          materialCode: materialCode,
        })
      );
    },
    [selectedCategory, selectedItem, dispatch]
  );

  // Log do Redux (opcional, manter apenas para debug)
  console.log(DocumentoEmpreendimento);

  useEffect(() => {
    if (document) {
      dispatch(loadDocument(document));
    }
  }, [document, dispatch]);

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
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </div>
    </div>
  );
};

export default EmpreendimentoPage;
