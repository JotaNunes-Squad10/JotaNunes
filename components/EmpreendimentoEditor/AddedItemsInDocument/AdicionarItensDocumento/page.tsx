import React, { useState, useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import AdicionarNovoItem from "./AdicionarNovoItem/page";
import {
  itemService,
  MarcaMateriais,
  subTopicosAmbienteService,
  UpdateEmpreendimento,
} from "@/lib/api";
import { Button } from "primereact/button";

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
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    if (!itemAmbienteSelecionado) return;

    const fetchItens = async () => {
      setLoading(true);
      try {
        const data = await itemService.getAllItem();
        const itensFormatados = data.map((item: any) => ({
          name: item.nome,
          code: String(item.id),
          descricao: item.descricao,
        }));

        const ambientes = await subTopicosAmbienteService.getAllAmbiente();
        const ambiente = ambientes.find(
          (a: any) => a.nome === itemAmbienteSelecionado
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

        const ambienteExistente = topico?.topicoAmbientes?.find(
          (a: any) => a.ambienteId === ambienteId
        );

        const itensExistentes = ambienteExistente
          ? ambienteExistente.ambienteItens.map((i: any) => i.itemId)
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

  const handleRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  // =========================
  //  FILTRAR E EXIBIR MARCAS
  // =========================
  useEffect(() => {
    if (ambienteSelecionado.toLowerCase() !== "marcas") return;

    const topicoMarcas = empreendimento.empreendimentoTopicos.find(
      (t: any) => t.topicoId === 3
    );

    const materiaisExistentes = topicoMarcas?.topicoMateriais
      ? topicoMarcas.topicoMateriais.map((m: any) => m.materialId)
      : [];

    const todasMarcas: AmbienteOption[] = itemMarcaMateriais.map((item) => ({
      name: item.marca.nome,
      code: String(item.id),
      descricao: item.material.nome,
      materialId: item.material.id,
    }));

    const filtrado = todasMarcas.filter(
      (m) => !materiaisExistentes.includes(m.materialId!)
    );

    setItensAmbiente(filtrado);
    setLoading(false);
  }, [ambienteSelecionado, empreendimento, itemMarcaMateriais]);

  // =========================
  //  ADICIONAR ITENS / MARCAS
  // =========================
  const handleAddItems = async () => {
    if (selectedAmbientes.length === 0) return;

    // -----------------------
    //  CASO ESPECIAL: MARCAS
    // -----------------------
    if (ambienteSelecionado.toUpperCase() === "MARCAS") {
      const TOPICO_MARCAS = 3;

      const idsToAdd = selectedAmbientes
        .map((sel) => {
          const found = itemMarcaMateriais.find(
            (mm) => mm.id === Number(sel.code)
          );
          return found?.material.id;
        })
        .filter(Boolean) as number[];

      if (idsToAdd.length === 0) return;

      onAddItems(idsToAdd, TOPICO_MARCAS, 0);

      // 🔥 REMOVER MARCAS ADICIONADAS DO MULTISELECT
      setItensAmbiente((prev) =>
        prev.filter(
          (item) => !selectedAmbientes.some((sel) => sel.code === item.code)
        )
      );

      setSelectedAmbientes([]);
      return;
    }

    // ------------------------
    //  CASO NORMAL (ITENS)
    // ------------------------
    const ambientes = await subTopicosAmbienteService.getAllAmbiente();

    const ambiente = ambientes.find(
      (a: any) => a.nome === itemAmbienteSelecionado
    );
    if (!ambiente) return;

    const topicoId = ambiente.topico.id;
    const ambienteId = ambiente.id;

    const idsToAdd = selectedAmbientes.map((i) => Number(i.code));
    onAddItems(idsToAdd, topicoId, ambienteId);

    setSelectedAmbientes([]);
  };

  return (
    <div>
      <div className="flex gap-3 w-full">
        <div className="card flex justify-content-center w-[50%]">
          <MultiSelect
            value={selectedAmbientes}
            onChange={(e: MultiSelectChangeEvent) =>
              setSelectedAmbientes(e.value)
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
        <AdicionarNovoItem onReload={handleRefresh} />
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
