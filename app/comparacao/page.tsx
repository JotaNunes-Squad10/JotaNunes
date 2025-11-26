"use client";
import Header from "../../components/headerUser/page";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useEffect, useState } from "react";
import {
  Empreendimento,
  empreendimentoService,
  DocumentoService,
} from "@/lib/api";
import { empreendimentoService as empreendimentoService1 } from "@/lib/api1";
import Popup from '../../components/popup/page';

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
  
  const [usuarioVersaoAtual, setUsuarioVersaoAtual] = useState<string | null>(null);
  const [usuarioVersaoSelecionada, setUsuarioVersaoSelecionada] = useState<string | null>(null);

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

  // Depois do useEffect que carrega os titulos:
useEffect(() => {
  const idSalvo = sessionStorage.getItem("empreendimentoSelecionado");
  if (!idSalvo) return;

  const encontrado = titulos.find(t => String(t.id) === String(idSalvo));
  if (!encontrado) return;

  // Preseleciona o título
  setSelectedTitulo(encontrado);

  // Preenche o dropdown de versões
  const versoesArray = Array.from({ length: encontrado.versao }, (_, i) => encontrado.versao - i);
  setVersoes(versoesArray);

  // Já gera o documento atual automaticamente
  DocumentoService.generateDocumento({
    id: String(encontrado.id),
    version: encontrado.versao,
  })
    .then((res) => setDocumentoAtual(res.data))
    .catch((err) => console.error("Erro ao gerar documento atual:", err));

  // Busca informações da versão atual
  empreendimentoService1.getEmpreendimentoByVersion(String(encontrado.id), encontrado.versao)
    .then((res) => {
      const versaoEspecifica = res.data.empreendimentos.find(
        (emp) => emp.versao === encontrado.versao
      );
      setUsuarioVersaoAtual(versaoEspecifica?.usuarioAlteracao || "Usuário desconhecido");
    })
    .catch((err) => console.error("Erro ao buscar usuário da versão atual:", err));

  sessionStorage.removeItem("empreendimentoSelecionado");

}, [titulos]);

  const handleChangeEmpreendimento = async (e: DropdownChangeEvent) => {
    const empreendimentoSelecionado = e.value as TituloEmpreendimento;
    setSelectedTitulo(empreendimentoSelecionado);

    const versoesArray = Array.from({ length: empreendimentoSelecionado.versao }, (_, i) => empreendimentoSelecionado.versao - i);
    setVersoes(versoesArray);
    setSelectedVersao(null);
    setDocumentoComparado(null);

    try {

      const responseAtual = await DocumentoService.generateDocumento({
        id: String(empreendimentoSelecionado.id),
        version: empreendimentoSelecionado.versao,
      });

      setDocumentoAtual(responseAtual.data);

      const versaoInfo = await empreendimentoService1.getEmpreendimentoByVersion(
        String(empreendimentoSelecionado.id),
        empreendimentoSelecionado.versao
      );
      const versaoEspecifica = versaoInfo.data.empreendimentos.find(
        (emp) => emp.versao === empreendimentoSelecionado.versao
      );
      setUsuarioVersaoAtual(versaoEspecifica?.usuarioAlteracao || "Usuário desconhecido");
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

      setDocumentoComparado(responseComparado.data);

      // Busca informações da versão selecionada
      const versaoInfo = await empreendimentoService1.getEmpreendimentoByVersion(
        String(selectedTitulo.id),
        versaoSelecionada
      );
      const versaoEspecifica = versaoInfo.data.empreendimentos.find(
        (emp) => emp.versao === versaoSelecionada
      );
      setUsuarioVersaoSelecionada(versaoEspecifica?.usuarioAlteracao || "Usuário desconhecido");
    } catch (error) {
      console.error("Erro ao gerar documento comparado:", error);
    }
  };

  return (
    <div>
      <Header />
      <Popup />

      <div className="mt-4 sm:mt-8 mx-4 sm:mx-6 md:mx-10 flex flex-col justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="mb-3 text-[20px] sm:text-[24px] font-bold">Comparação de versões</h1>
        </div>

        <div className="w-full flex justify-center mb-3 sm:mb-5 flex-1">
          <div className="w-full max-w-[800px]">
            <h3 className="mb-2 sm:mb-3 text-sm sm:text-base font-bold">Selecione o empreendimento</h3>

            <Dropdown
              value={selectedTitulo}
              options={titulos}
              onChange={handleChangeEmpreendimento}
              optionLabel="name"
              placeholder="Selecione..."
              className="w-full"
            />
          </div>
        </div>

        <div className="h-[2px] w-full bg-gray-200"></div>

        {selectedTitulo && (
        <div className="w-full flex flex-col gap-4 mb-3 sm:mb-5 flex-1">

            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 sm:gap-4 w-full max-w-[900px] mx-auto">

            <div className="w-full md:w-1/2">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Empreendimento selecionado:</p>
                <h2 className="text-lg sm:text-xl font-bold break-words">{selectedTitulo.name}</h2>
            </div>

            <div className="w-full md:w-1/2">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Selecione a versão para comparar</p>

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
            <div className="mt-4 sm:mt-10 w-full flex flex-col gap-3 sm:gap-6">

                {/* Mobile: Versão em coluna */}
                <div className="flex flex-col gap-4 sm:gap-6 lg:hidden">
                
                  {/* Versão Atual */}
                  <div className="flex flex-col gap-2">
                    <div className="text-center">
                      <p className="font-bold text-sm sm:text-lg">Versão Atual (mais recente)</p>
                      {usuarioVersaoAtual && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Criado por: {usuarioVersaoAtual}</p>
                      )}
                    </div>
                    <iframe
                        className="w-full h-[60vh] sm:h-[70vh] border rounded"
                        src={`data:application/pdf;base64,${documentoAtual}`}
                    />
                  </div>

                  {/* Versão Selecionada */}
                  {documentoComparado && (
                    <div className="flex flex-col gap-2">
                      <div className="text-center">
                        <p className="font-bold text-sm sm:text-lg">Versão Selecionada</p>
                        {usuarioVersaoSelecionada && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">Criado por: {usuarioVersaoSelecionada}</p>
                        )}
                      </div>
                      <iframe
                        className="w-full h-[60vh] sm:h-[70vh] border rounded"
                        src={`data:application/pdf;base64,${documentoComparado}`}
                      />
                    </div>
                  )}
                </div>

                {/* Desktop: Versão lado a lado */}
                <div className="hidden lg:block">
                  <div className="flex gap-2 sm:gap-4 text-sm sm:text-lg mb-4">
                    <div className="flex-1 text-center">
                      <p className="font-bold">Versão Atual (mais recente)</p>
                      {usuarioVersaoAtual && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">Criado por: {usuarioVersaoAtual}</p>
                      )}
                    </div>
                    {documentoComparado && (
                      <div className="flex-1 text-center">
                        <p className="font-bold">Versão Selecionada</p>
                        {usuarioVersaoSelecionada && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">Criado por: {usuarioVersaoSelecionada}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={`flex gap-6 ${!documentoComparado ? "justify-center" : ""}`}>
                    <iframe
                        className={`${documentoComparado ? "flex-1" : "w-full lg:w-[600px] mx-auto"} h-[80vh] border rounded`}
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

            </div>
            )}
        </div>
        )}
      </div>
    </div>
  );
}
