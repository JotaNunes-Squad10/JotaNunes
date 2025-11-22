import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { CreateTopicPayload, topicoService } from "@/lib/api1";

interface CriarNovoAmbienteProp {
  setNovoTopico: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CriarNovoAmbiente({
  setNovoTopico,
}: CriarNovoAmbienteProp) {
  const [visible, setVisible] = useState<boolean>(false);

  const [novoAmbiente, setNovoAmbiente] = useState<string>("");

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
          border-2 border-dashed border-blue-500 
          rounded-xl 
          hover:bg-blue-50/70
          cursor-pointer
        "
      >
        {/* Ícone do PrimeIcons */}
        <i className="pi pi-plus mr-3 text-lg" />
        Criar novo ambiente
      </button>
      <Dialog
        header="Criar novo ambiente"
        visible={visible}
        modal={false}
        style={{ width: "35vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              const novoTopicoCreate: CreateTopicPayload = {
                nome: novoAmbiente,
              };

              topicoService.createTopic(novoTopicoCreate).then((res) => {
                setNovoTopico((prev) => [...prev, novoAmbiente]);
              });
              setVisible(false);
            }}
          >
            <div className="flex flex-col">
              <label className="mb-4">Digite o nome do ambiente</label>
              <input
                type="text"
                placeholder="Nome do ambiente"
                className="p-2 border border-gray-300 rounded-lg mb-4"
                required
                onChange={(e) => setNovoAmbiente(e.target.value)}
              />
              <button
                type="submit"
                className="cursor-pointer bg-green-700 p-3 text-white rounded-lg hover:opacity-95"
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
