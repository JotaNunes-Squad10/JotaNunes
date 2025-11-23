"use client";

import React, { useEffect, useState } from "react";
import Image from 'next/image';
import { MouseEventHandler } from "react";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { Home } from "lucide-react";
import 'primeicons/primeicons.css';
import Menu_usuario from "@/components/menu_usuario/page";


interface HeaderProps {
  onMenuClick?: MouseEventHandler<HTMLButtonElement>;
}

const Header: React.FC<HeaderProps> = ({}) => {
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

    function handleGoToDashboard() {
    window.location.href = "/dashboard";
  }

  return (
    <header className="bg-white shadow flex flex-row items-center justify-between px-3 sm:px-6 py-2 sm:py-3 gap-2 w-full flex-nowrap overflow-x-auto">
      <div className="flex items-center gap-3 flex-nowrap">
        <button
          className="text-gray-700 hover:text-gray-900 ml-2 sm:ml-4 cursor-pointer transition hover:scale-110 focus:outline-none"
          onClick={handleGoToDashboard}
        >
          <Home color="red" size={25} strokeWidth={1.5}/>
          {/*<i className="pi pi-home cursor-pointer "
          style={{ fontSize: '1.5rem' }} 
          />*/}
        </button>
        <a href="/dashboard" className="inline-block">
          <Image
            src="/img/LogoPreta.png"
            alt="Logo"
            width={100}
            height={100}
            className="h-8 sm:h-10 w-auto object-contain"
            priority
          />
        </a>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-nowrap">
        <Menu_usuario userName={userName} />
      </div>
    </header>
  );
};

export default Header;