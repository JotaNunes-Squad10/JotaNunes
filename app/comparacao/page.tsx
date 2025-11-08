"use client";

// import SelecionaAmbiente from "@/components/EmpreendimentoEditor/AddedItemsInDocument/SelecionaAmbiente/page";
// import AdicionarNovoAmbiente from "@/components/EmpreendimentoEditor/AddedItemsInDocument/SelecionaItemAmbiente/AdicionarNovoAmbiente/page";
import Header from "../../components/headerUser/page";
import "primereact/resources/themes/lara-light-indigo/theme.css";
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



export default function Comparacao() {

  const [titulos, setTitulos] = useState<TituloEmpreendimento[]>([]);
  const [selectedTitulo, setSelectedTitulo] = useState<TituloEmpreendimento | null>(null);

  const [versoes, setVersoes] = useState<number[]>([]);
  const [selectedVersao, setSelectedVersao] = useState<number | null>(null);

  const [documentoAtual, setDocumentoAtual] = useState<string | null>(null);
  const [documentoComparado, setDocumentoComparado] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmpreendimentos() {
      try {
        const allEmpreendimentos: Empreendimento[] = await empreendimentoService.getAllEmpreendimento();

        const titulosFormatados: TituloEmpreendimento[] = allEmpreendimentos.map((empreendimento) => ({
          name: empreendimento.nome,
          id: empreendimento.id,
          versao: empreendimento.versao,
        }));

        setTitulos(titulosFormatados);
      } catch (error) {
        console.error("Erro ao buscar empreendimentos", error);
      }
    }

    fetchEmpreendimentos();
  }, []);

  const handleChangeEmpreendimento = async (e: DropdownChangeEvent) => {
    const empreendimentoSelecionado = e.value as TituloEmpreendimento;
    setSelectedTitulo(empreendimentoSelecionado);
  // setAmbienteSelecionado?.(empreendimentoSelecionado); // Removido pois não existe mais essa prop

    const versoesArray = Array.from({ length: empreendimentoSelecionado.versao }, (_, i) => empreendimentoSelecionado.versao - i);
    setVersoes(versoesArray);
    setSelectedVersao(null);
    setDocumentoComparado(null);

    try {

      const responseAtual = await DocumentoService.generateDocumento({
        id: String(empreendimentoSelecionado.id),
        version: empreendimentoSelecionado.versao,
      });

      console.log("📄 Documento atual (versão mais recente):", responseAtual);
      setDocumentoAtual(responseAtual.data);
    } catch (error) {
      console.error("Erro ao gerar documento atual:", error);
    }
  };

  const handleChangeVersao = async (e: DropdownChangeEvent) => {
    const versaoSelecionada = e.value;
    setSelectedVersao(versaoSelecionada);

    if (!selectedTitulo) return;

    try {
      const responseComparado = await DocumentoService.generateDocumento({
        id: String(selectedTitulo.id),
        version: versaoSelecionada,
      });

      console.log("📄 Documento da versão selecionada:", responseComparado);
      setDocumentoComparado(responseComparado.data);
    } catch (error) {
      console.error("Erro ao gerar documento comparado:", error);
    }
  };

  return (
    <div>
      <Header />

      <div className="mt-[100px] mx-10 flex flex-col justify-between gap-6">
        <div>
          <h1 className="mb-3 text-[24px] font-bold">Comparação de versões</h1>
        </div>

        <div className="w-full flex justify-center mb-5 flex-1">
          <div className="w-full max-w-[800px]">
            <h3 className="mb-3 font-bold">Selecione o empreendimento</h3>

            <Dropdown
              value={selectedTitulo}
              options={titulos}
              onChange={handleChangeEmpreendimento}
              optionLabel="name"
              placeholder="Selecione..."
              className="w-full md:w-14rem"
            />
          </div>
        </div>

        <div className="h-[2px] w-full bg-gray-200"></div>

        {selectedTitulo && (
        <div className="w-full flex flex-col gap-4 mb-5 flex-1">

            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-[900px] mx-auto">

            <div className="w-full md:w-1/2">
                <p className="text-sm text-gray-500 mb-1">Empreendimento selecionado:</p>
                <h2 className="text-xl font-bold">{selectedTitulo.name}</h2>
            </div>

            <div className="w-full md:w-1/2">
                <p className="text-sm text-gray-500 mb-1">Selecione a versão para comparar</p>

                <Dropdown
                value={selectedVersao}
                options={versoes.map((v) => ({ label: `Versão ${v}`, value: v }))}
                onChange={handleChangeVersao}
                placeholder="Selecione a versão..."
                className="w-full"
                />
            </div>

            </div>

            <div className="h-[2px] w-full bg-gray-300"></div>
            {documentoAtual && (
            <div className="mt-10 w-full flex flex-col gap-6">

                <div className="flex gap-4 font-bold text-lg">
                <p className="flex-1 text-center">Versão Atual (mais recente)</p>
                {documentoComparado && <p className="flex-1 text-center">Versão Selecionada</p>}
                </div>

                <div className={`flex gap-6 ${documentoComparado ? "flex-row" : "justify-center"}`}>
                
                <iframe
                    className="flex-1 h-[80vh] border rounded"
                    src={`data:application/pdf;base64,${documentoAtual}`}
                />

                {documentoComparado && (
                    <iframe
                    className="flex-1 h-[80vh] border rounded"
                    src={`data:application/pdf;base64,${documentoComparado}`}
                    />
                )}
                </div>
            </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
}