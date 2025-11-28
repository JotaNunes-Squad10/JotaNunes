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
  EmprendimentoTopico,
  MarcaMaterial,
  GetAllMarcasByMaterialId,
  Item,
} from "@/lib/api";

import EditItemModal from "@/components/EditItemModal/page";
import EditMaterialModal from "@/components/EditMaterialModal/page";

//
// TYPES
//
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

interface AmbienteItemSafe {
  itemId: number;
  versoes?: number[];
}

interface TopicoAmbienteSafe {
  ambienteId: number;
  posicao: number;
  area?: number;
  ambienteItens: AmbienteItemSafe[];
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

  // REFRESH CONTROL
  const [refresh, setRefresh] = useState(false);

  // EDIT MODALS
  const [editItemData, setEditItemData] = useState<{
    id: number;
    nome: string;
    descricao: string;
  } | null>(null);

  const [editMaterialData, setEditMaterialData] = useState<{
    id: number;
    nome: string;
    marcaId: number;
  } | null>(null);

  const [showEditItem, setShowEditItem] = useState(false);
  const [showEditMaterial, setShowEditMaterial] = useState(false);

  const isMarcas = topicoSelecionado.toUpperCase() === "MARCAS";
  const TOPICO_MARCAS = 3;

  // ======================================================
  // LOADING TABLE ITEMS
  // ======================================================
  useEffect(() => {
    const load = async () => {
      if (!topicoSelecionado) return;
      setLoading(true);
      setItens([]);

      // ---------- CASO MARCAS ----------
      if (isMarcas) {
        try {
          const topicoMarcas = empreendimento.empreendimentoTopicos.find(
            (t: EmprendimentoTopico) => t.topicoId === TOPICO_MARCAS
          );

          const materiaisNoDoc = topicoMarcas?.topicoMateriais ?? [];
          const lista: TabelaItem[] = [];

          for (const m of materiaisNoDoc) {
            const detalhe: GetAllMarcasByMaterialId =
              await MarcaMaterial.getAllMarcasByMaterialId(m.materialId);

            lista.push({
              id: detalhe.materialId,
              item: detalhe.material,
              descricao: detalhe.marcas.join(", "),
            });
          }

          setItens(lista);
        } catch (error) {
          console.error("Erro ao carregar materiais:", error);
        }

        setLoading(false);
        return;
      }

      // ---------- CASO AMBIENTES ----------
      try {
        const [topics, ambientes] = await Promise.all([
          topicoService.getAllTopic(),
          subTopicosAmbienteService.getAllAmbiente(),
        ]);

        const topicoId =
          topics.find((t) => t.nome === topicoSelecionado)?.id ?? undefined;

        const ambienteId =
          ambientes.find(
            (a) =>
              String(a.id) === ambienteSelecionado && a.topico.id === topicoId
          )?.id ?? undefined;

        if (!topicoId || !ambienteId) {
          setItens([]);
          return;
        }

        const topico = empreendimento.empreendimentoTopicos.find(
          (t) => t.topicoId === topicoId
        );

        const ambiente = topico?.topicoAmbientes.find(
          (a) => a.ambienteId === ambienteId
        ) as TopicoAmbienteSafe | undefined;

        const ids = ambiente?.ambienteItens.map((i) => i.itemId) ?? [];

        if (ids.length === 0) {
          setItens([]);
          return;
        }

        const detalhados: Item[] = await Promise.all(
          ids.map((id) => itemService.getItemById(id))
        );

        const tabela: TabelaItem[] = detalhados.map((i) => ({
          id: i.id!,
          item: i.nome,
          descricao: i.descricao,
        }));

        setItens(tabela);
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    empreendimento,
    topicoSelecionado,
    ambienteSelecionado,
    isMarcas,
    refresh, // 🔥 FORÇA RELOAD APÓS UPDATE
  ]);

  // ======================================================
  // REMOVE ITEM OR MATERIAL
  // ======================================================
  const handleRemove = async (id: number) => {
    if (isMarcas) {
      onRemoveMaterial(id, TOPICO_MARCAS);
      setRefresh((prev) => !prev);
      return;
    }

    const [topics, ambientes] = await Promise.all([
      topicoService.getAllTopic(),
      subTopicosAmbienteService.getAllAmbiente(),
    ]);

    const topicoId = topics.find((t) => t.nome === topicoSelecionado)?.id;
    const ambienteId = ambientes.find(
      (a) => String(a.id) === ambienteSelecionado && a.topico.id === topicoId
    )?.id;

    if (!topicoId || !ambienteId) return;

    onRemoveItem(id, topicoId, ambienteId);
    setRefresh((prev) => !prev);
  };

  // ======================================================
  // OPEN EDIT MODALS
  // ======================================================
  const openEdit = (row: TabelaItem) => {
    if (isMarcas) {
      setEditMaterialData({
        id: row.id,
        nome: row.item,
        marcaId: 0,
      });
      setShowEditMaterial(true);
      return;
    }

    setEditItemData({
      id: row.id,
      nome: row.item,
      descricao: row.descricao,
    });
    setShowEditItem(true);
  };

  // ======================================================
  return (
    <div className="card mt-8">
      <DataTable
        value={itens}
        loading={loading}
        loadingIcon="pi pi-spin pi-spinner"
        emptyMessage={loading ? "Carregando..." : "Nenhum item neste local."}
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="item" header="Item" style={{ width: "35%" }} />
        <Column field="descricao" header="Descrição" style={{ width: "45%" }} />

        {/* EDITAR */}
        <Column
          header="Editar"
          style={{ width: "10%", textAlign: "center" }}
          body={(row: TabelaItem) => (
            <Button
              icon="pi pi-pencil"
              rounded
              text
              severity="info"
              onClick={() => openEdit(row)}
              disabled={loading}
            />
          )}
        />

        {/* REMOVER */}
        <Column
          header="Remover"
          style={{ width: "10%", textAlign: "center" }}
          body={(row: TabelaItem) => (
            <Button
              icon="pi pi-times"
              rounded
              text
              severity="danger"
              onClick={() => handleRemove(row.id)}
              disabled={loading}
            />
          )}
        />
      </DataTable>

      {/* MODAL EDIT ITEM */}
      <EditItemModal
        visible={showEditItem}
        onHide={() => setShowEditItem(false)}
        item={editItemData}
        onUpdated={() => setRefresh((prev) => !prev)}
      />

      {/* MODAL EDIT MATERIAL */}
      <EditMaterialModal
        visible={showEditMaterial}
        onHide={() => setShowEditMaterial(false)}
        material={editMaterialData}
        onUpdated={() => setRefresh((prev) => !prev)}
      />
    </div>
  );
}
