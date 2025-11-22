import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import React, { useState } from "react";

export default function ObservationDocument() {
  const [observation, setObservation] = useState("");
  const MAX_LENGTH = 300;

  const [loading, setLoading] = useState(false);

  const toast = React.useRef<Toast>(null);

  // Função que atualiza o estado
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Opcional: Adicionar lógica de trimming ou validação extra aqui
    setObservation(event.target.value);
  };

  return (
    <div className="mt-10">
      <Toast ref={toast} position="top-left" />
      <form
        className="flex flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            toast.current?.show({
              severity: "success",
              summary: "Sucesso",
              detail: "Observação salva com sucesso!",
              life: 3000,
            });
          }, 2000);
        }}
      >
        <label htmlFor="observation" className="font-bold mb-3">
          Observação:
        </label>
        <textarea
          name="obervation"
          id="observation"
          placeholder="Digite observações sobre o documento"
          value={observation} // Vincula o valor ao estado
          onChange={handleChange} // Atualiza o estado
          maxLength={MAX_LENGTH} // CHAVE: Limita a entrada
          className="
            resize-none p-3 border border-gray-300 h-30
            focus:outline-none 
            focus:border-blue-500
            transition-colors
          "
        ></textarea>
        {/* Opcional: Contador de caracteres para o usuário */}
        <div className="text-right text-sm text-gray-500 mt-1">
          {observation.length} / {MAX_LENGTH} caracteres
        </div>

        <div className="relative mt-14">
          {/* <button
            type="submit"
            className="p-2 bg-blue-700 rounded-xs text-white cursor-pointer mt-4 w-24 hover:bg-blue-800 absolute right-0 bottom-0"
          >
            Salvar
          </button> */}

          <Button
            label="Salvar"
            style={{
              backgroundColor: "#3566D1",
              border: "none",
              borderRadius: "4px",
              color: "white",
              position: "absolute",
              right: "0px",
              bottom: "0",
            }}
            loading={loading}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
