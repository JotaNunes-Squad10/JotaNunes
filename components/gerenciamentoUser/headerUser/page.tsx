"use client";
import React from "react";
import { MouseEventHandler } from "react";
import 'primeicons/primeicons.css';

interface HeaderProps {
  onMenuClick?: MouseEventHandler<HTMLButtonElement>;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2">
      <div className="flex items-center gap-3">
        <button
          className="text-gray-700 hover:text-gray-900 ml-4 cursor-pointer transition hover:scale-110 hover:shadow-md focus:outline-none"
          onClick={onMenuClick}
        >
          <i className="pi pi-bars text-2xl" />
        </button>
        <img
          src="/img/LogoPreta.png"
          alt="Logo"
          className="h-8 sm:h-10 w-auto"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <i className="pi pi-bell text-2xl text-gray-700 mr-3" />
      </div>
    </header>
  );
};

export default Header;