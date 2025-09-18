"use client";

import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

export default function FormEmpreendimento() {
  const [empreendimento, setEmpreendimento] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [descricao, setDescricao] = useState("");

  return (
    <Card className="shadow-md p-6 w-full ">
      {/* Campo Empreendimento */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-6">
        <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
          Empreendimento:
        </label>
        <InputText
          value={empreendimento}
          onChange={(e) => setEmpreendimento(e.target.value)}
          placeholder="Digite o nome do empreendimento"
          className="flex-1"
        />
      </div>

      {/* Campo Localização */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-6">
        <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
          Localização:
        </label>
        <InputText
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
          placeholder="Digite a localização"
          className="flex-1"
        />
      </div>

      {/* Campo Descrição */}
      <div>
        <label className="block font-semibold mb-2 text-gray-700">
          Descrição do Empreendimento:
        </label>
        <InputTextarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Digite a descrição"
          rows={6}
          autoResize
          className="w-full"
        />
      </div>
    </Card>
  );
}
