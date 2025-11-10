import React, { useState, useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import AdicionarNovoItem from "./AdicionarNovoItem/page";
import { EmpreendimentosTopicos, itemService, marcaService } from "@/lib/api";
import { Button } from "primereact/button";

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

  const handleAddItems = async () => {
    if (selectedAmbientes.length === 0) return;

    const idsToAdd = selectedAmbientes.map((item) => Number(item.code));

    onAddItems(idsToAdd);

    setItensAmbiente((prev) =>
      prev.filter((item) => !idsToAdd.includes(Number(item.code)))
    );
    setSelectedAmbientes([]);

    // TODO: 🚀 Aqui é o ponto exato onde faremos o PUT do documento
    // try {
    //   const updatedDoc = { ...documentoAtual, empreendimentoTopicos: novosTopicos };
    //   await DocumentoService.updateEmpreendimento(updatedDoc);
    //   console.log("Documento atualizado com sucesso após adição!");
    // } catch (error) {
    //   console.error("Erro ao atualizar o documento após adição:", error);
    // }

    console.log("Itens adicionados (otimista):", idsToAdd);
  };

  const handleReload = () => {
    setReload((prev) => !prev);
  };

  return (
    <div>
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
      <div className="flex mt-3 w-[50%] gap-5">
        <Button
          label="Adicionar Item"
          onClick={handleAddItems}
          disabled={selectedAmbientes.length === 0}
          style={{
            backgroundColor: "#0f582a",
            color: "#ffffff",
            padding: "0.25rem", // equivalente a p-1
            width: "100%",
            borderRadius: "0.5rem", // equivalente a rounded-lg
            border: "none",
            cursor: selectedAmbientes.length === 0 ? "not-allowed" : "pointer",
            opacity: selectedAmbientes.length === 0 ? 0.6 : 1,
            transition: "background-color 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            if (selectedAmbientes.length > 0)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#0d4923";
          }}
          onMouseLeave={(e) => {
            if (selectedAmbientes.length > 0)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "#0f582a";
          }}
        />
      </div>
    </div>
  );
}
