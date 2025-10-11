import React, { useRef } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";

export default function PainelMenu() {
  // Inicialização do Toast (mantida)
  const toast = useRef<Toast | null>(null);

  const mockMenuItems: MenuItem[] = [
    {
      label: "1. Unidades privativas",
      icon: "pi pi-folder",
      items: [
        {
          label: "Sala de Estar/Jantar",
          icon: "pi pi-tag",
          command: (event) => {
            // A função command deve ser adaptada para usar o mock
            // e o item específico.
            if (toast.current) {
              toast.current.show({
                severity: "info",
                summary: "Unidades privativas",
                detail: `Item selecionado: Sala de Estar/Jantar`,
                life: 3000,
              });
            }
          },
        },
        {
          label: "Circulação",
          icon: "pi pi-tag",
          command: () => {
            toast.current?.show({
              severity: "info",
              summary: "Unidades privativas",
              detail: `Item selecionado: Circulação`,
              life: 3000,
            });
          },
        },
      ],
    },
    {
      label: "2. Área comum",
      icon: "pi pi-folder",
      items: [
        {
          label: "Guarita",
          icon: "pi pi-tag",
          command: () => {
            toast.current?.show({
              severity: "info",
              summary: "Área comum",
              detail: `Item selecionado: Guarita`,
              life: 3000,
            });
          },
        },
        {
          label: "Gourmets",
          icon: "pi pi-tag",
          command: () => {
            toast.current?.show({
              severity: "info",
              summary: "Área comum",
              detail: `Item selecionado: Gourmets`,
              life: 3000,
            });
          },
        },
      ],
    },
    {
      label: "3. Marcas",
      icon: "pi pi-folder",
      items: [
        {
          label: "Descrição Marcas",
          icon: "pi pi-tag",
          command: () => {
            toast.current?.show({
              severity: "info",
              summary: "Marcas",
              detail: `Item selecionado: Descrição Marcas`,
              life: 3000,
            });
          },
        },
      ],
    },
  ];

  // O array 'items' agora usa os dados mockados diretamente
  const items: MenuItem[] = mockMenuItems;

  return (
    // O div 'card' foi mantido, mas o w-full foi removido do PanelMenu
    <div className="card flex justify-content-center">
      <PanelMenu model={items} className="w-full md:w-20rem" />
      <Toast ref={toast} />
    </div>
  );
}
