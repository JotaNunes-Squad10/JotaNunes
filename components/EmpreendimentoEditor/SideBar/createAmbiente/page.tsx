import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

export default function CriarNovoAmbiente() {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className="card flex justify-content-center">
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="
          flex items-center justify-center 
          w-full py-4 px-2 
          text-blue-600 font-semibold 
          bg-white transition duration-150
          border-2 border-dotted border-blue-500 
          rounded-xl 
          hover:bg-blue-50/70
          cursor-pointer
        "
      >
        {/* Ícone do PrimeIcons */}
        <i className="pi pi-plus mr-3 text-lg" />
        Criar Novo
      </button>
      <Dialog
        header="Criar novo ambiente"
        visible={visible}
        modal={false}
        style={{ width: "50vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.alert("Enviado...");
            }}
          >
            <div className="flex flex-col">
              <label className="mb-4">Digite o nome do ambiente</label>
              <input
                type="text"
                placeholder="Nome do ambiente"
                className="p-2 border border-gray-300 rounded-lg mb-4"
                required
              />
              <button
                type="submit"
                className="cursor-pointer bg-[#0f582a] p-3 text-white rounded-lg hover:opacity-95"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
