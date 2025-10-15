"use client";
import React from "react";
import { Newspaper } from 'lucide-react';

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
            {/* Ícone de notícias (SVG) */}
            <Newspaper color="red" size={30} strokeWidth={1} />
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