import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import {
  EmpreendimentosTopicos,
  itemService,
  subTopicosAmbienteService,
  topicoService,
  DocumentoService, // ← para fazer o PUT futuramente
} from "@/lib/api";

interface TableItensProps {
  empreendimentoTopicos: EmpreendimentosTopicos[] | [];
  topicoSelecionado: string;
  ambienteSelecionado: string;
  itensDocumento: number[];
  onRemoveItem: (id: number) => void;
}

interface TabelaItem {
  id: number;
  item: string;
  descricao: string;
}

export default function TabelaItens({
  empreendimentoTopicos,
  topicoSelecionado,
  ambienteSelecionado,
  itensDocumento,
  onRemoveItem,
}: TableItensProps) {
  const [itens, setItens] = useState<TabelaItem[]>([]);

  /**
   * 🔹 Carrega itens de acordo com os IDs do documento.
   * Executa rapidamente e só chama a API se necessário.
   */
  const fetchItens = useCallback(async () => {
    if (!itensDocumento.length) {
      setItens([]);
      return;
    }

    try {
      // Carrega todos os itens por ID em paralelo
      const dados = await Promise.all(
        itensDocumento.map((id) => itemService.getItemById(id))
      );

      const tabelaFormatada = dados.map((i) => ({
        id: i.id!,
        item: i.nome,
        descricao: i.descricao,
      }));

      setItens(tabelaFormatada);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
    }
  }, [itensDocumento]);

  /**
   * 🔁 Atualiza itens sempre que o documento mudar.
   */
  useEffect(() => {
    fetchItens();
  }, [fetchItens]);

  /**
   * 🔸 Remoção otimista — remove imediatamente do front.
   */
  const removeItem = async (itemId: number) => {
    // Atualiza o estado local instantaneamente (melhor UX)
    setItens((prev) => prev.filter((item) => item.id !== itemId));

    // Atualiza o estado global (lista de itens do documento)
    onRemoveItem(itemId);

    // TODO: 🚀 Aqui é onde faremos o PUT de atualização do documento
    // try {
    //   const updatedDoc = { ...documentoAtual, empreendimentoTopicos: novosTopicos };
    //   await DocumentoService.updateEmpreendimento(updatedDoc);
    //   console.log("Documento atualizado com sucesso!");
    // } catch (error) {
    //   console.error("Erro ao atualizar o documento:", error);
    //   // Opcional: reverter a alteração local se falhar
    // }

    console.log(`Item ${itemId} removido do documento (remoção otimista).`);
  };

  /**
   * 🔹 Template da ação de remoção
   */
  const actionBodyTemplate = (rowData: TabelaItem) => (
    <Button
      icon="pi pi-times"
      rounded
      text
      severity="danger"
      tooltip="Remover item"
      onClick={() => removeItem(rowData.id)}
    />
  );

  return (
    <div className="card mt-10">
      <div className="w-full overflow-x-auto">
        <DataTable value={itens}>
          <Column
            field="item"
            header="Itens"
            style={{
              width: "30%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
          <Column
            field="descricao"
            header="Descrição"
            style={{
              width: "50%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
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
