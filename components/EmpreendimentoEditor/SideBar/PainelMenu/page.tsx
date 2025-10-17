"use client";

import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";
import { useEffect, useState } from "react";

import {
  Topico,
  topicoService,
  subTopicosAmbienteService,
  SubTopic,
} from "@/lib/api";
import { UnidadePrivativaPage } from "@/components/unidadePrivativa/page";

interface CustomSideBarProps {
  ambienteSelecionado: any;
  setAmbienteSelecionado: any;
  itemAmbienteSelecionado: any;
  setItemAmbienteSelecionado: any;
  listaNovoAmbiente: string[];
}

const MarcasPage: any = [{ id: 1, nome: "Descrição Marcas" }];

export default function PainelMenu({
  ambienteSelecionado,
  setAmbienteSelecionado,
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
  listaNovoAmbiente,
}: CustomSideBarProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [subTopicos, setSubTopicos] = useState<SubTopic[]>([]);

  // 1. Buscar os dados apenas uma vez
  useEffect(() => {
    async function fetchData() {
      try {
        const topicos = await topicoService.getAllTopic();
        const subitems = await subTopicosAmbienteService.getAllAmbiente();
        setTopicos(topicos);
        setSubTopicos(subitems);
      } catch (error) {
        console.error("Erro ao carregar tópicos", error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const topicos = await topicoService.getAllTopic();
        const subitems = await subTopicosAmbienteService.getAllAmbiente();
        setTopicos(topicos);
        setSubTopicos(subitems);
      } catch (error) {
        console.error("Erro ao carregar tópicos", error);
      }
    }

    fetchData();
  }, [listaNovoAmbiente]);

  // 2. Recriar os menuItems sempre que os dados OU o estado de seleção mudar
  useEffect(() => {
    const mappedItems = mapTopicosToMenuItems(topicos, subTopicos);
    setMenuItems(mappedItems);
  }, [topicos, subTopicos, ambienteSelecionado, itemAmbienteSelecionado]);

  // 3. Função para mapear os dados para itens de menu com estilo
  const mapTopicosToMenuItems = (
    topicos: Topico[],
    subTopicos: SubTopic[]
  ): MenuItem[] => {
    return topicos.map((topico, index) => {
      let childItems: MenuItem[] = [];

      if (topico.nome === "ÁREA COMUM") {
        childItems = subTopicos.map((sub) => ({
          label: sub.nome,
          icon: "",
          command: () => {
            setAmbienteSelecionado(topico.nome);
            setItemAmbienteSelecionado(sub.nome);
          },
          template: (item, options) => {
            const isSelected =
              ambienteSelecionado === topico.nome &&
              itemAmbienteSelecionado === sub.nome;

            return (
              <div
                onClick={options.onClick}
                style={{
                  backgroundColor: isSelected ? "#dc2626" : "transparent", // vermelho
                  color: isSelected ? "#ffffff" : "inherit",
                  fontWeight: isSelected ? "bold" : "normal",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                }}
              >
                {sub.nome}
              </div>
            );
          },
        }));
      } else if (topico.nome === "UNIDADES PRIVATIVAS") {
        childItems = UnidadePrivativaPage.map((uni) => ({
          label: uni.nome,
          icon: "",
          command: () => {
            setAmbienteSelecionado(topico.nome);
            setItemAmbienteSelecionado(uni.nome);
          },
          template: (item, options) => {
            const isSelected =
              ambienteSelecionado === topico.nome &&
              itemAmbienteSelecionado === uni.nome;

            return (
              <div
                onClick={options.onClick}
                style={{
                  backgroundColor: isSelected ? "#dc2626" : "transparent",
                  color: isSelected ? "#ffffff" : "inherit",
                  fontWeight: isSelected ? "bold" : "normal",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                }}
              >
                {uni.nome}
              </div>
            );
          },
        }));
      } else {
        childItems = [
          {
            label: "Descrição Marcas",
            icon: "",
            command: () => {
              setAmbienteSelecionado(topico.nome);
              setItemAmbienteSelecionado("Descrição Marcas");
            },
            template: (item, options) => {
              const isSelected =
                ambienteSelecionado === topico.nome &&
                itemAmbienteSelecionado === "Descrição Marcas";

              return (
                <div
                  onClick={options.onClick}
                  style={{
                    backgroundColor: isSelected ? "#dc2626" : "transparent",
                    color: isSelected ? "#ffffff" : "inherit",
                    fontWeight: isSelected ? "bold" : "normal",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                  }}
                >
                  Descrição Marcas
                </div>
              );
            },
          },
        ];
      }

      return {
        label: `${index + 1}. ${topico.nome}`,
        icon: "",
        items: childItems,
      };
    });
  };

  return (
    <div className="card flex justify-content-center">
      <PanelMenu model={menuItems} className="w-full md:w-20rem" />
    </div>
  );
}
