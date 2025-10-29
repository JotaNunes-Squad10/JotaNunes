<<<<<<< HEAD
"use client";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2">
      <div className="flex items-center gap-3">
        <button className="text-gray-700 hover:text-gray-900">
          {/* Ícone de menu (SVG) */}
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img
          src="/img/LogoPreta.png"
          alt="Logo"
          className="h-8 sm:h-10 w-auto"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Ícone de usuário (SVG) */}
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
        </svg>
        <span className="text-sm sm:text-base text-gray-700">Usuário</span>
      </div>
    </header>
  );
};

=======
"use client";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2">
      <div className="flex items-center gap-3">
        <button className="text-gray-700 hover:text-gray-900">
          {/* Ícone de menu (SVG) */}
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img
          src="/img/LogoPreta.png"
          alt="Logo"
          className="h-8 sm:h-10 w-auto"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Ícone de usuário (SVG) */}
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
        </svg>
        <span className="text-sm sm:text-base text-gray-700">Usuário</span>
      </div>
    </header>
  );
};

>>>>>>> zambon
export default Header;