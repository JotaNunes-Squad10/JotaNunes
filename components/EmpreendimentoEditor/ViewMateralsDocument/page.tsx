"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import {
  itemService,
  subTopicosAmbienteService,
  topicoService,
  UpdateEmpreendimento,
} from "@/lib/api";

interface Props {
  empreendimento: UpdateEmpreendimento;
  topicoSelecionado: string;
  ambienteSelecionado: string;
  onRemoveItem: (itemId: number, topicoId: number, ambienteId: number) => void;
}

interface TabelaItem {
  id: number;
  item: string;
  descricao: string;
}

export default function TabelaItens({
  empreendimento,
  topicoSelecionado,
  ambienteSelecionado,
  onRemoveItem,
}: Props) {
  const [itens, setItens] = useState<TabelaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!topicoSelecionado || !ambienteSelecionado) return;
      setLoading(true); // inicia o loading
      setItens([]);

      try {
        const [topics, ambientes] = await Promise.all([
          topicoService.getAllTopic(),
          subTopicosAmbienteService.getAllAmbiente(),
        ]);

        const topicoId = topics.find((t) => t.nome === topicoSelecionado)?.id;
        const ambienteId = ambientes.find(
          (a) => a.nome === ambienteSelecionado && a.topico.id === topicoId
        )?.id;

        if (!topicoId || !ambienteId) {
          setItens([]);
          return;
        }

        const topico = empreendimento.empreendimentoTopicos.find(
          (t) => t.topicoId === topicoId
        );
        const ambiente = topico?.topicoAmbientes.find(
          (a: any) => a.ambienteId === ambienteId
        );
        const ids = ambiente?.ambienteItens.map((i: any) => i.itemId) ?? [];

        if (ids.length === 0) {
          setItens([]);
          return;
        }

        const itensDetalhes = await Promise.all(
          ids.map((id: any) => itemService.getItemById(id))
        );

        setItens(
          itensDetalhes.map((i) => ({
            id: i.id!,
            item: i.nome,
            descricao: i.descricao,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar itens da tabela:", error);
      } finally {
        setLoading(false); // encerra o loading
      }
    };

    load();
  }, [empreendimento, topicoSelecionado, ambienteSelecionado]);

  const handleRemove = async (id: number) => {
    const [topics, ambientes] = await Promise.all([
      topicoService.getAllTopic(),
      subTopicosAmbienteService.getAllAmbiente(),
    ]);

    const topicoId = topics.find((t) => t.nome === topicoSelecionado)?.id;
    const ambienteId = ambientes.find(
      (a) => a.nome === ambienteSelecionado && a.topico.id === topicoId
    )?.id;

    if (!topicoId || !ambienteId) return;

    onRemoveItem(id, topicoId, ambienteId);
    setItens((prev) => prev.filter((i) => i.id !== id));

    // TODO: 🚀 PUT para salvar a remoção
  };

  return (
    <div className="card mt-8">
      <DataTable
        value={itens}
        loading={loading}
        loadingIcon="pi pi-spin pi-spinner"
        emptyMessage={
          loading ? "Carregando itens..." : "Nenhum item neste ambiente."
        }
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="item" header="Item" style={{ width: "40%" }} />
        <Column field="descricao" header="Descrição" style={{ width: "50%" }} />
        <Column
          header="Remover"
          style={{ width: "10%", textAlign: "center" }}
          body={(rowData) => (
            <Button
              icon="pi pi-times"
              rounded
              text
              severity="danger"
              onClick={() => handleRemove(rowData.id)}
              disabled={loading}
            />
          )}
        />
      </DataTable>
    </div>
  );
}
