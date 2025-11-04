"use client";

import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";
import { useEffect, useState } from "react";

import {
  Topico,
  topicoService,
  subTopicosAmbienteService,
  SubTopic,
  DeleteTopicPayload,
} from "@/lib/api";

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

      subTopicos.forEach((sub) => {
        if (sub.topico.id === topico.id && sub.nome.trim() !== "") {
          childItems.push({
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
          });
        } else {
          // Caso não haja sub-tópicos, adiciona um item padrão
          const idTopic = topico.id;
          if (childItems.length === 0 && ![1, 2, 3].includes(idTopic)) {
            childItems.push(
              {
                label: "Adicione um novo ambiente",
                template: (item, options) => {
                  return (
                    <div
                      onClick={options.onClick}
                      className={`
                      flex items-center
                      px-3 py-2
                      rounded-md
                      cursor-pointer
                      color-gray-500
                    `}
                    >
                      Adicione um novo item
                    </div>
                  );
                },
              },
              {
                label: "Excluir Ambiente",
                icon: "",
                command: async () => {
                  try {
                    const idTopicoPayload: DeleteTopicPayload = {
                      id: topico.id,
                    };
                    await topicoService.deleteTopic(idTopicoPayload);

                    // Realizando regarga dos tópicos
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
              }
            );
          }
        }
      });

      // if (topico.nome === "ÁREA COMUM") {
      //   subTopicos.forEach((sub) => {
      //     if (sub.topico.id === topico.id) {
      //       childItems.push({
      //         label: sub.nome,
      //         icon: "",
      //         command: () => {
      //           setAmbienteSelecionado(topico.nome);
      //           setItemAmbienteSelecionado(sub.nome);
      //         },
      //         template: (item, options) => {
      //           const isSelected =
      //             ambienteSelecionado === topico.nome &&
      //             itemAmbienteSelecionado === sub.nome;

      //           return (
      //             <div
      //               onClick={options.onClick}
      //               style={{
      //                 backgroundColor: isSelected ? "#dc2626" : "transparent", // vermelho
      //                 color: isSelected ? "#ffffff" : "inherit",
      //                 fontWeight: isSelected ? "bold" : "normal",
      //                 padding: "0.5rem 0.75rem",
      //                 borderRadius: "0.375rem",
      //                 cursor: "pointer",
      //               }}
      //             >
      //               {sub.nome}
      //             </div>
      //           );
      //         },
      //       });
      //     }
      //   });
      // } else if (topico.nome === "UNIDADES PRIVATIVAS") {
      //   subTopicos.forEach((sub) => {
      //     if (sub.topico.id === topico.id) {
      //       childItems.push({
      //         label: sub.nome,
      //         icon: "",
      //         command: () => {
      //           setAmbienteSelecionado(topico.nome);
      //           setItemAmbienteSelecionado(sub.nome);
      //         },
      //         template: (item, options) => {
      //           const isSelected =
      //             ambienteSelecionado === topico.nome &&
      //             itemAmbienteSelecionado === sub.nome;

      //           return (
      //             <div
      //               onClick={options.onClick}
      //               style={{
      //                 backgroundColor: isSelected ? "#dc2626" : "transparent", // vermelho
      //                 color: isSelected ? "#ffffff" : "inherit",
      //                 fontWeight: isSelected ? "bold" : "normal",
      //                 padding: "0.5rem 0.75rem",
      //                 borderRadius: "0.375rem",
      //                 cursor: "pointer",
      //               }}
      //             >
      //               {sub.nome}
      //             </div>
      //           );
      //         },
      //       });
      //     }
      //   });
      // } else if (topico.nome === "MARCAS") {
      //   childItems = [
      //     {
      //       label: "Descrição Marcas",
      //       icon: "",
      //       command: () => {
      //         setAmbienteSelecionado(topico.nome);
      //         setItemAmbienteSelecionado("Descrição Marcas");
      //       },
      //       template: (item, options) => {
      //         const isSelected =
      //           ambienteSelecionado === topico.nome &&
      //           itemAmbienteSelecionado === "Descrição Marcas";

      //         return (
      //           <div
      //             onClick={options.onClick}
      //             style={{
      //               backgroundColor: isSelected ? "#dc2626" : "transparent",
      //               color: isSelected ? "#ffffff" : "inherit",
      //               fontWeight: isSelected ? "bold" : "normal",
      //               padding: "0.5rem 0.75rem",
      //               borderRadius: "0.375rem",
      //               cursor: "pointer",
      //             }}
      //           >
      //             Descrição Marcas
      //           </div>
      //         );
      //       },
      //     },
      //   ];
      // }
      // else {
      //   childItems = [
      //     {
      //       label: "Item 1",
      //       icon: "",
      //       command: () => {
      //         setAmbienteSelecionado(topico.nome);
      //         setItemAmbienteSelecionado("Descrição Marcas");
      //       },
      //       template: (item, options) => {
      //         const isSelected =
      //           ambienteSelecionado === topico.nome &&
      //           itemAmbienteSelecionado === "Descrição Marcas";

      //         return (
      //           <div
      //             onClick={options.onClick}
      //             style={{
      //               backgroundColor: isSelected ? "#dc2626" : "transparent",
      //               color: isSelected ? "#ffffff" : "inherit",
      //               fontWeight: isSelected ? "bold" : "normal",
      //               padding: "0.5rem 0.75rem",
      //               borderRadius: "0.375rem",
      //               cursor: "pointer",
      //             }}
      //           >
      //             Item 1
      //           </div>
      //         );
      //       },
      //     },
      //     {
      //       label: "Item 2",
      //       icon: "",
      //       command: () => {
      //         setAmbienteSelecionado(topico.nome);
      //         setItemAmbienteSelecionado("Descrição Marcas");
      //       },
      //       template: (item, options) => {
      //         const isSelected =
      //           ambienteSelecionado === topico.nome &&
      //           itemAmbienteSelecionado === "Descrição Marcas";

      //         return (
      //           <div
      //             onClick={options.onClick}
      //             style={{
      //               backgroundColor: isSelected ? "#dc2626" : "transparent",
      //               color: isSelected ? "#ffffff" : "inherit",
      //               fontWeight: isSelected ? "bold" : "normal",
      //               padding: "0.5rem 0.75rem",
      //               borderRadius: "0.375rem",
      //               cursor: "pointer",
      //             }}
      //           >
      //             Item 2
      //           </div>
      //         );
      //       },
      //     },
      //     // Deve ser sempre o ultimo item!
      //     {
      //       label: "Excluir Ambiente",
      //       icon: "",
      //       command: async () => {
      //         try {
      //           const idTopicoPayload: DeleteTopicPayload = {
      //             id: topico.id,
      //           };
      //           await topicoService.deleteTopic(idTopicoPayload);

      //           // Realizando regarga dos tópicos
      //           const novosTopicos = await topicoService.getAllTopic();
      //           const novosSubTopicos =
      //             await subTopicosAmbienteService.getAllAmbiente();

      //           setTopicos(novosTopicos);
      //           setSubTopicos(novosSubTopicos);
      //         } catch (error) {
      //           console.error("Erro ao excluir o tópico:", error);
      //         }
      //       },
      //       template: (item, options) => {
      //         const isSelected =
      //           ambienteSelecionado === topico.nome &&
      //           itemAmbienteSelecionado === "Descrição Marcas";

      //         return (
      //           <div
      //             onClick={options.onClick}
      //             className={`
      //               flex items-center
      //               px-3 py-2
      //               rounded-md
      //               cursor-pointer
      //               text-red-700
      //               hover:bg-red-600
      //               hover:text-white
      //               ${
      //                 isSelected
      //                   ? "bg-red-600 text-white font-bold"
      //                   : "bg-red-100 text-red-700"
      //               }
      //             `}
      //           >
      //             <i className="pi pi-times mr-3 text-lg" />
      //             Excluir Ambiente
      //           </div>
      //         );
      //       },
      //     },
      //   ];
      // }

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
