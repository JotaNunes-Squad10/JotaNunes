"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
// Importações de CSS do PrimeReact
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import PainelMenu from "./PainelMenu/page";
import CriarNovoAmbiente from "./createAmbiente/page";

interface CustomSideBarProps {
  ambienteSelecionado: string;
  setAmbienteSelecionado: React.Dispatch<React.SetStateAction<string>>;
  itemAmbienteSelecionado: string;
  setItemAmbienteSelecionado: React.Dispatch<React.SetStateAction<string>>;
}

export default function CustomSidebarComponent({
  ambienteSelecionado,
  setAmbienteSelecionado,
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
}: CustomSideBarProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [novoTopicoLista, setNovoTopicoLista] = useState<string[]>([]);

  return (
    <div className="relative">
      {/* Botão para abrir a sidebar */}
      {!visible && (
        <button
          className="fixed top-20 left-4 z-[100] 
            p-button-rounded bg-blue-600 border-none
            text-white font-bold shadow-lg cursor-pointer hover:bg-blue-700
            text-xl
            transition-all duration-300"
          style={{ width: "45px", height: "45px", borderRadius: "4px" }}
          onClick={() => setVisible(true)}
          aria-label="Abrir sidebar"
        >
          <i className="pi pi-bars"></i>
        </button>
      )}

      {/* Sidebar customizada */}
      <div
        className={`fixed top-17 left-0 w-[280px] h-screen bg-white shadow-2xl z-[90] 
                    transform transition-transform duration-300
                    ${visible ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Botão para fechar */}
        <div className="flex justify-end p-2 ">
          <Button
            icon="pi pi-angle-left"
            onClick={() => setVisible(false)}
            className="p-button-text p-button-plain text-2xl text-gray-700 hover:text-red-700"
            aria-label="Fechar sidebar"
          />
        </div>

        {/* Conteúdo */}
        <div className="p-4 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
          <PainelMenu
            ambienteSelecionado={ambienteSelecionado}
            setAmbienteSelecionado={setAmbienteSelecionado}
            itemAmbienteSelecionado={itemAmbienteSelecionado}
            setItemAmbienteSelecionado={setItemAmbienteSelecionado}
            listaNovoAmbiente={novoTopicoLista}
          />
          <CriarNovoAmbiente setNovoTopico={setNovoTopicoLista} />
        </div>
      </div>
    </div>
  );
}
