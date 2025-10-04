import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";

interface BasicDocProps {
  visible: boolean;
  onHide: () => void;
}

export default function BasicDoc({ visible, onHide }: BasicDocProps) {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const toast = useRef<Toast>(null);
  const itemNameref = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!itemName.trim() || !description.trim()) {
      setError("Nome do item e descrição são obrigatórios.");
      return;
    }

    // Se chegou aqui, está válido
    console.log("Item salvo:", { itemName, description });

    toast.current?.show({
      severity: "success",
      summary: "Sucesso",
      detail: "Item e descrição salvos com sucesso",
      life: 3000,
    });

    // Limpar estado
    setItemName("");
    setDescription("");
    setError("");
    onHide();
  };

  const handleClose = () => {
    // limpa tudo ao fechar
    setItemName("");
    setDescription("");
    setError("");
    onHide();
  };

  const footer = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" onClick={handleClose} className="p-button-text" />
      <Button label="Salvar" icon="pi pi-check" onClick={handleSave} />
    </div>
  );

  const handleEnterKey = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSave();
  }
};

  return (
    <>
    <Toast ref={toast} position="top-right" />

    <Dialog
      header="Adicionar novo Item"
      visible={visible}
      style={{ width: "40vw" }}
      onHide={handleClose}
      footer={footer}
      onShow={() => {
        itemNameref.current?.focus();
      }}
    >
      <div className="p-fluid">
        <div className="field">
          <label htmlFor="itemName">Nome do Item</label>
          <InputText
            id="itemName"
            ref={itemNameref}
            value={itemName}
            className="custom-input"
            onChange={(e) => {
              setItemName(e.target.value);
              if (error) setError(""); // remove erro ao digitar
            }}
            onKeyDown={handleEnterKey}
          />
        </div>

        {error && (
          <div className="mb-3">
            <Message severity="error" text={error} />
          </div>
        )}

        <div className="field">
          <label htmlFor="description">Descrição</label>
          <InputTextarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleEnterKey}
          />
        </div>
      </div>
    </Dialog>
    </>
  );
}

