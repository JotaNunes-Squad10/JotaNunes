"use client";
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import Header from "./headerUser/page";
import CreateUserModal from "./createUser/page";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

export default function GerenciamentoUser() {
  const [visible, setVisible] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [selected, setSelected] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  type User = {
    id?: string | number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    profile: number;
  };
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Buscar usuários na API
  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const token = typeof window !== "undefined" ? getCookie("accessToken") : "";
        const response = await fetch("https://jotanunesservice.onrender.com/api/v1/authentication/GetAllUsers", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await response.json();
        console.log("Resposta da API de usuários:", data);
        if (Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          setUsers([]);
          console.error("Formato inesperado da resposta de usuários", data);
        }
      } catch {
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, [showCreateModal]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={handleMenuClick} />
      <div className="relative flex flex-col md:flex-row w-full">
        {/* Sidebar */}
        <Sidebar
          visible={visible}
          onHide={handleHide}
          className="w-full max-w-xs md:w-80 bg-gray-600 mt-16 md:mt-32 z-20"
          closeIcon={
            <i
              className={`pi pi-angle-left text-white py-3 mr-3 font-bold text-2xl transition-transform duration-400 ${
                rotated ? "-rotate-180" : ""
              }`}
            />
          }
        >
          <div className="flex flex-col h-full justify-between">
            <div>
              <h2 className="text-white font-bold text-lg sm:text-2xl mb-4 sm:mb-10 ml-4 sm:ml-7">
                Painel Administrativo
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6 cursor-pointer hover:bg-gray-500 rounded ml-4 sm:ml-7 px-2 py-2 transition">
                <i className="pi pi-user text-white text-lg sm:text-2xl" />
                <span className="text-white text-sm sm:text-xl">Usuários</span>
              </div>
              <div className="flex items-center ml-4 sm:ml-7 gap-2 sm:gap-3 mb-3 sm:mb-6 cursor-pointer hover:bg-gray-500 rounded px-2 py-2 transition" onClick={handleGoToDashboard}>
                <i className="pi pi-file text-white text-lg sm:text-2xl" />
                <span className="text-white text-sm sm:text-xl">Dashboard</span>
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

        {/* Conteúdo principal */}
        <div className="flex-1 w-full max-w-6xl mx-auto transition-all duration-300 px-2 md:px-0">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-start mt-6 mb-8 w-full">
            <div className="flex items-center w-full md:w-80 shadow-sm border border-gray-200 rounded-2xl bg-white focus-within:ring-2 focus-within:ring-blue-400 transition-all duration-200 px-2 mb-2 md:mb-0">
              <span className="pi pi-search text-gray-500 mr-2 text-lg" />
              <input
                type="text"
                className="flex-1 py-2 px-2 bg-transparent outline-none text-gray-700 placeholder-gray-400 rounded-2xl focus:ring-0 text-sm sm:text-base"
                placeholder="Buscar usuários"
              />
            </div>

            {/* Botões */}
            <div className="flex flex-row gap-2 w-full md:w-auto justify-start items-center">
              <Button
                label="Pesquisar"
                className="bg-blue-500 text-white rounded-3xl px-6 py-2 text-sm md:text-xl font-normal hover:bg-blue-700 transition-all duration-200"
              />
              <Button
                label="Novo Usuário"
                className="bg-gray-300 text-black rounded-3xl px-6 py-2 text-sm md:text-xl font-normal hover:bg-gray-400 transition-all duration-200"
                onClick={() => setShowCreateModal(true)}
              />
              {selected && (
                <Button
                  label="Deletar"
                  className="bg-red-400 text-black rounded-3xl px-6 py-2 text-sm md:text-xl font-normal hover:bg-red-500 transition-all duration-200"
                />
              )}
            </div>
          </div>

          {/* Tabela dinâmica de usuários */}
          <div className="w-full px-0 md:px-0 md:max-w-6xl md:mx-auto">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white rounded-lg shadow text-xs md:text-base">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="px-2 sm:px-4 py-2 sm:py-4 font-semibold"></th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 font-semibold">Usuário</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 font-semibold">E-mail</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 font-semibold">Nome</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 font-semibold">Perfil</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-4 font-semibold">Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr><td colSpan={6} className="text-center py-6">Carregando usuários...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6">Nenhum usuário encontrado.</td></tr>
                  ) : (
                    users.map((user, idx) => (
                      <tr key={user.id || idx} className="bg-gray-200 hover:bg-gray-300 transition">
                        <td className="px-2 sm:px-3 py-2 sm:py-4">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={selected}
                            onChange={(e) => setSelected(e.target.checked)}
                          />
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-600">{user.username}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-600">{user.email}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-600">{user.firstName} {user.lastName}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 text-gray-600">{user.profile === 0 ? "Administrador" : user.profile === 1 ? "Gestor" : "Operador"}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4">
                          <button className="p-2 rounded hover:bg-gray-300">
                            <i className="pi pi-pencil text-gray-800 text-lg sm:text-xl" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
