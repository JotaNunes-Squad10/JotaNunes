"use client";

import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import Header from "../headerUser/page";

export default function SideBarAdm() {
      const [visible, setVisible] = useState(false);
      const [rotated, setRotated] = useState(false);

    const handleMenuClick = () => {
    setVisible(true);
    setRotated(false);
  };

const handleHide = () => {
    setRotated(true);
    setTimeout(() => {
      setRotated(false);
      setVisible(false);
    }, 400);
  };

  // Função para deslogar e redirecionar para login
  function handleLogout() {
    // Remove o token de autenticação
    if (typeof window !== "undefined") {
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // Redireciona para a tela de login
      window.location.href = "/login";
    }
  }

  // Função para redirecionar para o dashboard
  function handleGoToDashboard() {
    window.location.href = "/dashboard";
  }

  // Função para redirecionar para o painel de usuáios
  function handleGoToUsers() {
    window.location.href = "/adm";
  }

    return (
        <>
        <Header/>
        <Sidebar
          visible={visible}
          onHide={handleHide}
          className="w-full max-w-xs md:w-80 bg-gray-600 mt-16 md:mt-32 z-20"
          closeIcon={
            <i
              className={`pi pi-angle-left text-black py-3 mr-3 font-bold text-2xl transition-transform duration-400 ${
                rotated ? "-rotate-180" : ""
              }`}
            />
          }
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <h2 className="text-black font-bold text-lg sm:text-2xl mb-4 sm:mb-10 ml-4 sm:ml-7">
                Painel Administrativo
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6 cursor-pointer hover:bg-gray-500 rounded ml-4 sm:ml-7 px-2 py-2 transition" onClick={handleGoToUsers}>
                <i className="pi pi-user text-black text-lg sm:text-2xl" />
                <span className="text-black text-sm sm:text-xl">Usuários</span>
              </div>
              <div className="flex items-center ml-4 sm:ml-7 gap-2 sm:gap-3 mb-3 sm:mb-6 cursor-pointer hover:bg-gray-500 rounded px-2 py-2 transition" onClick={handleGoToDashboard}>
                <i className="pi pi-file text-black text-lg sm:text-2xl" />
                <span className="text-black text-sm sm:text-xl">Dashboard</span>
              </div>
              <div className="flex justify-center px-2 sm:px-4 mt-10 sm:mt-32">
                <Button
                  label="Sair"
                  className="bg-gray-300 text-black w-60 rounded-xl py-2 text-sm sm:text-xl font-normal hover:bg-gray-400 transition-all duration-200"
                  style={{ minWidth: "100px" }}
                  onClick={handleLogout}
                />
              </div>
            </div>
          </div>
        </Sidebar>
        </>
    );
}




