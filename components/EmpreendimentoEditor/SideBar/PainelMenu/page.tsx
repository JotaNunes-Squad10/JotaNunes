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

interface CustomSideBarProps {
  ambienteSelecionado: any;
  setAmbienteSelecionado: any;
  itemAmbienteSelecionado: any;
  setItemAmbienteSelecionado: any;
}

export default function PainelMenu({
  ambienteSelecionado,
  setAmbienteSelecionado,
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
}: CustomSideBarProps) {
  // Inicialização do Toast (mantida)

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const mapTopicosToMenuItems = (
    topicos: Topico[],
    subTopicos: SubTopic[]
  ): MenuItem[] => {
    return topicos.map((topico, index) => {
      let childItems: MenuItem[] = [];

      if (topico.nome === "ÁREA COMUM") {
        childItems = subTopicos.map((sub) => ({
          label: sub.nome,
          icon: "pi pi-tag",
          command: () => {
            setAmbienteSelecionado(topico.nome);
            setItemAmbienteSelecionado(sub.nome);
          },
        }));
      } else if (topico.nome === "UNIDADES PRIVATIVAS") {
        childItems = UnidadePrivativaPage.map((uni) => ({
          label: uni.nome,
          icon: "pi pi-tag",
          command: () => {
            setAmbienteSelecionado(topico.nome);
            setItemAmbienteSelecionado(uni.nome);
          },
        }));
      } else {
        childItems = [
          {
            label: "Subitem 1",
            icon: "pi pi-tag",
            command: () => {
              console.log(`Selecionando o subitem do tópico ${topico.nome}`);
            },
          },
        ];
      }

      return {
        label: `${index + 1}. ${topico.nome}`,
        icon: "pi pi-folder",
        items: childItems,
      };
    });
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
