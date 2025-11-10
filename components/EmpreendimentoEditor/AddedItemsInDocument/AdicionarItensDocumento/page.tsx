import React, { useState, useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import AdicionarNovoItem from "./AdicionarNovoItem/page";
import { EmpreendimentosTopicos, itemService, marcaService } from "@/lib/api";

interface Props {
  itemAmbienteSelecionado: string;
  empreendimentoTopicos: EmpreendimentosTopicos[];
  itensDocumento: number[];
  onAddItems: (ids: number[]) => void;
}

interface AmbienteOption {
  name: string;
  code: string;
  descricao: string;
}

export default function AdicionarItensDocumento({
  itemAmbienteSelecionado,
  empreendimentoTopicos,
  itensDocumento,
  onAddItems,
}: Props) {
  const [itensAmbiente, setItensAmbiente] = useState<AmbienteOption[]>([]);
  const [selectedAmbientes, setSelectedAmbientes] = useState<AmbienteOption[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const fetchItens = async () => {
      setLoading(true);
      try {
        let data: any[] = [];

        if (itemAmbienteSelecionado === "Descrição Marcas") {
          data = await marcaService.getAllMarca();
        } else {
          data = await itemService.getAllItem();
        }

        const itensFormatados = data.map((item) => ({
          name: item.nome,
          code: String(item.id),
          descricao: "descricao" in item ? item.descricao : "", // 👈 prevenção segura
        }));

        // Remove itens que já estão no documento
        const filtrados = itensFormatados.filter(
          (i) => !itensDocumento.includes(Number(i.code))
        );

        setItensAmbiente(filtrados);
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, [itemAmbienteSelecionado, itensDocumento]);

  const handleReload = () => {
    setReload((prev) => !prev);
  };

  return (
    <div className="flex gap-3 w-full">
      {/* Container do MultiSelect, ocupando 50% ou o necessário */}
      <div className="card flex justify-content-center w-[50%]">
        <MultiSelect
          value={selectedAmbientes}
          onChange={(e: MultiSelectChangeEvent) =>
            setSelectedAmbientes(e.value)
          }
          options={itensAmbiente}
          optionLabel="name"
          placeholder={
            loading
              ? "Carregando itens..."
              : "Selecione um ou mais Itens de Ambiente"
          }
          className="w-full md:w-14rem"
          display="chip"
          showClear={selectedAmbientes.length > 0}
          disabled={loading}
          filter
          filterDelay={400}
        />
      </div>
      <AdicionarNovoItem onReload={handleReload} />
    </div>
  );
}
