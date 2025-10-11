"use client";

import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";

import { Topico, topicoService } from "@/lib/api";
import { useEffect, useState } from "react";

export default function PainelMenu() {
  // Inicialização do Toast (mantida)

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const mapTopicosToMenuItems = (topicos: Topico[]): MenuItem[] => {
    return topicos.map((topico, index) => ({
      label: `${index + 1}. ${topico.nome}`,
      icon: "pi pi-folder",
      items: [
        {
          label: "Sub item 1",
          icon: "pi pi-tag",
          command: () => {
            console.log(`Selecionado: ${topico.nome} o Sub item 1`);
          },
        },
        {
          label: "Sub item 2",
          icon: "pi pi-tag",
          command: () => {
            console.log(`Selecionado: ${topico.nome} o Sub item 2`);
          },
        },
      ],
    }));
  };

  useEffect(() => {
    async function fetchTopicos() {
      try {
        const topicos = await topicoService.getAllTopic();
        const mappedItems = mapTopicosToMenuItems(topicos);
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
