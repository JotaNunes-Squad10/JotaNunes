import React, { useEffect, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { topicoService, Topico } from "@/lib/api";

interface TituloAmbiente {
  name: string;
  code: string;
}

interface Props {
  ambienteSelecionado: string;
  setAmbienteSelecionado: (value: string) => void;
}

export default function SelecionaAmbiente({
  ambienteSelecionado,
  setAmbienteSelecionado,
}: Props) {
  const [titulos, setTitulos] = useState<TituloAmbiente[]>([]);

  useEffect(() => {
    async function fetchTopicos() {
      try {
        const allTopicos: Topico[] = await topicoService.getAllTopic();

        const titulosFormatados: TituloAmbiente[] = allTopicos.map(
          (topico, index) => ({
            name: `${index + 1}. ${topico.nome}`,
            code: topico.nome,
          })
        );

        setTitulos(titulosFormatados);
      } catch (error) {
        console.error("Erro ao buscar tópicos", error);
      }
    }

    fetchTopicos();
  }, []);

  return (
    <div className="card flex justify-content-center mb-5 w-[50%]">
      <Dropdown
        value={titulos.find((t) => t.code === ambienteSelecionado) || null}
        onChange={(e: DropdownChangeEvent) =>
          setAmbienteSelecionado(e.value.code)
        }
        options={titulos}
        optionLabel="name"
        placeholder="Selecione Ambiente"
        className="w-full md:w-14rem"
      />
    </div>
  );
}
