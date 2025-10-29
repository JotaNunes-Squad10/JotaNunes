"use client";

import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { FileText } from "lucide-react";

export default function ActionBar() {

  const handleExportar = () => {
    alert("Exportando arquivo...");
  };

  const [status, setStatus] = useState("Editando");
  const menuRef = useRef<Menu>(null);

  const statusOpcoes = [
    {
      label: "Editando",
      command: () => setStatus("Editando"),
    },
    {
      label: "Pendente de aprovação",
      command: () => setStatus("Pendente de aprovação"),
    },
    {
      label: "Em revisão",
      command: () => setStatus("Em revisão"),
    },
    {
      label: "Aprovado",
      command: () => setStatus("Aprovado"),
    },
    {
      label: "Rejeitado",
      command: () => setStatus("Rejeitado"),
    },
  ];

  const getStatuscolor = () => {
    switch (status) {
      case "Editando":
        return { backgroundColor: "#A8E6A1", color: "white", border: "none" };
      case "Pendente de aprovação":
        return { backgroundColor: "#FFD966", color: "white", border: "none" };
      case "Em revisão":
        return { backgroundColor: "#FF9800", color: "white", border: "none" };
      case "Aprovado":
        return { backgroundColor: "#4CAF50", color: "white", border: "none" };
      case "Rejeitado":
        return { backgroundColor: "#F44336", color: "white", border: "none" };
    }
  };

  return (
    <div className="flex sm:flex-row justify-end gap-3 mb-6">
      <Menu model={statusOpcoes} popup ref={menuRef} />
      <Button
        label={`Status: ${status}`}
        style={{ ...getStatuscolor(), fontSize: "0.8rem" }}
        className="h-11 w-40 sm:w-48 sm:h-12"
        onClick={(e) => menuRef.current?.toggle(e)}
      />
      <Button
        label="Exportar PDF"
        className="h-11 w-40 sm:w-48 sm:h-12"
        style={{ fontSize: "0.8rem" }}
        severity="danger"
        onClick={handleExportar}
        icon={<FileText className="mr-2" size={15} />}
      />
    </div>
  );
}
