/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { authService } from "../../lib/api";

const BG_VIDEO_1 = "/img/videobackground.mp4";   
const BG_VIDEO_2 = "/img/videobackground2.mp4";  
const BG_IMAGE = "/img/background.png";
const LOGO_IMAGE = "/img/LogoPreta.png";

export default function JotanunesLogin() {
  const [showSupport, setShowSupport] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [videoSrc, setVideoSrc] = useState(BG_VIDEO_1);
  const [loading, setLoading] = useState(false);

  // Estados para modal de atualização de senha
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const updateVideo = () => {
      if (window.innerWidth < 1024) {
        setVideoSrc(BG_VIDEO_2); 
      } else {
        setVideoSrc(BG_VIDEO_1); 
      }
    };

    updateVideo(); 
    window.addEventListener("resize", updateVideo);
    return () => window.removeEventListener("resize", updateVideo);
  }, []);

  // Função para lidar com a atualização de senha do modal
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("A confirmação de senha não confere!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setUpdatingPassword(true);

    try {
      await authService.updatePassword({ username, currentPassword, newPassword });
      toast.success("Senha atualizada com sucesso! Faça login com a nova senha.");
      closeUpdatePasswordModal();
      setSenha(""); // Limpa a senha do login
      
    } catch (error: unknown) {
      let errorMessage = "Erro ao atualizar senha. Verifique se a senha atual está correta.";
      
      // Type guard para verificar se é um erro de axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string; errors?: { messages?: string[] } } } };
        
        if (axiosError.response?.status === 400) {
          errorMessage = "Dados inválidos. Verifique se a nova senha atende aos critérios.";
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.errors?.messages?.[0]) {
          errorMessage = axiosError.response.data.errors.messages[0];
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Função para fechar o modal de atualização de senha
  const closeUpdatePasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowUpdatePasswordModal(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await authService.authenticate({ username, password: senha });
      
      const token = response?.data?.accessToken;
      const trimmed = typeof token === "string" ? token.trim() : undefined;
      if (!trimmed) throw new Error("Token inválido");

      type JwtPayload = { groups?: string | string[] } & Record<string, unknown>;
      const payload = jwtDecode<JwtPayload>(trimmed);

      setCookie("accessToken", trimmed);

      const groupsRaw = payload?.groups;
      let groups: string[] = [];
      if (typeof groupsRaw === "string") groups = groupsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      else if (Array.isArray(groupsRaw)) groups = groupsRaw as string[];

      toast.success("Login realizado com sucesso!");
      
      if (groups.includes("Administrador")) router.push("/adm");
      else router.push("/dashboard");

    } catch (err: unknown) {
      // Extrai a mensagem de erro
      let errorMessage = "";
      
      // Type guard para verificar se é um erro de axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { 
            data?: { 
              errors?: { messages?: string[] }; 
              error_description?: string; 
            } 
          } 
        };
        
        if (axiosError.response?.data?.errors?.messages?.[0]) {
          errorMessage = axiosError.response.data.errors.messages[0];
        } else if (axiosError.response?.data?.error_description) {
          errorMessage = axiosError.response.data.error_description;
        }
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as Error).message;
      }
      
      // Verifica se a conta precisa de configuração
      const isAccountNotSetup = 
        errorMessage.includes("Account is not fully set up") ||
        errorMessage.includes("invalid_grant");
      
      if (isAccountNotSetup) {
        try {
          const userInfo = await authService.getUserByUsername(username);
          if (userInfo?.data?.requiredActions?.includes("UPDATE_PASSWORD")) {
            toast.info("Necessário atualizar a senha para continuar.");
            setShowUpdatePasswordModal(true);
          } else {
            toast.error("Conta não configurada completamente. Entre em contato com o suporte.");
          }
        } catch {
          // Se não conseguir buscar o usuário, assume que precisa atualizar senha
          toast.info("Necessário atualizar a senha para continuar.");
          setShowUpdatePasswordModal(true);
        }
      } else {
        toast.error("Usuário ou senha inválidos!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${BG_IMAGE})` }}
    >
      <ToastContainer theme="colored" />
      {/* Vídeo de fundo */}
      <video
        key={videoSrc} 
        className="absolute top-0 left-0 h-full w-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Logo + Formulário */}
      <section className="relative z-10 flex min-h-screen w-full items-center justify-center md:justify-end md:pr-10">
        <div className="w-full max-w-md rounded-xl px-6 py-10 md:px-8 bg-white/5 backdrop-blur-md">                  
          <div className="mb-10 flex justify-center">
            <img
              src={LOGO_IMAGE}
              alt="Logo Jotanunes"
              className="max-h-44 object-contain"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Usuário
              </label>
              <input 
                type="text"
                inputMode="text"
                placeholder="Digite o nome do usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300/50 bg-white/70 px-3 py-2.5 text-[15px] outline-none ring-2 ring-transparent transition focus:border-neutral-400 focus:ring-red-100 text-neutral-800 placeholder-neutral-500 shadow-md"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="w-full rounded-lg border border-neutral-300/50 bg-white/70 px-3 py-2.5 text-[15px] pr-10 outline-none ring-2 ring-transparent transition focus:border-neutral-400 focus:ring-red-100 text-neutral-800 placeholder-neutral-500 shadow-md"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm text-neutral-700 hover:text-neutral-900"
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <i className={`pi ${showPass ? 'pi-eye' : 'pi-eye-slash'}`} />
                </button>
              </div>
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-blue-700 hover:underline"
                  onClick={() => setShowSupport(true)}
                >
                  Problemas com o Login?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-red-700 px-4 py-2.5 text-base font-semibold text-white shadow-md transition hover:bg-red-600 active:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (<i className="pi pi-spin pi-spinner text-white" />) : null}
              Entrar
            </button>
          </form>
        </div>
      </section>

      {/* Modal de Suporte */}
      {showSupport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fundo translúcido para destacar o modal, mas permitindo ver o fundo */}
          <div className="absolute inset-0"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[320px] flex flex-col items-center border border-gray-200">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowSupport(false)}
              aria-label="Fechar"
            >                                           
              ×
            </button>
            <h2 className="text-lg font-bold mb-2 text-gray-800">Problemas com o Login?</h2>
            <p className="mb-4 text-sm text-gray-600 text-center">Entre em contato para resetar sua senha ou resolver problemas de login:</p>
            <div className="flex flex-col gap-2 w-full items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Telefone:</span>
                <a href="tel:+5511999999999" className="text-blue-700 hover:underline">(11) 99999-9999</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">E-mail:</span>
                <a href="mailto:suporte@jotanunes.com" className="text-blue-700 hover:underline">suporte@jotanunes.com</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atualização de Senha */}
      {showUpdatePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw] border border-gray-200">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={closeUpdatePasswordModal}
              aria-label="Fechar"
              disabled={updatingPassword}
            >                                             
              ×
            </button>
            <h2 className="text-xl font-bold text-center mb-2 text-gray-800">Atualizar Senha</h2>
            <p className="mb-4 text-sm text-gray-600">É necessário atualizar sua senha para continuar.</p>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Senha Atual */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm pr-10 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    disabled={updatingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm text-gray-600 hover:text-gray-800"
                    aria-label={showCurrentPass ? 'Ocultar senha' : 'Mostrar senha'}
                    disabled={updatingPassword}
                  >
                    <i className={`pi ${showCurrentPass ? 'pi-eye' : 'pi-eye-slash'}`} />
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Digite sua nova senha (mín. 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm pr-10 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    disabled={updatingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm text-gray-600 hover:text-gray-800"
                    aria-label={showNewPass ? 'Ocultar senha' : 'Mostrar senha'}
                    disabled={updatingPassword}
                  >
                    <i className={`pi ${showNewPass ? 'pi-eye' : 'pi-eye-slash'}`} />
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm pr-10 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    disabled={updatingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-2 my-auto rounded-md px-2 text-sm text-gray-600 hover:text-gray-800"
                    aria-label={showConfirmPass ? 'Ocultar senha' : 'Mostrar senha'}
                    disabled={updatingPassword}
                  >
                    <i className={`pi ${showConfirmPass ? 'pi-eye' : 'pi-eye-slash'}`} />
                  </button>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeUpdatePasswordModal}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  disabled={updatingPassword}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition flex items-center justify-center gap-2"
                  disabled={updatingPassword}
                >
                  {updatingPassword ? (
                    <>
                      <i className="pi pi-spin pi-spinner" />
                      Atualizando...
                    </>
                  ) : (
                    "Atualizar Senha"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
