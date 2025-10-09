"use client";

import React, { useState, useEffect, useRef } from 'react';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';
import { UserRound } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

import UpdtePasswordModal from '../gerenciamentoUser/updtePasswd/page';

interface MenuUsuarioProps {
  userName: string;
}

interface JwtPayload {
  groups?: string[];
}

export default function Menu_usuario({ userName }: MenuUsuarioProps) {
  const menu = useRef<TieredMenu>(null);
  const [showUpdtePasswordModal, setShowUpdtePasswordModal] = useState(false);

  const token = Cookies.get("accessToken");
  let isAdmin = false;

  if (token) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      isAdmin = payload.groups?.includes("Administrador") ?? false;
    } catch (err) {
      console.error("Erro ao decodificar JWT:", err);
    }
  }

  function handleGoToDashboard() {
    window.location.href = "/dashboard";
  }

  function handleGoToUsers() {
    window.location.href = "/adm";
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/";
    }
  }

  function handleUpdatePassword() {
    setShowUpdtePasswordModal(true);
  }

  const items: MenuItem[] = [

    ...(isAdmin
  ? [
          {
            label: "Dashboard",
            command: () => handleGoToDashboard(),
          },
 
          {
            label: "Gerenciar Usuários",
            command: () => handleGoToUsers(),
          },
        ]
      : []),
    {
      label: "Alterar Senha",
      command: () => handleUpdatePassword(),

      
    },
    {
      label: "Sair",
      command: () => handleLogout(),
    },
  ];

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-nowrap cursor-pointer">
      {/* Menu invisível, só aparece no clique */}
      <TieredMenu model={items} popup ref={menu} breakpoint="700px" />

      {/* Container que abre o menu */}
      <div
        onClick={(e) => menu.current?.toggle(e)}
        className="flex items-center gap-1 sm:gap-2"
      >
        <UserRound size={22} className="text-gray-700" />
        <span className="text-xs sm:text-base truncate max-w-[120px] sm:max-w-xs">
          Bem-vindo(a), <span className="font-semibold">{userName}</span>
        </span>
      </div>
      {showUpdtePasswordModal && (
        <UpdtePasswordModal onClose={() => setShowUpdtePasswordModal(false)} />
      )}
    </div>
    
  );
}
