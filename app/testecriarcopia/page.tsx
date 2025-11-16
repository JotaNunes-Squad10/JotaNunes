"use client";

import SelecionaAmbiente from "@/components/EmpreendimentoEditor/AddedItemsInDocument/SelecionaAmbiente/page";
import AdicionarNovoAmbiente from "@/components/EmpreendimentoEditor/AddedItemsInDocument/SelecionaItemAmbiente/AdicionarNovoAmbiente/page";
import Header from "@/components/gerenciamentoUser/headerUser/page";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { useParams } from "next/navigation";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useEffect, useState } from "react";
import {
  Empreendimento,
  empreendimentoService,
  DocumentoService,
} from "@/lib/api";

interface TituloEmpreendimento {
  name: string;
  id: number;
  versao: number;
}

interface Props {
  ambienteSelecionado: any;
  setAmbienteSelecionado: (value: any) => void;
}

export default function Comparacao({ ambienteSelecionado, setAmbienteSelecionado }: Props) {
  const params = useParams<{ documentId: string }>();
  const documentId = Number(params?.documentId);

  const [titulos, setTitulos] = useState<TituloEmpreendimento[]>([]);
  const [selectedTitulo, setSelectedTitulo] = useState<TituloEmpreendimento | null>(null);

  useEffect(() => {
    async function fetchEmpreendimentos() {
      try {
        const allEmpreendimentos: Empreendimento[] = await empreendimentoService.getAllEmpreendimento();

        const titulosFormatados: TituloEmpreendimento[] = allEmpreendimentos.map((empreendimento) => ({
          name: empreendimento.nome,
          id: empreendimento.id,
          versao: empreendimento.versao,
        }));

        console.log(allEmpreendimentos);
    setTitulos(titulosFormatados);
      } catch (error) {
        console.error("Erro ao buscar empreendimentos", error);
      }
    }

    fetchEmpreendimentos();
  }, []);

  // 🔍 Buscar EMPREENDIMENTO por ID
  async function buscarEmpreendimentoPorId(id: number) {
    try {
      const response = await empreendimentoService.getEmpreendimentoById(String(id));
      console.log("Empreendimento pelo ID:", response);

      return response.data; // contém { id, nome, versao, ... }
    } catch (error) {
      console.error("Erro ao buscar empreendimento:", error);
    }
  }

  // 🔍 Buscar EMPREENDIMENTO pela VERSÃO (rota correta)
  async function buscarEmpreendimentoPorVersao(id: number, versao: number) {
    try {
      const response = await empreendimentoService.getEmpreendimentoByVersion(String(id), versao);
      console.log("Empreendimento pela versão:", response);

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar empreendimento pela versão:", error);
    }
  }

  // 🧬 Clonar empreendimento (usando a versão correta)
  async function clonarEmpreendimento(empreendimentoOriginal: any) {
    const { id, ...empreendimentoSemId } = empreendimentoOriginal;

    try {
      const criado = await empreendimentoService.createEmpreendimento(empreendimentoSemId);
      console.log("Empreendimento clonado com sucesso:", criado);
      return criado;
    } catch (error) {
      console.error("Erro ao clonar empreendimento:", error);
    }
  }

  // 🔥 handleChange agora:
  // 1. Busca por ID
  // 2. Pega a versão retornada
  // 3. Busca essa versão específica na rota GetEmpreendimentoByVersion
  // 4. Clona a versão exata
  const handleChangeEmpreendimento = async (e: DropdownChangeEvent) => {
    const tituloSelecionado = e.value;

    setSelectedTitulo(tituloSelecionado);

    // 1️⃣ Buscar empreendimento por ID
    const empreendimentoInfo = await buscarEmpreendimentoPorId(tituloSelecionado.id);
    if (!empreendimentoInfo) return;

    const versaoAtual = empreendimentoInfo.versao;
    console.log("Versão atual retornada:", versaoAtual);

    // 2️⃣ Buscar a versão correta usando a rota GetEmpreendimentoByVersion
    const empreendimentoDaVersao = await buscarEmpreendimentoPorVersao(
      tituloSelecionado.id,
      versaoAtual
    );

    if (!empreendimentoDaVersao) return;

    console.log("Empreendimento vindo da versão correta:", empreendimentoDaVersao);

    // 3️⃣ Clonar a versão retornada
    await clonarEmpreendimento(empreendimentoDaVersao);
  };

  return (
    <div>
      <div className="mt-[100px] mx-10 flex flex-col justify-between gap-6">
        <div className="w-full flex justify-center mb-5 flex-1">
          <div className="w-full max-w-[800px]">
            <h3 className="mb-3 font-bold">Selecione o empreendimento</h3>

            <Dropdown
              value={selectedTitulo}
              options={titulos}
              optionLabel="name"
              placeholder="Selecione..."
              className="w-full md:w-14rem"
              onChange={handleChangeEmpreendimento}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
