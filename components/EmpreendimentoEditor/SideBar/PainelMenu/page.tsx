import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";

export default function PainelMenu() {
  // Inicialização do Toast (mantida)

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
          },
        },
        {
          label: "Circulação",
          icon: "pi pi-tag",
          command: () => {},
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
          command: () => {},
        },
        {
          label: "Gourmets",
          icon: "pi pi-tag",
          command: () => {},
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
          command: () => {},
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
    </div>
  );
}
