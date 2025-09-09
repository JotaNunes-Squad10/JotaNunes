"use client";

import React from "react";
import Sidebar from "@/components/sections/Sidebar";
import Button from "@/components/sections/Button";
import DropDown from "@/components/sections/DropBox";

const EmpreendimentoPage: React.FC = () => {
  return (
    <div>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 bg-white p-6  shadow-md overflow-auto">
          <h2 className="text-black font-semibold mb-4">Adicionar Itens</h2>
          <DropDown options={["Opção 1", "Opção 2", "Opção 3"]} />
          <Button color="green" onClick={() => alert("Botão foi clicado")}>
            Adicionar Item
          </Button>
          <Button color="red" onClick={() => alert("Botão foi clicado")}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmpreendimentoPage;
