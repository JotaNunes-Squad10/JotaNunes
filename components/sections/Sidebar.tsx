"use client";

import React, { useState } from "react";
import UnidadePrivativaPage from "../unidadePrivativa/page";
import MarcasPage from "../marcas/page";
import AreaComumPage from "../areaComum/page";

// Inserindo os itens em arrays
const itemAreaPrivativaSection: string[] = []

UnidadePrivativaPage.forEach((item) => {
  itemAreaPrivativaSection.push(item.nome)
})

const nomeMarcasPageSection: string[] = ["Descrição das Marcas"]


const areaComumSection: string[] = []
AreaComumPage.forEach((item) => {
  areaComumSection.push(item.nome)
})

type NavItemProps = {
  title: string;
  items: string[];
  activeItem: string | null;
  setActiveItem: (item: string) => void;
  isCollapsed: boolean;
};

const NavSection: React.FC<NavItemProps> = ({
  title,
  items,
  activeItem,
  setActiveItem,
  isCollapsed,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        className="cursor-pointer flex justify-between items-center w-full px-3 py-2 text-left font-bold text-gray-800 hover:bg-gray-100 rounded-lg focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {!isCollapsed && <span>{title}</span>}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="black"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && !isCollapsed && (
        <ul className="mt-1 pl-4 space-y-1">
          {items.map((item, index) => (
            <li
              key={index}
              onClick={() => setActiveItem(item)}
              className={`cursor-pointer px-3 py-1 rounded-md text-sm ${
                activeItem === item
                  ? "bg-red-600 text-white font-medium"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sections = [
    {
      title: "1. Unidades privativas",
      items: itemAreaPrivativaSection,
    },
    {
      title: "2. Área comum",
      items: areaComumSection,
    },
    {
      title: "3. Marcas",
      items: nomeMarcasPageSection
    },
  ];

  return (
    <div
      className={`flex flex-col transition-all duration-300 border-r border-gray-200 h-screen bg-white
        ${isCollapsed ? "w-16 min-w-[64px]" : "w-64 min-w-[300px]"}`}
    >
      {/* Botão retrátil dentro da sidebar */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-gray-200 hover:bg-gray-300 p-1 rounded-full shadow cursor-pointer"
        >
          {isCollapsed ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="black"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7" // seta para direita
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="black"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7" // seta para esquerda
              />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">

        {sections.map((section, index) => (
          <NavSection
            key={index}
            title={section.title}
            items={section.items}
            activeItem={activeItem}
            setActiveItem={setActiveItem}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
