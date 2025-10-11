"use client";

import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";

import {
  Topico,
  topicoService,
  subTopicosAmbienteService,
  SubTopic,
} from "@/lib/api";
import { useEffect, useState } from "react";
import { UnidadePrivativaPage } from "@/components/unidadePrivativa/page";

export default function PainelMenu() {
  // Inicialização do Toast (mantida)

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const mapTopicosToMenuItems = (
    topicos: Topico[],
    subTopicos: SubTopic[]
  ): MenuItem[] => {
    return topicos.map((topico, index) => ({
      label: `${index + 1}. ${topico.nome}`,
      icon: "pi pi-folder",
      items:
        topico.nome === "ÁREA COMUM"
          ? subTopicos.map((sub) => ({
              label: sub.nome,
              icon: "pi pi-tag",
              command: () => {
                console.log(
                  `Selecionado o subitem ${sub.nome} do tópico ${topico.nome}`
                );
              },
            }))
          : topico.nome === "UNIDADES PRIVATIVAS"
          ? UnidadePrivativaPage.map((uni) => ({
              label: uni.nome,
              icon: "pi pi-tag",
              command: () => {
                console.log(
                  `Selecionado o subtem ${uni.nome} do tópico ${topico.nome}`
                );
              },
            }))
          : [
              {
                label: "Subitem 1",
                icon: "pi pi-tag",
                command: () => {
                  console.log(`Selecionado o subitem do tópico ${topico.nome}`);
                },
              },
            ],
    }));
  };

  useEffect(() => {
    async function fetchTopicos() {
      try {
        const topicos = await topicoService.getAllTopic();
        const subitems = await subTopicosAmbienteService.getAllAmbiente();
        const mappedItems = mapTopicosToMenuItems(topicos, subitems);
        setMenuItems(mappedItems);
      } catch (error) {
        console.error("Erro ao carregar tópicos", error);
      }
    }

    fetchTopicos();
  }, []);

  return (
    // O div 'card' foi mantido, mas o w-full foi removido do PanelMenu
    <div className="card flex justify-content-center">
      <PanelMenu model={menuItems} className="w-full md:w-20rem" />
    </div>
  );
}
