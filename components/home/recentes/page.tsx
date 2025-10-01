"use client";
import React from "react";

type RecenteItem = {
  title: string;
  description: string;
};

const recentes: RecenteItem[] = [
  {
    title: "Torre PC - Mais Viver",
    description: "orem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
  {
    title: "Torre PC - Mais Viver",
    description: "orem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
  {
    title: "Torre PC - Residence",
    description: "orem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
  {
    title: "Torre PC - Residence",
    description: "orem ipsum dolor sit amet, consectetur adipisicing elit.",
  },
];

const Recentes: React.FC = () => {
  return (
    <>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold">Editados Recentemente</span>
        <button className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded font-medium text-sm hover:bg-red-700 transition">
          Ver Todos
          {/* Ícone seta (SVG) */}
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Lista de cartões */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentes.map((r, i) => (
          <div
            key={i}
            className="bg-gray-50 flex flex-col items-start border border-gray-200 rounded-lg p-5 h-[200px] min-w-[200px] w-full"
          >
            {/* Ícone de arquivo (SVG) */}
            <svg
              className="text-red-600 mb-2"
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="12" height="16" rx="2" stroke="currentColor" />
              <path d="M9 8h6" stroke="currentColor" />
              <path d="M9 12h6" stroke="currentColor" />
              <path d="M9 16h6" stroke="currentColor" />
            </svg>
            <div>
              <div className="font-semibold text-base">{r.title}</div>
              <div className="text-sm text-gray-400">{r.description}</div>
            </div>
          </div>
        ))}  
      </div>
    </>
  );
};

export default Recentes;