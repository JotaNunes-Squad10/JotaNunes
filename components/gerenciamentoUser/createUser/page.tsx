import React, { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { InputMask } from "primereact/inputmask";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://jotanunesservice.onrender.com";

export default function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Mapeamento de role para profile
  const roleToProfile: Record<string, number> = {
    Administrador: 1,
    Gestor: 2,
    Operador: 3,
  };

  // Função para gerar senha aleatória
  function generatePassword(length = 8) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  const token = getCookie("accessToken");
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/authentication/CreateUser`,
        {
          username: form.username,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          profile: roleToProfile[form.role],
          password: generatePassword(10),
        },
        {
          timeout: 10000,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Usuário criado com sucesso!");
        setForm({
          username: "",
          email: "",
          firstName: "",
          lastName: "",
          phone: "",
          role: "",
        });
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        toast.error("Não foi possível criar o usuário. Tente novamente.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Erro ao criar usuário!"
        );
      } else {
        toast.error("Erro ao criar usuário!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <ToastContainer theme="colored" />
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-[95vw] max-w-md relative border border-gray-200 animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-2xl font-bold transition-colors"
          onClick={onClose}
          aria-label="Fechar"
        >
          <span aria-hidden="true">×</span>
        </button>
        <h2 className="text-2xl font-extrabold mb-2 text-gray-800 text-center flex items-center gap-2">
          <i className="pi pi-user-plus text-red-600 text-2xl" /> Criar Usuário
        </h2>
        <p className="text-gray-500 text-sm mb-4 text-center">Preencha os dados para cadastrar um novo usuário.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-user text-gray-400" /> Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Nome de usuário"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-envelope text-gray-400" /> E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="E-mail do usuário"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-id-card text-gray-400" /> Primeiro nome
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Primeiro nome"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-id-card text-gray-400" /> Sobrenome
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Sobrenome"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-phone text-gray-400" /> Telefone
            </label>
            <InputMask
              id="phone"
              name="phone"
              mask="(99) 99999-9999"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.value ?? "" })}
              placeholder="(xx) xxxxx-xxxx"
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-shield text-gray-400" /> Perfil
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
              required
            >
              <option value="" disabled>Selecione um perfil</option>
              <option value="Administrador">Administrador</option>
              <option value="Gestor">Gestor</option>
              <option value="Operador">Operador</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-400 px-4 py-2.5 text-base font-bold text-white shadow-lg transition hover:from-red-700 hover:to-red-500 active:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner text-white text-lg" /> Criando...
              </>
            ) : (
              <>
                <i className="pi pi-check text-white text-lg" /> Criar Usuário
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
