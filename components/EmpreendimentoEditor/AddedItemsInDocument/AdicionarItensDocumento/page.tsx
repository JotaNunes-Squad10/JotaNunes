import React, { useState, useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import AdicionarNovoItem from "./AdicionarNovoItem/page";
import {
  EmpreendimentosTopicos,
  itemService,
  marcaService,
  SubTopic,
  subTopicosAmbienteService,
} from "@/lib/api";
import { extractItemIdsFromDocumento } from "@/utils/extractItemsFromDocumento";

interface Props {
  itemAmbienteSelecionado: any;
  empreendimentoTopicos: EmpreendimentosTopicos[];
}

interface AmbienteOption {
  name: string;
  code: string;
  descricao: string;
}

export default function AdicionarItensDocumento({
  itemAmbienteSelecionado,
  empreendimentoTopicos,
}: Props) {
  const [itensAmbiente, setItensAmbiente] = useState<AmbienteOption[]>([]);
  const [selectedAmbientes, setSelectedAmbientes] = useState<AmbienteOption[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

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

        // Realiza a lógica de filtragem dos itens que já estão no documento
        filterItensDocumento(itemAmbienteSelecionado);
      } catch (error) {
        console.error("Erro ao buscar itens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItens();
  }, [itemAmbienteSelecionado, reload]);

  const filterItensDocumento = async (ambienteSelecionado: string) => {
    try {
      const ambientes: SubTopic[] =
        await subTopicosAmbienteService.getAllAmbiente();

      const ambienteEncontrado = ambientes.find(
        (a) => a.nome === ambienteSelecionado
      );

      if (!ambienteEncontrado) {
        console.warn(`Ambiente ${ambienteSelecionado} não encontrado.`);
        return;
      }

      const idAmbiente = ambienteEncontrado.id;
      const idTopico = ambienteEncontrado.topico.id;

      const itemIdsInDocument = extractItemIdsFromDocumento(
        empreendimentoTopicos,
        idTopico,
        idAmbiente
      );

      const itensFiltrados = itensAmbiente.filter(
        (item) => !itemIdsInDocument.includes(Number(item.code))
      );

      setItensAmbiente(itensFiltrados);
    } catch (error) {
      console.error("Erro ao filtrar itens do documento", error);
    }
  };

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
