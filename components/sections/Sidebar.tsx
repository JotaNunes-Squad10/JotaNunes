"use client";

import React, { useState } from "react";
import "primeicons/primeicons.css";
import CreateTopic from "../createTopicModal/page";

type NavItemProps = {
  title: string;
  items: string[];
  selectedItem: string | null;
  onSelect: (item: string) => void;
  isCollapsed: boolean;
};

const NavSection: React.FC<NavItemProps> = ({
  title,
  items,
  selectedItem,
  onSelect,
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
              onClick={() => onSelect(item)}
              className={`cursor-pointer px-3 py-1 rounded-md text-sm ${
                selectedItem === item
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

interface SideBarProps {
  sections: { title: string; items: string[] }[];
  selectedCategory: string | null;
  selectedItem: string | null;
  onSelect: (category: string, item: string) => void;
}

const Sidebar: React.FC<SideBarProps> = ({
  sections,
  selectedCategory,
  selectedItem,
  onSelect,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewModal, setViewModal] = useState(false);

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
            selectedItem={
              selectedCategory === section.title ? selectedItem : null
            }
            onSelect={(item) => onSelect(section.title, item)}
            isCollapsed={isCollapsed}
          />
        ))}
        {!isCollapsed && (
          <div className="p-3">
            <button
              className="border-2 border-dashed border-gray-300 text-gray-400 p-3 w-full cursor-pointer flex justify-center items-center gap-3 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-500"
              onClick={() => setViewModal(true)}
            >
              <i className="pi pi-plus"> </i> <p>Adicione novo tópico</p>
            </button>
          </div>
        )}
      </div>
      <CreateTopic visible={viewModal} onHide={() => setViewModal(false)} />
    </div>
  );
};

export default Sidebar;
