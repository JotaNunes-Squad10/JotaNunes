"use client";

import React, { useState } from "react";
import { Button } from "primereact/button"; // Usamos apenas o Button do PrimeReact
// Importações de CSS do PrimeReact (mantenha estas no seu projeto principal)
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Dados para preencher a sidebar, como na imagem
const menuData = [
  {
    title: "1. Unidades privativas",
    items: [
      "Sala de Estar/Jantar",
      "Circulação",
      "Quarto e Suíte",
      "Sanitário/ Lavabo",
      "Cozinha/ Área de Serviço",
      "Área Técnica",
      "Varanda",
      "Gardem",
    ],
  },
  {
    title: "2. Área comum",
    items: [
      "Guarita",
      "Gourmets",
      "Quiosques",
      "Copa Funcionários",
      "Petplay",
      "Parque Infantil",
      "Brinquedoteca",
      "Salão de Festas",
    ],
  },
];

export default function CustomSidebarComponent() {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
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
          {menuData.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {/* Título da Seção (com seta de recolher) */}
              <div className="flex items-center justify-between text-lg font-bold text-gray-800 cursor-pointer py-1">
                <h3 className="font-bold">{section.title}</h3>
                {/* Seta para cima */}
                <i className="pi pi-angle-up text-sm"></i>
              </div>
              <ul className="mt-1 space-y-0">
                {section.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className={
                      // Estilo para o item selecionado ("Sala de Estar/Jantar")
                      item === "Sala de Estar/Jantar"
                        ? "bg-red-700 text-white font-semibold px-3 py-1.5 rounded-sm"
                        : "text-gray-700 px-3 py-1.5 hover:bg-gray-100 cursor-pointer rounded-sm"
                    }
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
