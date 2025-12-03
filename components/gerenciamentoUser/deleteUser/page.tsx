"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";

type UserForDelete = { id?: string | number; username?: string; firstName?: string; lastName?: string };

type Props = { visible: boolean; selectedUsers: UserForDelete[]; eventName?: string };

export default function DeleteUserModal({ visible, selectedUsers, eventName }: Props) {
  const [loading, setLoading] = useState(false);
  const header = `Confirmar exclusão (${selectedUsers?.length || 0})`;

  type DeleteEventDetail = { action: string; ids?: (string | number)[] };
  const dispatchEvent = (detail: DeleteEventDetail) => {
    const name = eventName || "gerenciamentoUser:delete";
    // dispatchCustomEvent pode falhar em ambientes restritos, então protegemos com try/catch
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch {
      // silencioso: consumidor do componente é responsável por lidar com falhas
    }
  };

  useEffect(() => {
    const onFinished = (e: Event) => {
      const ce = e as CustomEvent<unknown>;
      if ((ce as CustomEvent<{ [key: string]: unknown }>)?.detail) setLoading(false);
    };
    window.addEventListener("gerenciamentoUser:delete:finished", onFinished as EventListener);
    return () => window.removeEventListener("gerenciamentoUser:delete:finished", onFinished as EventListener);
  }, []);

  const handleConfirm = () => {
    const ids = (selectedUsers || []).map((u) => u.id).filter(Boolean) as (string | number)[];
    if (!ids.length) {
      try {
        window.dispatchEvent(
          new CustomEvent("gerenciamentoUser:notify", {
            detail: { severity: "error", summary: "Erro", detail: "Nenhum usuário válido para deletar." },
          })
        );
      } catch {}
      return;
    }
    setLoading(true);
    dispatchEvent({ action: "confirm", ids });
  };

  return (
    <Dialog
      visible={visible}
      contentStyle={{ backgroundColor: "transparent", padding: 0 }}
      baseZIndex={10000}
      onHide={() => {
        if (!loading) dispatchEvent({ action: "close" });
      }}
      modal
      closable
      blockScroll
      maskStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-md shadow-lg p-4 md:p-6 max-w-full w-100 h-80 flex flex-col relative">
        <button
          aria-label="Fechar"
          onClick={() => {
            if (!loading) dispatchEvent({ action: "close" });
          }}
          disabled={loading}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-transparent p-1 rounded focus:outline-none"
        >
        </button>

        <div className="flex-0">
          <h3 className="text-center text-3xl font-semibold text-gray-900">{header}</h3>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
          <p className="text-xm text-gray-700">Tem certeza que deseja deletar os seguintes usuários?</p>
          <div className="mt-3 max-h-36 overflow-auto w-full">
            <ul className="list-disc pl-5 inline-block text-left">
              {(selectedUsers || []).map((u, idx) => (
                <li key={String(u.id ?? idx)} className="text-gray-800 truncate">
                  {u.firstName || u.username || `ID: ${u.id}`}{u.lastName ? ` ${u.lastName}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-0 mt-3 flex justify-center gap-3">
          <button
            onClick={() => dispatchEvent({ action: "close" })}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : null}
            Confirmar
          </button>
        </div>
      </div>
    </Dialog>
  );
}
