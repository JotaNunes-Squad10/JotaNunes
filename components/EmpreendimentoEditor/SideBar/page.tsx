"use client";

import React, { useState } from "react";
import { Button } from "primereact/button"; // Usamos apenas o Button do PrimeReact
// Importações de CSS do PrimeReact (mantenha estas no seu projeto principal)
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import PainelMenu from "./PainelMenu/page";
import CriarNovoAmbiente from "./createAmbiente/page";

// Dados para preencher a sidebar, como na imagem

export default function CustomSidebarComponent() {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${visible ? "mt-12" : ""}`}>
      {/* BOTÃO QUADRADO para ABRIR a Sidebar (Seta para a direita)
          Fica no canto superior esquerdo e só aparece quando a sidebar está fechada
      */}
      {!visible && (
        <Button
          icon="pi pi-angle-right"
          onClick={() => setVisible(true)}
          className="fixed top-4 left-4 z-[100] p-button-text p-button-plain p-button-sm text-2xl text-gray-700 hover:bg-gray-200 transition-all duration-300"
          style={{ width: "45px", height: "45px", borderRadius: "4px" }} // Define o botão como quadrado
          aria-label="Abrir sidebar"
        />
      )}

      {/* SUBSTITUIÇÃO DO SIDEEBAR:
        Um DIV customizado que simula o comportamento da sidebar sem a máscara de bloqueio.
        - fixed top-0 left-0: Grudado na esquerda.
        - transform e translate-x: Controla a transição de entrada e saída.
      */}
      <div
        className={`fixed top-0 left-0 w-[280px] h-screen bg-white shadow-2xl z-[90] 
                    transform transition-transform duration-300
                    ${visible ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header da Sidebar (para o botão de fechar) */}
        <div className="flex justify-end p-2 ">
          <Button
            icon="pi pi-angle-left" // Seta para a esquerda
            onClick={() => setVisible(false)}
            className="p-button-text p-button-plain text-2xl text-gray-700 hover:text-red-700"
            aria-label="Fechar sidebar"
          />
        </div>

        {/* Conteúdo (Estrutura da Imagem) */}
        <div className="p-4 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
          <PainelMenu />
          <CriarNovoAmbiente />
        </div>
      </div>
    </div>
  );
}
