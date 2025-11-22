import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import "primeicons/primeicons.css"; // Garante que o ícone 'pi-times' funcione
import {
  CreateDocumentoPayload,
  itemService,
  subTopicosAmbienteService,
  topicoService,
} from "@/lib/api1";

interface TableItensProps {
  documento: CreateDocumentoPayload;
  setDocumento: React.Dispatch<React.SetStateAction<CreateDocumentoPayload>>;
  topicoSelecionado: string;
  ambienteSelecionado: string;
}

// 1. Definição da Interface Mockada
interface TabelaItem {
  id: number;
  item: string;
  descricao: string;
}

export default function TabelaItensInitial({
  documento,
  setDocumento,
  topicoSelecionado,
  ambienteSelecionado,
}: TableItensProps) {
  const [itens, setItens] = useState<TabelaItem[]>([]);

  // Lógica para conseguir alinhar o tópico e ambientes
  useEffect(() => {
    let idTopic: number | undefined;
    let idAmbiente: number | undefined;

    const alignInformations = async () => {
      try {
        const allTopics = topicoService.getAllTopic();
        const allAmbiente = subTopicosAmbienteService.getAllAmbiente();

        // Alinhando as informações
        idTopic = (await allTopics).find(
          (t) => t.nome == topicoSelecionado
        )?.id;

        idAmbiente = (await allAmbiente).find(
          (a) => a.nome === ambienteSelecionado && a.topico.id === idTopic
        )?.id;

        if (typeof idAmbiente === "number" && typeof idTopic === "number") {
          const idsInDocumento = getItemsDocument(idTopic, idAmbiente);
          const itensInformations = await mappingItensInTable(idsInDocumento);
          if (itensInformations) setItens(itensInformations);
        }
      } catch (error) {
        console.error("Erro ao pegar as informações para alinhamento", error);
      }
    };

    const getItemsDocument = (idTopic: number, idAmbiente: number) => {
      const topico = documento.empreendimentoTopicos.find(
        (t: any) => t.topicoId === idTopic
      );

      if (!topico) return [];

      const ambiente = topico.topicoAmbientes.find(
        (a: any) => a.ambienteId === idAmbiente
      );

      if (!ambiente) return [];

      return ambiente.ambienteItens.map((i: any) => i.itemId);
    };

    const mappingItensInTable = async (idsItens: number[] | void) => {
      if (!idsItens || idsItens.length == 0) return;

      try {
        const items = await Promise.all(
          idsItens.map((id) => itemService.getItemById(id))
        );

        const tabelaItems: TabelaItem[] = items.map((item) => ({
          id: item.id!,
          item: item.nome,
          descricao: item.descricao,
        }));

        return tabelaItems;
      } catch (error) {
        console.error("Erro ao buscar os itens por id", error);
      }
    };

    alignInformations();
  }, [topicoSelecionado, ambienteSelecionado]);

  // Função para remover um item
  const removeItem = (itemId: number) => {
    setItens((prev) => prev.filter((item) => item.id !== itemId));

    setDocumento((prev) => {
      const updatedTopicos = prev.empreendimentoTopicos.map((topico: any) => {
        const updatedAmbientes = topico.topicoAmbientes.map((amb: any) => ({
          ...amb,
          ambienteItens: amb.ambienteItens.filter(
            (it: any) => it.itemId !== itemId
          ),
        }));
        return { ...topico, topicoAmbientes: updatedAmbientes };
      });

      return { ...prev, empreendimentoTopicos: updatedTopicos };
    });

    console.log(`Item com ID ${itemId} removido do documento.`);
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
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
          {/* Coluna 2: Descrição */}
          <Column
            field="descricao"
            header="Descrição"
            style={{
              width: "50px",
              whiteSpace: "nowrap",
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
