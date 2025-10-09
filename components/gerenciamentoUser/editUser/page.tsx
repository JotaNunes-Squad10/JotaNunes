"use client";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { InputMask } from "primereact/inputmask";
import type { InputMaskChangeEvent } from 'primereact/inputmask';


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
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // Converter telefone do formato +5579987654321 para (79) 98765-4321 para exibição
  const formatPhoneForDisplay = (phone?: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 13 && digits.startsWith('55')) {
      const localNumber = digits.substring(2); // Remove o 55
      return `(${localNumber.substring(0, 2)}) ${localNumber.substring(2, 7)}-${localNumber.substring(7)}`;
    }
    return phone;
  };

  const [form, setForm] = useState({
    ...user,
    phone: formatPhoneForDisplay(user.phone),
    profile: user.profile ? Number(user.profile) : undefined,
  });

  // Atualizar form quando user mudar
  useEffect(() => {
    const profileAsNumber = user.profile ? Number(user.profile) : undefined;
    setForm({ ...user, phone: formatPhoneForDisplay(user.phone), profile: profileAsNumber });
  }, [user]);
  
  if (!visible) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    // converter profile para number quando alterado
    if (name === 'profile') {
      const n = value === '' ? undefined : Number(value);
      setForm((prev) => ({ ...prev, [name]: n }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    // Bloquear submit se tentar alterar username (campo já é readonly, mas por segurança)
    if (form.username !== user.username) {
      toast.error("O nome de usuário não pode ser alterado.");
      return;
    }
    // Validar perfil
    if (form.profile === undefined || ![1,2,3].includes(Number(form.profile))) {
      toast.error("Selecione um perfil válido (Administrador, Gestor ou Operador).");
      return;
    }
    // Validação do formato do telefone (igual ao createUser)
    const phonePattern = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    if (!phonePattern.test(form.phone || '')) {
      toast.error("Digite um telefone válido no formato (xx) xxxxx-xxxx!");
      return;
    }

    // Converter telefone para formato de 14 dígitos (+55xxxxxxxxxx)
    // Exemplo: "(79) 98765-4321" -> "+5579987654321"
    const phoneDigitsOnly = form.phone?.replace(/\D/g, '') || '';
    const formattedPhone = `+55${phoneDigitsOnly}`;
    try {
      setSaving(true);
      await onSave({ ...form, phone: formattedPhone } as User);
      toast.success("Dados alterados com sucesso!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      if (err instanceof Error && err.message) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao salvar alterações!");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!onResetPassword) return;
    try {
      setResetting(true);
      await onResetPassword(user.id);
      // Fechar o modal após reset bem-sucedido
      try { onClose(); } catch { }
    } catch (err) {
      if (err instanceof Error && err.message) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao resetar senha!");
      }
    } finally {
      setResetting(false);
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
          ×
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
              readOnly
              disabled={saving || resetting}
              placeholder="Usuário"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
              required
              title="O nome de usuário não pode ser alterado."
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
              disabled={saving || resetting}
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
              disabled={saving || resetting}
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
              disabled={saving || resetting}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-phone text-gray-400" /> Telefone
            </label>
            <InputMask
              name="phone"
              mask="(99) 99999-9999"
              value={form.phone}
              onChange={(e: InputMaskChangeEvent) => setForm({ ...form, phone: e.value ?? "" })}
              placeholder="(xx) xxxxx-xxxx"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm"
              disabled={saving || resetting}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-shield text-gray-400" /> Perfil
              {form.profile && (
                <span className="text-xs text-gray-500">
                  (atual: {form.profile === 1 ? 'Administrador' : form.profile === 2 ? 'Gestor' : form.profile === 3 ? 'Operador' : form.profile})
                </span>
              )}
            </label>
            <select
              name="profile"
              value={form.profile ? String(form.profile) : ''}
              onChange={(e) => handleChange(e)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm bg-white"
              disabled={saving || resetting}
            >
              <option value="">Selecione o perfil</option>
              <option value="1">Administrador</option>
              <option value="2">Gestor</option>
              <option value="3">Operador</option>
            </select>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3 mt-4 justify-end">
            <button
              type="button"
              onClick={handleResetPassword}
              className="rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow transition-all px-4 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base"
              disabled={saving || resetting}
            >
              {resetting ? (
                <svg className="animate-spin h-4 w-4 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
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
              disabled={saving || resetting}
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : null}
              Salvar
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  );
}