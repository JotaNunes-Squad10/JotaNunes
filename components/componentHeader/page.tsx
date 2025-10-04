"use client";

import React from "react";
import { Button } from "primereact/button";

export default function ActionBar() {
  const handleSalvar = () => {
    alert("Salvando dados...");
  };

  const handleStatus = () => {
    alert("Alterando status...");
  };

  const handleExportar = () => {
    alert("Exportando arquivo...");
  };

  return (
    <div className="flex flex-row sm:justify-end gap-2 sm:gap-8 mb-6">
      {/* Botão à esquerda */}
      <Button
        label="Salvar"
        className="p-button-success flex-1 min-w-[100px] max-w-[192px]"
        onClick={handleSalvar}
      />

      {/* Botão central */}
      <Button
        label="Status: Editando"
        className="p-button-info flex-1 min-w-[100px] max-w-[192px]"
        onClick={handleStatus}
      />

      {/* Botão à direita */}
      <Button
        label="Exportar"
        className="p-button-danger flex-1 min-w-[100px] max-w-[192px]"
        onClick={handleExportar}
      />
    </div>
  );
}
