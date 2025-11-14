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
  MarcaMateriais,
  marcaService,
} from "@/lib/api";

interface Props {
  empreendimento: UpdateEmpreendimento;
  topicoSelecionado: string;
  ambienteSelecionado: string;
  onRemoveItem: (itemId: number, topicoId: number, ambienteId: number) => void;
  onRemoveMaterial: (materialId: number, topicoId: number) => void;
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
  onRemoveMaterial,
}: Props) {
  const [itens, setItens] = useState<TabelaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const isMarcas = topicoSelecionado.toUpperCase() === "MARCAS";
  const TOPICO_MARCAS = 3;

  useEffect(() => {
    const load = async () => {
      if (!topicoSelecionado) return;

      setLoading(true);
      setItens([]);

      // ========================================
      // 🔹 CASO ESPECIAL: MARCAS
      // ========================================
      if (isMarcas) {
        try {
          const listaMarcas: MarcaMateriais[] =
            await marcaService.getAllMarcaMateriais();

          const topico = empreendimento.empreendimentoTopicos.find(
            (t) => t.topicoId === TOPICO_MARCAS
          );

          const materiaisNoDocumento = topico?.topicoMateriais ?? [];

          // filtramos somente os materiais presentes no documento
          const itensTabela = materiaisNoDocumento
            .map((m) => {
              const encontrado = listaMarcas.find(
                (x) => x.material.id === m.materialId
              );
              if (!encontrado) return null;

              return {
                id: encontrado.material.id,
                item: encontrado.marca.nome,
                descricao: encontrado.material.nome,
              };
            })
            .filter(Boolean) as TabelaItem[];

          setItens(itensTabela);
        } catch (e) {
          console.error("Erro ao carregar marcas:", e);
        }

        setLoading(false);
        return;
      }

      // ========================================
      // 🔹 CASO NORMAL: AMBIENTES
      // ========================================
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
          ids.map((id: number) => itemService.getItemById(id))
        );

        setItens(
          itensDetalhes.map((i) => ({
            id: i.id!,
            item: i.nome,
            descricao: i.descricao,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [empreendimento, topicoSelecionado, ambienteSelecionado]);

  // ========================================
  // 🔹 REMOVER ITEM OU MATERIAL
  // ========================================
  const handleRemove = async (id: number) => {
    if (isMarcas) {
      onRemoveMaterial(id, TOPICO_MARCAS);
      setItens((prev) => prev.filter((i) => i.id !== id));
      return;
    }

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
  };

  return (
    <div className="card mt-8">
      <DataTable
        value={itens}
        loading={loading}
        loadingIcon="pi pi-spin pi-spinner"
        emptyMessage={loading ? "Carregando..." : "Nenhum item neste local."}
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
