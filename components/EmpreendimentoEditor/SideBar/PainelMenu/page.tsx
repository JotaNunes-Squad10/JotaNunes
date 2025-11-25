"use client";

import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";
import { useCallback, useEffect, useState } from "react";

import {
  Topico,
  topicoService,
  subTopicosAmbienteService,
  SubTopic,
  DeleteTopicPayload,
} from "@/lib/api";

interface PainelMenuProps {
  ambienteSelecionado: string;
  setAmbienteSelecionado: React.Dispatch<React.SetStateAction<string>>;
  itemAmbienteSelecionado: string;
  setItemAmbienteSelecionado: React.Dispatch<React.SetStateAction<string>>;
  listaNovoAmbiente: string[];
}

export default function PainelMenu({
  ambienteSelecionado,
  setAmbienteSelecionado,
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
  listaNovoAmbiente,
}: PainelMenuProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [subTopicos, setSubTopicos] = useState<SubTopic[]>([]);

  // ============
  // 1. Carregar tópicos e subtópicos ao montar
  // ============
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

  // ============
  // 2. Recarregar ao criar novo ambiente
  // ============
  useEffect(() => {
    async function fetchData() {
      try {
        const topicos = await topicoService.getAllTopic();
        const subitems = await subTopicosAmbienteService.getAllAmbiente();
        setTopicos(topicos);
        setSubTopicos(subitems);
      } catch (error) {
        console.error("Erro ao recarregar tópicos", error);
      }
    }

    fetchData();
  }, [listaNovoAmbiente]);

  // ============================================================
  // 3. Função que gera a estrutura do menu
  //    Agora com useCallback para estabilizar a referência
  // ============================================================
  const mapTopicosToMenuItems = useCallback(
    (topicos: Topico[], subTopicos: SubTopic[]): MenuItem[] => {
      return topicos.map((topico, index) => {
        const childItems: MenuItem[] = [];

        subTopicos.forEach((sub) => {
          if (sub.topico.id === topico.id) {
            childItems.push({
              label: sub.nome,
              icon: "",
              command: () => {
                setAmbienteSelecionado(topico.nome);
                setItemAmbienteSelecionado(String(sub.id));
              },
              template: (item, options) => {
                const isSelected =
                  ambienteSelecionado === topico.nome &&
                  itemAmbienteSelecionado === String(sub.id);

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
                    {sub.nome}
                  </div>
                );
              },
            });
          }
        });

        // Apenas tópicos dinâmicos podem ser excluídos
        if (![1, 2, 3].includes(topico.id)) {
          childItems.push({
            label: "Excluir Ambiente",
            icon: "",
            command: async () => {
              try {
                const payload: DeleteTopicPayload = { id: topico.id };
                await topicoService.deleteTopic(payload);

                const novosTopicos = await topicoService.getAllTopic();
                const novosSubTopicos =
                  await subTopicosAmbienteService.getAllAmbiente();

                setTopicos(novosTopicos);
                setSubTopicos(novosSubTopicos);
              } catch (error) {
                console.error("Erro ao excluir o tópico:", error);
              }
            },
            template: (item, options) => {
              const isSelected =
                ambienteSelecionado === topico.nome &&
                itemAmbienteSelecionado === "Excluir Ambiente";

              return (
                <div
                  onClick={options.onClick}
                  className={`
                    flex items-center
                    px-3 py-2
                    rounded-md
                    cursor-pointer
                    text-red-700
                    hover:bg-red-600
                    hover:text-white
                    ${
                      isSelected
                        ? "bg-red-600 text-white font-bold"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  <i className="pi pi-times mr-3 text-lg" />
                  Excluir Ambiente
                </div>
              );
            },
          });
        }

        return {
          label: `${index + 1}. ${topico.nome}`,
          icon: "",
          items: childItems,
        };
      });
    },
    [
      ambienteSelecionado,
      itemAmbienteSelecionado,
      setAmbienteSelecionado,
      setItemAmbienteSelecionado,
    ]
  );

  // ============
  // 4. Recria menu sempre que dependências mudam — agora correto!
  // ============
  useEffect(() => {
    setMenuItems(mapTopicosToMenuItems(topicos, subTopicos));
  }, [mapTopicosToMenuItems, topicos, subTopicos]);

  return (
    <div className="card flex justify-content-center">
      <PanelMenu model={menuItems} className="w-full md:w-20rem" />
    </div>
  );
}
