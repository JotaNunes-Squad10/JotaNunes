"use client";

import React from "react";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sections/Sidebar";
import Button from "@/components/sections/Button";
import DropDown from "@/components/sections/DropBox";
import DropBoxSubSelect from "@/components/sections/DropBoxSubSelect";
import CustomTable from "@/components/tableInfo/page";
import ObserverComponent from "@/components/ObserverComponent/page";
import FilterDemo from "@/components/sections/SelectedEdit";

import UnidadePrivativaPage from "@/components/unidadePrivativa/page";
import ActionBar from "@/components/componentHeader/page";
import FormEmpreendimento from "@/components/formEditPage/page";
import Header from "@/components/teste/header/page";
import axios from "axios";

interface Items {
  name: string;
  code: string;
}

interface Item {
  id: number;
  nome: string;
}

interface Ambiente {
  id: number;
  nome: string;
}

// Preparando o documento para payload

type Material = {
  id: string | number;
  nome: string;
  descricao: string | "";
};

type Topico = {
  title: string;
  items: ItemsTopico[];
};

type ItemsTopico = {
  id: number;
  nome: string;
  materiais: Material[];
};

type Documento = {
  id: number;
  empreendimento: string;
  localizacao: string;
  descricaoEmpreendimento: string;
  observacao: string;
  topicos: Topico[];
};

interface Categories {
  title: string;
  items: string[];
}

const EmpreendimentoPage: React.FC = () => {
  // Inicializando estados da página
  const [item, setItem] = useState<Item[]>([]);

  useEffect(() => {
    axios
      .get("https://jotanunesservice.onrender.com/api/v1/items/GetAllItems")
      .then((res) => setItem(res.data.data));
  }, []);

  const [selectedItemsTemp, setSelectedItemsTemp] = useState<Items[] | null>(
    null
  );
  const [tableItems, setTableItems] = useState<Items[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const items: Items[] = item?.map((item) => ({
    name: item.nome,
    code: item.nome,
  }));

  const availableItems = items.filter(
    (item) => !tableItems.some((t) => t.code === item.code)
  );

  const [ambiente, setAmbiente] = useState<Ambiente[] | []>([]);

  useEffect(() => {
    axios
      .get(
        "https://jotanunesservice.onrender.com/api/v1/ambiente/GetAllAmbientes"
      )
      .then((res) => setAmbiente(res.data.data));
  }, []);

  // Funções da página
  const itemsUnidadesPrivativas: ItemsTopico[] = [
    { id: 1, nome: "Área Técnica", materiais: [] },
    { id: 2, nome: "Circulação", materiais: [] },
    { id: 3, nome: "Cozinha/Área de Serviço", materiais: [] },
    { id: 4, nome: "Garden", materiais: [] },
    { id: 4, nome: "Quarto e Suíte", materiais: [] },
    { id: 6, nome: "Sanitário/Lavabo", materiais: [] },
    { id: 7, nome: "Sala de Estar/Jantar", materiais: [] },
    { id: 8, nome: "Varanda", materiais: [] },
  ];

  //   Exemplo de um mapeamento de items já integrado
  const AmbientesItems: ItemsTopico[] = [];

  ambiente.forEach((a) => {
    AmbientesItems.push({
      id: a.id,
      nome: a.nome,
      materiais: [],
    });
  });

  const DescricaoMarcaItems: ItemsTopico[] = [
    {
      id: 1,
      nome: "Drescrição da Marca",
      materiais: [],
    },
  ];

  const Topic: Topico[] = [
    {
      title: "1. Unidades Privativas",
      items: itemsUnidadesPrivativas,
    },
    {
      title: "2. Área Comum",
      items: AmbientesItems,
    },
    {
      title: "3. Marcas",
      items: DescricaoMarcaItems,
    },
  ];

  const Docs: Documento = {
    id: 1,
    empreendimento: "Pérolas do mar",
    localizacao: "Coroa do meio",
    descricaoEmpreendimento: "Empreendimento na coroa do meio",
    observacao: "Nenhuma observação",
    topicos: Topic,
  };

  const categories: Categories[] = [];

  Topic.forEach((t) => {
    categories.push({
      title: t.title,
      items: t.items.map((i) => i.nome),
    });
  });

  const currentOptions =
    categories.find((c) => c.title === selectedCategory)?.items || [];

  const handleAddItems = () => {
    if (selectedItemsTemp && selectedItemsTemp.length > 0) {
      const newItems = selectedItemsTemp.filter(
        (item) => !tableItems.some((t) => t.code === item.code)
      );
      setTableItems((prev) => [...prev, ...newItems]);
      setSelectedItemsTemp(null);

      console.log(`Tópico selecionado: ${selectedCategory}`);
      console.log(`Item tópico selecionado: ${selectedItem}`);
      console.log(`Items adicionados: ${newItems.map((items) => items.name)}`);

      Docs.topicos.forEach((topic) => {
        if (topic.title === selectedCategory) {
          topic.items.forEach((items) => {
            if (items.nome === selectedItem) {
              newItems.forEach((item) => {
                items.materiais.push({
                  id: item.code,
                  nome: item.name,
                  descricao: "",
                });
              });
            }
          });
        }
      });

      console.log(Docs);
    }
  };

  return (
    <div>
      <div>
        <Header />
      </div>
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
