import React, { useRef } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { MenuItem } from "primereact/menuitem";
import { Toast } from "primereact/toast";
import { title } from "process";

interface MenuData {
  title: string;
  items: string[];
}

interface PainelMenuProps {
  menuData: MenuData[];
}

export default function PainelMenu({ menuData }: PainelMenuProps) {
  const toast = useRef<Toast | null>(null);

  const items: MenuItem[] = menuData.map((section) => ({
    label: section.title,
    icon: "pi pi-folder",
    items: section.items.map((item) => ({
      label: item,
      icon: "pi pi-tag",
      command: () => {
        toast.current?.show({
          severity: "info",
          summary: section.title,
          detail: `Item selcion: ${item}`,
          life: 3000,
        });
      },
    })),
  }));

  return (
    <div className="card flex justify-content-center">
      <PanelMenu model={items} className="w-full md:w-20rem" />
      <Toast ref={toast} />
    </div>
  );
}
