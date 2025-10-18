import React, { useState, useEffect } from "react";
// Trocamos o Dropdown pelo MultiSelect
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import AdicionarNovoItem from "./AdicionarNovoItem/page";
import { Item, itemService, Marca, marcaService } from "@/lib/api";

interface Props {
  itemAmbienteSelecionado: any;
}

interface AmbienteOption {
  name: string;
  code: string;
  descricao: string;
}

export default function AdicionarItensDocumento({
  itemAmbienteSelecionado,
}: Props) {
  const [itensAmbiente, setItensAmbiente] = useState<AmbienteOption[]>([]);
  const [selectedAmbientes, setSelectedAmbientes] = useState<AmbienteOption[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItens = async () => {
      try {
        setLoading(true);
        setSelectedAmbientes([]); // limpa seleção anterior
        let data: any[] = [];

        if (itemAmbienteSelecionado === "Descrição Marcas") {
          data = await marcaService.getAllMarca();
        } else {
          data = await itemService.getAllItem();
        }

        const itensFormatados = data.map((item) => ({
          name: item.nome,
          code: String(item.id),
          descricao: item.descricao,
        }));

        setItensAmbiente(itensFormatados);
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, [itemAmbienteSelecionado]);

  return (
    <div className="flex gap-3 items-end w-full">
      {/* Container do MultiSelect, ocupando 50% ou o necessário */}
      <div className="card flex justify-center w-[50%]">
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
          className="w-full"
          // Classes para estilização parecida com a imagem (PrimeReact já faz a maior parte)
          style={{ minWidth: "350px" }}
          display="chip"
          showClear={selectedAmbientes.length > 0}
          disabled={loading}
        />
      </div>
      <AdicionarNovoItem />
    </div>
  );
}
