import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Item, ItemsServie } from "@/lib/api";
import { Toast } from "primereact/toast";

interface Props {
  onReload: () => void;
}

export default function AdicionarNovoItem({ onReload }: Props) {
  const [visible, setVisible] = useState<boolean>(false);
  const [nomeItem, setNomeItem] = useState<string>("");
  const [descricaoItem, setDescricaoItem] = useState<string>("");
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Item criado com sucesso!",
      life: 3000,
    });
  };

  const handleCreateNewItem = async () => {
    try {
      const newItem: Item = {
        nome: nomeItem,
        descricao: descricaoItem,
      };

      console.log(newItem);
      const createdItem = await ItemsServie.createItem(newItem);

      console.log("Item criado com sucesso:", createdItem);

      onReload();
      showSuccess();
      setVisible(false);
    } catch (error) {
      console.error("Erro ao criar novo item:", error);
    }
  };

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />
      <button
        onClick={() => setVisible(true)}
        className="px-4 py-3 border border-gray-300 rounded-lg text-[#0f582a] cursor-pointer hover:bg-gray-100"
      >
        <i className="pi pi-plus"></i>
      </button>

      <Dialog
        header="Novo Item"
        visible={visible}
        modal={false}
        style={{ width: "50vw" }}
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
            }}
          >
            <div className="flex flex-col">
              <label className="mb-4">Digite o nome do item</label>
              <input
                type="text"
                placeholder="Nome do item"
                className="p-2 border border-gray-300 rounded-lg mb-4"
                required
                onChange={(e) => setNomeItem(e.target.value)}
              />
              <label className="mb-4">Digite a descrição do item</label>
              <input
                type="text"
                placeholder="Descrição do item"
                className="p-2 border border-gray-300 rounded-lg mb-4"
                required
                onChange={(e) => setDescricaoItem(e.target.value)}
              />
              <button
                type="submit"
                className="cursor-pointer bg-[#0f582a] p-3 text-white rounded-lg hover:opacity-95"
                onClick={handleCreateNewItem}
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
