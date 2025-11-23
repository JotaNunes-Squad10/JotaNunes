import React, { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://jotanunesservice.onrender.com";

export default function UpdtePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmarSenha: "",
  });
  const [loading, setLoading] = useState(false);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getCookie("accessToken");

      const response = await axios.patch(
        `${BASE_URL}/api/v1/authentication/UpdatePassword`,
          {
            username: form.username,
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          },
          {
            timeout: 10000,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      if (response.status === 200 || response.status === 201) {
        toast.success(`Senha alterada com sucesso!`);
        setForm({
          username: "",
          currentPassword: "",
          newPassword: "",
          confirmarSenha:""
        });
        setTimeout(() => {
          onClose();
        }, 3800);
      } else {
        toast.error("Não foi possível alterar a senha!. Tente novamente.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.message || err.response?.data?.error || `Erro ${err.response?.status}: ${err.response?.statusText}` || "Erro ao criar usuário!";
          toast.error(errorMessage);
        } else {
          toast.error("Erro inesperado ao Alterar a Senha!");
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
          ×
        </button>
        <h2 className="text-2xl font-extrabold mb-2 text-gray-800 text-center flex items-center gap-2">
          <i className="pi pi-user-plus text-red-600 text-2xl" /> Alterar a Senha
        </h2>
        <p className="text-gray-500 text-sm mb-4 text-center">Preencha os dados para alterar a sua senha.</p>
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
            <label htmlFor="senha_atual" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-user text-gray-400" /> Senha Atual
            </label>
            <input
              id="senhaAtual"
              name="currentPassword"
              type="password"
              placeholder="Digite sua senha atual"
              value={form.currentPassword}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="nova_senha" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <i className="pi pi-envelope text-gray-400" /> Nova Senha
            </label>
            <input
              id="novaSenha"
              name="newPassword"
              type="password"
              placeholder="Digite sua nova senha"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirmar_senha"
              className="text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <i className="pi pi-lock text-gray-400" /> Confirmar Nova Senha
            </label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              placeholder="Repita sua nova senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              required
              className={`w-full rounded-xl border px-3 py-2 text-base focus:ring-2 transition shadow-sm ${
                form.confirmarSenha && form.newPassword !== form.confirmarSenha
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-red-200 focus:border-red-400"
              }`}
            />
            {/* Feedback visual */}
            {form.confirmarSenha && form.newPassword !== form.confirmarSenha && (
              <span className="text-xs text-red-500">
                As senhas não coincidem.
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-400 px-4 py-2.5 text-base font-bold text-white shadow-lg transition hover:from-red-700 hover:to-red-500 active:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <i className="pi pi-spin pi-spinner text-white text-lg" /> Alterando...
              </>
            ) : (
              <>
                <i className="pi pi-check text-white text-lg" /> Alterar Senha
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};