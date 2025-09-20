"use client";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface User {
  id?: string | number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profile?: number;
  phone?: string;
}

interface EditUserModalProps {
  user: User;
  visible: boolean;
  actions: {
    onClose: () => void;
    onSave: (user: User) => void;
    onResetPassword?: (userId: string | number | undefined) => void;
  };
}
export default function EditUserModal({ user, visible, actions }: EditUserModalProps) {
  const { onClose, onSave, onResetPassword } = actions;
  const [form, setForm] = useState({ ...user });
  if (!visible) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await onSave(form);
      toast.success("Dados alterados com sucesso!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      toast.error("Erro ao salvar alterações!");
    }
  }

  async function handleResetPassword() {
    if (onResetPassword) {
      try {
        const result = await onResetPassword(user.id);
        if (typeof result === 'string') {
          toast.success(result);
        } else {
          toast.success("Senha resetada com sucesso!");
        }
      } catch (err) {
        if (err instanceof Error && err.message) {
          toast.error(err.message);
        } else {
          toast.error("Erro ao resetar senha!");
        }
      }
    }
  }

  return (
    <>
      <ToastContainer theme="colored" />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-[95vw] max-w-md relative border border-gray-200 animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold transition-colors"
          onClick={onClose}
          aria-label="Fechar"
        >
          <span aria-hidden="true">×</span>
        </button>
        <h2 className="text-2xl font-extrabold mb-2 text-gray-800 text-center flex items-center gap-2">
          <i className="pi pi-user-edit text-blue-600 text-2xl" /> Editar Usuário
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-user text-gray-400" /> Usuário
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Usuário"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-envelope text-gray-400" /> E-mail
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="E-mail"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-id-card text-gray-400" /> Nome
            </label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Nome"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-id-card text-gray-400" /> Sobrenome
            </label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Sobrenome"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-phone text-gray-400" /> Telefone
            </label>
            <input
              name="phone"
              value={form.phone || ''}
              onChange={handleChange}
              placeholder="Telefone"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-shield text-gray-400" /> Perfil
            </label>
            <select
              name="profile"
              value={form.profile ?? ''}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm bg-white"
            >
              <option value="">Selecione o perfil</option>
              <option value={0}>Administrador</option>
              <option value={1}>Gestor</option>
              <option value={2}>Operador</option>
            </select>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3 mt-4 justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              className="rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow transition-all px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base"
            >
              Resetar Senha
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gray-300 hover:bg-gray-400 text-black font-bold shadow transition-all px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base"
            >Cancelar</button>
            <button
              type="submit"
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow transition-all px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base"
            >Salvar</button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
}

