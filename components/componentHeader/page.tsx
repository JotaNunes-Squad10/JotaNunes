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
    <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-6">
      {/* Botão à esquerda */}
      <Button
        label="Salvar"
        className="p-button-success w-full sm:w-48"
        onClick={handleSalvar}
      />

      {/* Botão central */}
      <Button
        label="Status: Editando"
        className="p-button-info w-full sm:w-48"
        onClick={handleStatus}
      />

      {/* Botão à direita */}
      <Button
        label="Exportar"
        className="p-button-danger w-full sm:w-48"
        onClick={handleExportar}
      />
    </div>
  );
}
