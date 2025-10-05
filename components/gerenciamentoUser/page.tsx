"use client";
import React, { useState, useEffect, useRef } from "react";
import Header from "./headerUser/page";
import CreateUserModal from "./createUser/page";
import EditUserModal from "./editUser/page";
import DeleteUserModal from './deleteUser/page';
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { userService, type User } from "../../lib/services";

// Dispatch seguro de events - evita throws silenciosos
const safeDispatch = (name: string, detail?: unknown) => {
  try {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  } catch (e) {
    console.warn('dispatchEvent failed', e);
  }
};

const notify = (severity: 'success'|'error'|'info'|'warn', summary?: string, detail?: string) => {
  safeDispatch('gerenciamentoUser:notify', { severity, summary, detail });
};

const logoutAndRedirect = (delayMs = 0) => {
  if (typeof window !== 'undefined') {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (delayMs > 0) setTimeout(() => { window.location.href = '/login'; }, delayMs);
    else window.location.href = '/login';
  }
};

export default function GerenciamentoUser() {
  type LocalToast = { id: string; severity: 'success'|'error'|'info'|'warn'; summary?: string; detail?: string };
  const [localToasts, setLocalToasts] = useState<LocalToast[]>([]);
  const lastRef = useRef({ key: '', ts: 0 } as { key: string; ts: number });

  useEffect(() => {
    const onNotify = (e: Event) => {
      const ce = e as CustomEvent<LocalToast>;
      if (!ce?.detail) return;
      const key = `${ce.detail.severity || 'info'}|${ce.detail.summary || ''}|${ce.detail.detail || ''}`;
      const now = Date.now();
      if (key === lastRef.current.key && now - lastRef.current.ts < 2000) return;
      lastRef.current.key = key;
      lastRef.current.ts = now;
      const t = { id: (Math.random() + 1).toString(36).slice(2), severity: ce.detail.severity || 'info', summary: ce.detail.summary, detail: ce.detail.detail } as LocalToast;
      setLocalToasts((s) => [...s, t]);
      setTimeout(() => setLocalToasts((s) => s.filter(x => x.id !== t.id)), 3500);
    };
    window.addEventListener('gerenciamentoUser:notify', onNotify as EventListener);
    return () => window.removeEventListener('gerenciamentoUser:notify', onNotify as EventListener);
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [visible, setVisible] = useState(false);
  const [rotated, setRotated] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<(string | number)[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [removingIds, setRemovingIds] = useState<(string|number)[]>([]);
  const ROW_ANIM_MS = 350;
  const [deleting, setDeleting] = useState(false);
  // Buscar usuários na API
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let didTimeout = false;
    async function fetchUsers() {
      setLoadingUsers(true);
      timeoutId = setTimeout(() => {
        didTimeout = true;
        setLoadingUsers(false);
        setUsers([]);
      }, 10000);
      try {
        const users = await userService.getAllUsers();
        if (didTimeout) return;
        clearTimeout(timeoutId);
        setUsers(users);
      } catch (error: unknown) {
        console.error('[GerenciamentoUser] Erro na requisição GetAllUsers:', error);
        
        // Verificar se é erro de autorização
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            try {
              // Limpar cookie de auth e redirecionar para login
              if (typeof window !== 'undefined') {
                document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                notify('info', 'Sessão', 'Sessão expirada. Redirecionando para login...');
                setTimeout(() => { logoutAndRedirect(); }, 900);
              }
            } catch {
              // falha ao tentar limpar cookie/redirect
            }
            return;
          }
        }
        
        if (!didTimeout) {
          setUsers([]);
        }
      } finally {
        if (!didTimeout) {
          setLoadingUsers(false);
        }
      }
    }
    fetchUsers();
    return () => clearTimeout(timeoutId);
  }, [showCreateModal]);

  useEffect(() => {
    const handler = async (e: Event) => {
      const ce = e as CustomEvent<{ action: string; ids?: (string|number)[] }>;
      if (!ce?.detail) return;
      const { action, ids } = ce.detail;
      if (action === 'close') {
        setShowDeleteModal(false);
        return;
      }
      if (action === 'confirm' && ids && ids.length > 0) {
        const results: { id: string|number; ok: boolean; status?: number; error?: string }[] = [];
        if (deleting) return; 
        setDeleting(true);
        for (const id of ids) {
          try {
            await userService.deleteUser(String(id));
            results.push({ id, ok: true });
          } catch (error: unknown) {
            let message = 'Erro desconhecido';
            let status: number | undefined = undefined;
            
            if (error && typeof error === 'object' && 'response' in error) {
              const axiosError = error as { response?: { status?: number; data?: unknown } };
              status = axiosError.response?.status;
              message = `HTTP ${status}`;
            } else if (error instanceof Error) {
              message = error.message;
            }
            
            results.push({ id, ok: false, status, error: message });
          }
        }

        const failed = results.filter(r => !r.ok);
        if (failed.length === 0) {
          setRemovingIds(prev => [...prev, ...ids]);
          setTimeout(() => {
            setUsers(prev => prev.filter(u => !ids.includes(u.id ?? -1)));
            setSelectedUsers([]);
            setRemovingIds(prev => prev.filter(i => !ids.includes(i)));
          }, ROW_ANIM_MS);
          notify('success', 'Sucesso', 'Usuário(s) deletado(s) com sucesso!');
        } else {
          notify('error', 'Erro', `Falha ao deletar ${failed.length} usuário(s).`);
          console.error('[GerenciamentoUser] Erros ao deletar:', failed);
        }
        setShowDeleteModal(false);
        setDeleting(false);
  safeDispatch('gerenciamentoUser:delete:finished', { results });
      }
    };
    window.addEventListener('gerenciamentoUser:delete', handler as EventListener);
    return () => window.removeEventListener('gerenciamentoUser:delete', handler as EventListener);
  }, [users, selectedUsers, deleting]);

  // (listener removido) não havia conteúdo aqui

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
    if (typeof window !== "undefined") {
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
      {/* Toasters locais (inline) */}
      <div className="fixed top-4 right-4 z-[11000] flex flex-col gap-2">
        {localToasts.map(t => (
          <div key={t.id} className={`w-80 max-w-full p-3 rounded-lg shadow-md border ${t.severity === 'success' ? 'bg-green-50 border-green-200' : t.severity === 'error' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {t.summary && <div className="font-semibold text-sm text-gray-800">{t.summary}</div>}
                {t.detail && <div className="text-sm text-gray-700 mt-1">{t.detail}</div>}
              </div>
              <button onClick={() => setLocalToasts(prev => prev.filter(x => x.id !== t.id))} className="text-gray-500 hover:text-gray-700 ml-2">×</button>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex flex-col md:flex-row w-full">
        {/* Sidebar */}
        <Sidebar
          visible={visible}
          onHide={handleHide}
          style={{ width: 'clamp(220px, 25vw, 360px)' }}
          className="bg-gray-600 mt-24 md:mt-32  z-20"
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
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-row gap-2 w-full md:w-auto justify-start items-center">
              <Button
                icon={<i className="pi pi-user-plus pr-2" />}
                label="Novo Usuário"
                className="bg-gray-300 text-black rounded-3xl px-6 py-2 text-sm md:text-xl font-normal hover:bg-gray-400 transition-all duration-200"
                onClick={() => setShowCreateModal(true)}
              />
              {selectedUsers.length > 0 && (
                <Button
                  icon={<i className="pi pi-trash pr-2" />}
                  label={deleting ? 'Deletando...' : 'Deletar'}
                  className="bg-red-400 text-black rounded-3xl px-6 py-2 text-sm md:text-xl font-normal hover:bg-red-500 transition-all duration-200"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={deleting}
                />
              )}
            </div>
          </div>

          {/* Tabela dinâmica de usuários */}
          <div className="w-full px-0 md:px-0 md:max-w-6xl md:mx-auto">
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white rounded-lg shadow text-xs md:text-base">
                <thead>
                    <tr className="bg-gray-700 text-white text-left">
                    <th className="px-2 sm:px-4 py-1 sm:py-2 font-semibold"></th>
                    <th className="px-2 sm:px-6 py-1 sm:py-2 font-semibold">Usuário</th>
                    <th className="px-2 sm:px-6 py-1 sm:py-2 font-semibold">E-mail</th>
                    <th className="px-2 sm:px-6 py-1 sm:py-2 font-semibold">Nome</th>
                    <th className="px-2 sm:px-6 py-1 sm:py-2 font-semibold">Telefone</th>
                    <th className="px-2 sm:px-6 py-1 sm:py-2 font-semibold">Perfil</th>
                    <th className="px-2 sm:px-6 py-1 sm:py-2 font-semibold">Editar</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    // Skeleton loading: mostra linhas de placeholder
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={`skeleton-${i}`} className={`bg-white`}>
                        <td className="px-2 sm:px-3 py-3"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></td>
                        <td className="px-2 sm:px-6 py-3"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" /></td>
                        <td className="px-2 sm:px-6 py-3"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" /></td>
                        <td className="px-2 sm:px-6 py-3"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" /></td>
                        <td className="px-2 sm:px-6 py-3"><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" /></td>
                        <td className="px-2 sm:px-6 py-3"><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" /></td>
                        <td className="px-2 sm:px-6 py-3"><div className="h-4 bg-gray-200 rounded w-12 animate-pulse" /></td>
                      </tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-4">Nenhum usuário encontrado.</td></tr>
                  ) : (
                    users
                      .filter(user => {
                        const term = searchTerm.toLowerCase();
                        return (
                          user.username.toLowerCase().includes(term) ||
                          user.firstName.toLowerCase().includes(term) ||
                          user.lastName.toLowerCase().includes(term) ||
                          (user.email && user.email.toLowerCase().includes(term))
                        );
                      })
                      .map((user, idx) => (
                      <tr
                        key={user.id || idx}
                        className={`transition-all duration-300 ease-in-out ${idx % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} hover:bg-gray-300 ${removingIds.includes(user.id ?? idx) ? 'opacity-0 -translate-y-2' : 'opacity-100'}`}
                        style={{ transformOrigin: 'top' }}
                      >
                        <td className="px-2 sm:px-3 py-1 sm:py-2">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600"
                            checked={selectedUsers.includes(user.id ?? idx)}
                            disabled={deleting}
                            onChange={(e) => {
                              const id = user.id ?? idx;
                              if (e.target.checked) {
                                setSelectedUsers((prev) => [...prev, id]);
                              } else {
                                setSelectedUsers((prev) => prev.filter((uid) => uid !== id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-2 sm:px-6 py-1 sm:py-2 text-gray-600">{user.username}</td>
                        <td className="px-2 sm:px-6 py-1 sm:py-2 text-gray-600">{user.email}</td>
                        <td className="px-2 sm:px-6 py-1 sm:py-2 text-gray-600">
                          <div className="truncate max-w-[140px] sm:max-w-[250px]" title={`${user.firstName} ${user.lastName}`}>
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-1 sm:py-2 text-gray-600">{user.phone ? user.phone : "Não informado"}</td>
                        <td className="px-2 sm:px-6 py-1 sm:py-2 text-gray-600">
                          <div className="truncate max-w-[90px] sm:max-w-[160px]">
                            {(() => {
                              const profileId = user.profiles && user.profiles.length > 0 
                                ? user.profiles[0].id 
                                : user.profile;
                              const profileName = user.profiles && user.profiles.length > 0 
                                ? user.profiles[0].name 
                                : (profileId === 1 ? "Administrador" : profileId === 2 ? "Gestor" : profileId === 3 ? "Operador" : "Sem perfil");
                              
                              return profileName;
                            })()}
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-1 sm:py-2">
                          <button
                            className="p-2 rounded hover:bg-gray-300 active:scale-90 transition-transform duration-150"
                            style={{ outline: 'none' }}
                            onClick={() => {
                              const userForEdit = {
                                ...user,
                                profile: user.profiles && user.profiles.length > 0 ? user.profiles[0].id : user.profile
                              };
                              setUserToEdit(userForEdit);
                              setShowEditModal(true);
                            }}
                          >
                            <i
                              className="pi pi-pen-to-square text-gray-800 hover:text-blue-500 text-lg sm:text-xl transition-transform duration-300 hover:scale-110"
                              style={{ cursor: 'pointer' }}
                            />
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
      {showEditModal && userToEdit && (
        <EditUserModal
          user={userToEdit}
          visible={showEditModal}
          actions={{
            onClose: () => setShowEditModal(false),
            onSave: async (updatedUser: User) => {

              try {
                if (!updatedUser?.id) {
                  throw new Error('ID do usuário ausente ao tentar atualizar');
                }

                // Construir payload simples conforme esquema da API
                const updatePayload = {
                  id: updatedUser.id,
                  username: updatedUser.username,
                  firstName: updatedUser.firstName,
                  lastName: updatedUser.lastName,
                  email: updatedUser.email,
                  phone: updatedUser.phone,
                  profile: updatedUser.profile
                };
                // Validação básica
                if (!updatedUser.username || !updatedUser.firstName || !updatedUser.lastName || !updatedUser.email) {
                  throw new Error('Campos obrigatórios não preenchidos');
                }

                // Usar serviço centralizado para atualizar usuário
                await userService.updateUser(updatePayload);

                // usuário atualizado com sucesso
                setUsers((prev) => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
              } catch (err) {
                throw err;
              }
            },
            onResetPassword: async (userId: string | number | undefined) => {
              try {
                if (!userId) {
                  throw new Error('ID do usuário ausente ao tentar resetar senha');
                }
                // Usar serviço centralizado para resetar senha
                const result = await userService.resetPassword(String(userId));
                const tempPassword = result.newPassword;

                // Sucesso: notificar com a senha temporária (aviso: sensível)
                try {
                  window.dispatchEvent(new CustomEvent('gerenciamentoUser:notify', { detail: { severity: 'success', summary: 'Senha resetada', detail: `Senha temporária: ${tempPassword}` } }));
                } catch (e) { console.warn('dispatchEvent failed', e); }

                // Também retornar a senha para quem chamou a função
                return tempPassword;
              } catch (err) {
                if (err instanceof Error) {
                  throw err;
                } else {
                  throw new Error("Erro ao resetar senha");
                }
              }
            },
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteUserModal
          visible={showDeleteModal}
          selectedUsers={users.filter(u => selectedUsers.includes(u.id ?? -1)).map(u => ({ id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName }))}
        />
      )}
    </div>
  );
}
