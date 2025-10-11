"use client";

import React, { useEffect, useState } from "react";
import { MouseEventHandler } from "react";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import "primeicons/primeicons.css";

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
        setUserName(
          payload?.username || payload?.name || payload?.firstName || "Usuário"
        );
      } catch {
        setUserName("Usuário");
      }
    } else {
      setUserName("Usuário");
    }
  }, []);

  return (
    <header className="fixed top-0 z-30 h-16 bg-white shadow flex flex-row items-center justify-between px-2 sm:px-6 py-1.5 sm:py-3 gap-1 sm:gap-2 w-full flex-nowrap overflow-x-auto min-h-[48px]">
      <div className="flex items-center gap-2 sm:gap-3 flex-nowrap">
        <button
          className="text-gray-700 hover:text-gray-900 ml-1 sm:ml-4 cursor-pointer transition hover:scale-110 hover:shadow-md focus:outline-none"
          onClick={onMenuClick}
        >
          <i className="pi pi-bars text-xl sm:text-2xl cursor-pointer" />
        </button>
        <img
          src="/img/LogoPreta.png"
          alt="Logo"
          className="h-7 sm:h-10 w-auto max-w-[90px] sm:max-w-[140px]"
        />
      </div>
      <div className="flex items-center gap-0.5 sm:gap-2 flex-nowrap min-w-0">
        <i className="pi pi-user text-xl sm:text-xl text-gray-700" />
        <span className="text-[11px] sm:text-base truncate max-w-[80px] sm:max-w-xs">
          Bem-vindo(a), <span className="font-semibold">{userName}</span>
        </span>
        <i className="pi pi-bell text-lg sm:text-2xl text-gray-700 mr-1 sm:mr-3" />
      </div>
    </header>
  );
};

export default Header;
