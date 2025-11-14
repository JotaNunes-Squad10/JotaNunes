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

  useEffect(() => {
    const fetchItens = async () => {
      setLoading(true);
      try {
        const data = await itemService.getAllItem();
        const todosItens = data || data;
        const itensFormatados = todosItens.map((item: any) => ({
          name: item.nome,
          code: String(item.id),
          descricao: item.descricao,
        }));

        // 🔹 pegar o ambiente selecionado e topico correspondente
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
        const ambienteExistente = topico?.topicoAmbientes.find(
          (a: any) => a.ambienteId === ambienteId
        );

        const itensExistentes = ambienteExistente
          ? ambienteExistente.ambienteItens.map((i: any) => i.itemId)
          : [];

        // 🔹 filtra itens que ainda não estão no documento
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

    if (itemAmbienteSelecionado) fetchItens();
  }, [itemAmbienteSelecionado, empreendimento]);

  useEffect(() => {
    if (ambienteSelecionado.toLocaleLowerCase() === "marcas") {
      const itemMarcas: AmbienteOption[] = itemMarcaMateriais.map((item) => ({
        name: item.marca.nome,
        code: String(item.id),
        descricao: item.material.nome,
      }));

      setItensAmbiente(itemMarcas);
      setLoading(false);
    }
  }, [ambienteSelecionado]);

  const handleAddItems = async () => {
    if (selectedAmbientes.length === 0) return;

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
        <AdicionarNovoItem onReload={() => {}} />
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
