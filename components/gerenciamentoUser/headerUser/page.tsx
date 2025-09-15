"use client";

import React, { useEffect, useState } from "react";
import { MouseEventHandler } from "react";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import 'primeicons/primeicons.css';


interface HeaderProps {
  onMenuClick?: MouseEventHandler<HTMLButtonElement>;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const token = getCookie("accessToken");
    if (token && typeof token === "string") {
      try {
        type JwtPayload = {
          username?: string;
          name?: string;
          firstName?: string;
        };
        const payload = jwtDecode<JwtPayload>(token);
        setUserName(payload?.username || payload?.name || payload?.firstName || "Usuário");
      } catch {
        setUserName("Usuário");
      }
    } else {
      setUserName("Usuário");
    }
  }, []);

  return (
    <header className="bg-white shadow flex flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2 w-full flex-nowrap overflow-x-auto">
      <div className="flex items-center gap-3 flex-nowrap">
        <button
          className="text-gray-700 hover:text-gray-900 ml-2 sm:ml-4 cursor-pointer transition hover:scale-110 hover:shadow-md focus:outline-none"
          onClick={onMenuClick}
        >
          <i className="pi pi-bars text-2xl cursor-pointer" />
        </button>
        <img
          src="/img/LogoPreta.png"
          alt="Logo"
          className="h-8 sm:h-10 w-auto"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-nowrap">
        <i className="pi pi-user text-2xl sm:text-xl text-gray-700" />
        <span className="text-xs sm:text-base truncate max-w-[120px] sm:max-w-xs">Bem-vindo, <span className="font-semibold">{userName}</span></span>
        <i className="pi pi-bell text-xl sm:text-2xl text-gray-700 mr-2 sm:mr-3" />
      </div>
    </header>
  );
};

export default Header;