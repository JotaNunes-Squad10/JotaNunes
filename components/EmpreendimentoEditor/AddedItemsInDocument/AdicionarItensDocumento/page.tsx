import React, { useState, useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import AdicionarNovoItem from "./AdicionarNovoItem/page";
import {
  itemService,
  MarcaMateriais,
  subTopicosAmbienteService,
  SubTopic,
  UpdateEmpreendimento,
  Item,
  EmprendimentoTopico,
} from "@/lib/api";
import { Button } from "primereact/button";
import AdicionarNovaMarca from "./AdicionarNovaMarca/page";

interface Props {
  itemAmbienteSelecionado: string;
  empreendimento: UpdateEmpreendimento;
  itensDocumento: number[];
  itemMarcaMateriais: MarcaMateriais[];
  ambienteSelecionado: string;
  onAddItems: (ids: number[], topicoId: number, ambienteId: number) => void;
}

interface AmbienteOption {
  name: string;
  code: string;
  descricao: string;
  materialId?: number;
}

// TIPOS SEGUROS PARA O QUE VOLTA DO BACKEND
type AmbienteItemSafe = {
  itemId: number;
  versoes?: number[];
};

type TopicoAmbienteSafe = {
  ambienteId: number;
  area?: number;
  posicao: number;
  ambienteItens: AmbienteItemSafe[];
};

export default function AdicionarItensDocumento({
  itemAmbienteSelecionado,
  empreendimento,
  onAddItems,
  itemMarcaMateriais,
  ambienteSelecionado,
}: Props) {
  const [itensAmbiente, setItensAmbiente] = useState<AmbienteOption[]>([]);
  const [selectedAmbientes, setSelectedAmbientes] = useState<AmbienteOption[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false);

  // RESET ao trocar AMBIENTE ↔ MARCAS
  useEffect(() => {
    setSelectedAmbientes([]);
    setItensAmbiente([]);
    setLoading(true);
  }, [ambienteSelecionado]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  // ==========================================================
  // 1) MODO MARCAS
  // ==========================================================
  useEffect(() => {
    if (ambienteSelecionado.toLowerCase() !== "marcas") return;

    setLoading(true);

    const topicoMarcas = empreendimento.empreendimentoTopicos.find(
      (t: EmprendimentoTopico) => t.topicoId === 3
    );

    const materiaisExistentes = topicoMarcas?.topicoMateriais
      ? topicoMarcas.topicoMateriais.map((m) => m.materialId)
      : [];

    const todasMarcas: AmbienteOption[] = itemMarcaMateriais.map((item) => ({
      name: item.marca.nome,
      code: String(item.id),
      descricao: item.material.nome,
      materialId: item.material.id,
    }));

    const filtrado = todasMarcas.filter(
      (m) => !materiaisExistentes.includes(m.materialId || 0)
    );

    setItensAmbiente(filtrado);
    setLoading(false);
  }, [ambienteSelecionado, empreendimento, itemMarcaMateriais]);

  // ==========================================================
  // 2) AMBIENTES NORMAIS
  // ==========================================================
  useEffect(() => {
    if (!itemAmbienteSelecionado) return;
    if (ambienteSelecionado.toLowerCase() === "marcas") return;

    const fetchItens = async () => {
      setLoading(true);

      try {
        const itensApi: Item[] = await itemService.getAllItem();

        const itensFormatados: AmbienteOption[] = itensApi.map((item) => ({
          name: item.nome,
          code: String(item.id),
          descricao: item.descricao,
        }));

        const ambientes: SubTopic[] =
          await subTopicosAmbienteService.getAllAmbiente();

        const ambiente = ambientes.find(
          (a) => a.nome === itemAmbienteSelecionado
        );

        if (!ambiente) {
          setItensAmbiente(itensFormatados);
          return;
        }

        const topicoId = ambiente.topico.id;
        const ambienteId = ambiente.id;

        const topico = empreendimento.empreendimentoTopicos.find(
          (t) => t.topicoId === topicoId
        );

        const ambienteExistente: TopicoAmbienteSafe | undefined =
          topico?.topicoAmbientes?.find((a) => a.ambienteId === ambienteId) as
            | TopicoAmbienteSafe
            | undefined;

        const itensExistentes = ambienteExistente
          ? ambienteExistente.ambienteItens.map((i) => i.itemId)
          : [];

        const filtrados = itensFormatados.filter(
          (i) => !itensExistentes.includes(Number(i.code))
        );

        setItensAmbiente(filtrados);
      } catch (error) {
        console.error("Erro ao carregar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, [
    itemAmbienteSelecionado,
    empreendimento,
    refreshTrigger,
    ambienteSelecionado,
  ]);

  // ==========================================================
  // ADICIONAR ITENS
  // ==========================================================
  const handleAddItems = async () => {
    if (selectedAmbientes.length === 0) return;

    // ------------- MARCAS --------------
    if (ambienteSelecionado.toUpperCase() === "MARCAS") {
      const TOPICO_MARCAS = 3;

      const idsToAdd = selectedAmbientes
        .map(
          (s) =>
            itemMarcaMateriais.find((mm) => mm.id === Number(s.code))?.material
              .id
        )
        .filter(Boolean) as number[];

      onAddItems(idsToAdd, TOPICO_MARCAS, 0);

      setItensAmbiente((prev) =>
        prev.filter((i) => !selectedAmbientes.some((s) => s.code === i.code))
      );

      setSelectedAmbientes([]);
      return;
    }

    // ------------- AMBIENTE NORMAL --------------
    const ambientes = await subTopicosAmbienteService.getAllAmbiente();

    const ambiente = ambientes.find((a) => a.nome === itemAmbienteSelecionado);
    if (!ambiente) return;

    const idsToAdd = selectedAmbientes.map((i) => Number(i.code));

    onAddItems(idsToAdd, ambiente.topico.id, ambiente.id);

    setSelectedAmbientes([]);
  };

  return (
    <div>
      <div className="flex gap-3 w-full">
        <div className="card flex justify-content-center w-[50%]">
          <MultiSelect
            value={selectedAmbientes}
            onChange={(e: MultiSelectChangeEvent) =>
              setSelectedAmbientes(e.value as AmbienteOption[])
            }
            options={itensAmbiente}
            optionLabel="name"
            placeholder={
              loading ? "Carregando itens..." : "Selecione um ou mais itens"
            }
            className="w-full md:w-14rem"
            display="chip"
            disabled={loading}
            filter
          />
        </div>

        {ambienteSelecionado.toLowerCase() !== "marcas" && (
          <AdicionarNovoItem onReload={handleRefresh} />
        )}

        {ambienteSelecionado.toLowerCase() === "marcas" && (
          <AdicionarNovaMarca onReload={handleRefresh} />
        )}
      </div>

      <div className="flex mt-3 w-[50%] gap-5">
        <Button
          label="Adicionar Item"
          onClick={handleAddItems}
          disabled={selectedAmbientes.length === 0}
          style={{
            backgroundColor: "#0f582a",
            color: "#ffffff",
            padding: "0.25rem",
            width: "100%",
            borderRadius: "0.5rem",
            border: "none",
          }}
        />
      </div>
    </div>
  );
}
