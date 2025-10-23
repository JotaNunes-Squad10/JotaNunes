import React, { useState } from "react";

export default function ObservationDocument() {
  const [observation, setObservation] = useState("");
  const MAX_LENGTH = 300;

  // Função que atualiza o estado
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Opcional: Adicionar lógica de trimming ou validação extra aqui
    setObservation(event.target.value);
  };

  return (
    <div className="mt-10">
      <form className="flex flex-col">
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
      </form>
    </div>
  );
}
