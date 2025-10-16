import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import "primeicons/primeicons.css"; // Garante que o ícone 'pi-times' funcione

// 1. Definição da Interface Mockada
interface TabelaItem {
  id: number;
  item: string;
  descricao: string;
}

// 2. Dados Mockados (Simulando o resultado da combinação de Item e Descrição)
const mockItemsData: TabelaItem[] = [
  { id: 1, item: "Acabamento Externo", descricao: "Acabamento cromado" },
  {
    id: 2,
    item: "Acabamento Interno",
    descricao: "Acabamento em textura acrílica",
  },
  { id: 3, item: "Ar Condicionado", descricao: "Alumínio pintado de branco" },
  {
    id: 4,
    item: "Bancada",
    descricao: "Alumínio pintado de branco com vidro liso",
  },
  {
    id: 5,
    item: "Borda",
    descricao: "Bloco cerâmico rebocado com chapisco rústico ou bloco aparente",
  },
];

export default function TabelaItens() {
  const [itens, setItens] = useState<TabelaItem[]>(mockItemsData);

  // Função para remover um item
  const removeItem = (itemId: number) => {
    setItens(itens.filter((item) => item.id !== itemId));
    console.log(`Item com ID ${itemId} removido.`);
    // Aqui você adicionaria a lógica real de remoção da sua aplicação/API.
  };

  // 3. Template da Coluna de Ação (Remoção)
  const actionBodyTemplate = (rowData: TabelaItem) => {
    return (
      <Button
        icon="pi pi-times" // Ícone de 'X' (pi-times)
        rounded
        text // Remove o fundo e bordas, deixando apenas o ícone
        severity="danger" // Cor vermelha para indicar remoção
        tooltip="Remover item"
        onClick={() => removeItem(rowData.id)}
      />
    );
  };

  return (
    <div className="card mt-10">
      <div className="w-full overflow-x-auto">
        <DataTable value={itens}>
          {/* Coluna 1: Itens */}
          <Column
            field="item"
            header="Itens"
            style={{
              width: "30%",
              // whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
          {/* Coluna 2: Descrição */}
          <Column
            field="descricao"
            header="Descrição"
            style={{
              maxWidth: "50px",
              // whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
          {/* Coluna 3: Ação (Remoção) */}
          <Column
            header="Remover"
            body={actionBodyTemplate}
            style={{ width: "15%", textAlign: "center" }}
          />
        </DataTable>
      </div>
    </div>
  );
}
