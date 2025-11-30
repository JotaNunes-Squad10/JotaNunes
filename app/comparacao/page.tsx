"use client";
import Header from "../../components/headerUser/page";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { useEffect, useState, useRef } from "react";
import { Toast } from 'primereact/toast';
import {
  Empreendimento,
  empreendimentoService,
} from "@/lib/api";
import { empreendimentoService as empreendimentoService1 } from "@/lib/api1";
import Popup from '../../components/popup/page';
import { itemService, ambienteService, topicoService, marcaMaterialService, materialService } from '@/lib/services';

interface TituloEmpreendimento {
  name: string;
  id: number;
  versao: number;
}

interface DadosVersao {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  padrao: string;
  status: string;
  versao: number;
  usuarioAlteracao: string;
  dataHoraAlteracao: string;
  empreendimentos?: Array<{
    id: number;
    nome: string;
    descricao: string;
    localizacao: string;
    padrao: string;
    versao: number;
    usuarioAlteracao: string;
    dataHoraAlteracao: string;
  }>;
  empreendimentoTopicos?: Array<{
    id: number;
    topicoId: number;
    topico?: {
      id: number;
      nome: string;
      descricao?: string;
    };
    posicao: number;
    topicoAmbientes?: Array<{
      id: number;
      ambienteId: number;
      ambiente?: {
        id: number;
        nome: string;
        descricao?: string;
      };
      area?: number;
      posicao: number;
      ambienteItens?: Array<{
        id: number;
        itemId: number;
        item?: {
          id: number;
          nome: string;
          descricao?: string;
        };
      }>;
    }>;
    topicoMateriais?: Array<{
      id: number;
      materialId: number;
      material?: {
        id: number;
        nome: string;
        descricao?: string;
      };
    }>;
  }>;
}

export default function Comparacao() {
  const toast = useRef<Toast | null>(null);
  const [titulos, setTitulos] = useState<TituloEmpreendimento[]>([]);
  const [selectedTitulo, setSelectedTitulo] = useState<TituloEmpreendimento | null>(null);
  const [versoes, setVersoes] = useState<number[]>([]);
  const [selectedVersao, setSelectedVersao] = useState<number | null>(null);
  const [dadosVersaoAtual, setDadosVersaoAtual] = useState<DadosVersao | null>(null);
  const [dadosVersaoComparada, setDadosVersaoComparada] = useState<DadosVersao | null>(null);
  const [loadingAtual, setLoadingAtual] = useState(false);
  const [loadingComparada, setLoadingComparada] = useState(false);
  const [itemsMap, setItemsMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
  const [ambientesMap, setAmbientesMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
  const [topicosMap, setTopicosMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
  const [marcasMap, setMarcasMap] = useState<Record<number, string[]>>({});
  const [materialNamesMap, setMaterialNamesMap] = useState<Record<number, string>>({});

  useEffect(() => {
    async function fetchEmpreendimentos() {
      try {
        const allEmpreendimentos: Empreendimento[] = await empreendimentoService.getAllEmpreendimento();
        const titulosFormatados: TituloEmpreendimento[] = allEmpreendimentos.map((emp) => ({
          name: emp.nome,
          id: emp.id,
          versao: emp.versao,
        }));
        setTitulos(titulosFormatados);
      } catch (error) {
        console.error("Erro ao buscar empreendimentos", error);
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar empreendimentos', life: 3000 });
      }
    }
    fetchEmpreendimentos();
  }, []);

  useEffect(() => {
    const idSalvo = sessionStorage.getItem("empreendimentoSelecionado");
    if (!idSalvo || titulos.length === 0) return;

    const encontrado = titulos.find(t => String(t.id) === String(idSalvo));
    if (!encontrado) return;

    setSelectedTitulo(encontrado);
    const versoesArray = Array.from({ length: encontrado.versao }, (_, i) => encontrado.versao - i);
    setVersoes(versoesArray);

    setLoadingAtual(true);
    empreendimentoService1.getEmpreendimentoByVersion(String(encontrado.id), encontrado.versao)
      .then((res) => {
        const data = res.data as unknown as DadosVersao;
        setDadosVersaoAtual({ ...data });
        fetchItemsNames(data);
        fetchAuxNames(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar versão atual:", err);
        toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar versão atual', life: 3000 });
      })
      .finally(() => setLoadingAtual(false));

    sessionStorage.removeItem("empreendimentoSelecionado");
  }, [titulos]);

  const handleChangeEmpreendimento = async (e: DropdownChangeEvent) => {
    const emp = e.value as TituloEmpreendimento;
    setSelectedTitulo(emp);

    const versoesArray = Array.from({ length: emp.versao }, (_, i) => emp.versao - i);
    setVersoes(versoesArray);
    setSelectedVersao(null);
    setDadosVersaoComparada(null);

    setLoadingAtual(true);
    try {
      const versaoInfo = await empreendimentoService1.getEmpreendimentoByVersion(String(emp.id), emp.versao);
      const data = versaoInfo.data as unknown as DadosVersao;
      setDadosVersaoAtual({ ...data });
      fetchItemsNames(data);
      fetchAuxNames(data);
    } catch (error) {
      console.error("Erro ao buscar versão atual:", error);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar versão atual', life: 3000 });
    } finally {
      setLoadingAtual(false);
    }
  };

  const handleChangeVersao = async (e: DropdownChangeEvent) => {
    const versaoSelecionada = e.value;
    setSelectedVersao(versaoSelecionada);
    if (!selectedTitulo) return;

    setLoadingComparada(true);
    try {
      const versaoInfo = await empreendimentoService1.getEmpreendimentoByVersion(
        String(selectedTitulo.id),
        versaoSelecionada
      );
      const data = versaoInfo.data as unknown as DadosVersao;
      setDadosVersaoComparada({ ...data });
      fetchItemsNames(data);
      fetchAuxNames(data);
    } catch (error) {
      console.error("Erro ao buscar versão comparada:", error);
      toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar versão para comparação', life: 3000 });
    } finally {
      setLoadingComparada(false);
    }
  };

  const formatarData = (data: string) => {
    if (!data) return '-';
    try {
      const date = new Date(data);
      if (isNaN(date.getTime())) return data;
      return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return data;
    }
  };

  const getDadosVersao = (data: DadosVersao | null) => {
    if (!data) return null;
    
    if (data.empreendimentos && data.empreendimentos.length > 0) {
      const emp = data.empreendimentos[0];
      return {
        ...data,
        nome: emp.nome || data.nome,
        descricao: emp.descricao || data.descricao,
        localizacao: emp.localizacao || data.localizacao,
        padrao: emp.padrao || data.padrao,
        versao: emp.versao || data.versao,
        usuarioAlteracao: emp.usuarioAlteracao,
        dataHoraAlteracao: emp.dataHoraAlteracao
      };
    }
    
    return data;
  };

  const fetchItemsNames = async (d?: DadosVersao | null) => {
    if (!d) return;
    try {
      const ids = new Set<number>();
      d.empreendimentoTopicos?.forEach((top) => {
        top.topicoAmbientes?.forEach((amb) => {
          amb.ambienteItens?.forEach((it) => {
            if (typeof it.itemId === 'number') ids.add(it.itemId);
          });
        });
      });

      if (ids.size === 0) return;

      const idsArray = Array.from(ids);
      const BATCH_SIZE = 10;

      for (let i = 0; i < idsArray.length; i += BATCH_SIZE) {
        const batch = idsArray.slice(i, i + BATCH_SIZE);
        const promises = batch.map((id) => itemService.getItemById(id));
        const results = await Promise.allSettled(promises);
        const fetchedMap: Record<number, { nome?: string; descricao?: string }> = {};
        results.forEach((r, idx) => {
          const id = batch[idx];
          if (r.status === 'fulfilled' && r.value) {
            fetchedMap[id] = { nome: r.value.nome, descricao: r.value.descricao };
          }
        });
        setItemsMap((prev) => ({ ...prev, ...fetchedMap }));
      }
    } catch (err) {
      console.error('Erro ao buscar nomes de itens', err);
    }
  };

  const fetchAuxNames = async (d?: DadosVersao | null) => {
    if (!d) return;
    try {
      const ambienteIds = new Set<number>();
      const topicoIds = new Set<number>();
      const materialIds = new Set<number>();

      d.empreendimentoTopicos?.forEach((top) => {
        if (typeof top.topicoId === 'number') topicoIds.add(top.topicoId);
        top.topicoAmbientes?.forEach((amb) => {
          if (typeof amb.ambienteId === 'number') ambienteIds.add(amb.ambienteId);
        });
        top.topicoMateriais?.forEach((mat) => {
          if (typeof mat.materialId === 'number') materialIds.add(mat.materialId);
        });
      });

      if (topicoIds.size > 0) {
        const topPromises = Array.from(topicoIds).map((id) => topicoService.getTopicoById(id));
        const topResults = await Promise.allSettled(topPromises);
        const tMap: Record<number, { nome?: string; descricao?: string }> = {};
        topResults.forEach((r, idx) => {
          const id = Array.from(topicoIds)[idx];
          if (r.status === 'fulfilled' && r.value) tMap[id] = { nome: r.value.nome, descricao: r.value.descricao };
        });
        setTopicosMap((prev) => ({ ...prev, ...tMap }));
      }

      if (ambienteIds.size > 0) {
        const ambPromises = Array.from(ambienteIds).map((id) => ambienteService.getAmbienteById(id));
        const ambResults = await Promise.allSettled(ambPromises);
        const aMap: Record<number, { nome?: string; descricao?: string }> = {};
        ambResults.forEach((r, idx) => {
          const id = Array.from(ambienteIds)[idx];
          if (r.status === 'fulfilled' && r.value) aMap[id] = { nome: r.value.nome, descricao: r.value.descricao };
        });
        setAmbientesMap((prev) => ({ ...prev, ...aMap }));
      }

      if (materialIds.size > 0) {
        const idsArray = Array.from(materialIds);
        const matPromises = idsArray.map((id) => marcaMaterialService.getAllMarcasByMaterialId(id));
        const matResults = await Promise.allSettled(matPromises);
        const mMap: Record<number, string[]> = {};
        const materialNameMap: Record<number, string> = {};
        matResults.forEach((r, idx) => {
          const id = idsArray[idx];
          if (r.status === 'fulfilled' && r.value) {
            const val = r.value as unknown as { marcas?: string[]; material?: unknown };
            const marcasArr = Array.isArray(val?.marcas) ? val!.marcas!.map(String) : [];
            mMap[id] = marcasArr;
            if (val && val.material) {
              if (typeof val.material === 'string') materialNameMap[id] = String(val.material);
              else if (typeof val.material === 'object' && val.material !== null) {
                const matObj = val.material as Record<string, unknown>;
                const candidate = matObj['nome'] ?? matObj['name'] ?? matObj['materialName'] ?? matObj['descricao'];
                if (candidate) materialNameMap[id] = String(candidate);
              }
            }
          }
        });

        const missingIds = idsArray.filter((id) => !materialNameMap[id]);
        if (missingIds.length > 0) {
          const materialPromises = missingIds.map((id) => materialService.getMaterialById(id));
          const materialResults = await Promise.allSettled(materialPromises);
          materialResults.forEach((r, idx) => {
            const id = missingIds[idx];
            if (r.status === 'fulfilled' && r.value) {
              const m = r.value;
              if (m && m.nome) materialNameMap[id] = m.nome;
            }
          });
        }

        setMarcasMap((prev) => ({ ...prev, ...mMap }));
        setMaterialNamesMap((prev) => ({ ...prev, ...materialNameMap }));
      }
    } catch (err) {
      console.error('Erro ao buscar nomes auxiliares', err);
    }
  };

  type TopicoEntry = NonNullable<DadosVersao["empreendimentoTopicos"]>[number];
  const sortTopicos = (topicos?: DadosVersao["empreendimentoTopicos"]): TopicoEntry[] => {
    if (!topicos || topicos.length === 0) return [];
    const orderKey = (t: TopicoEntry) => {
      const nome = topicosMap[t.topicoId ?? 0]?.nome || t.topico?.nome || "";
      const n = String(nome).toLowerCase();
      if (n.includes('unidade') || n.includes('privativa') || n.includes('unidades privativa') || n.includes('unidade privativa')) return 1;
      if (n.includes('area comum') || n.includes('área comum') || n.includes('area_comum') || n.includes('comum')) return 2;
      if (n.includes('marca') || n.includes('marcas')) return 3;
      return 99;
    };

    return [...topicos].sort((a, b) => {
      const oa = orderKey(a as TopicoEntry);
      const ob = orderKey(b as TopicoEntry);
      if (oa !== ob) return oa - ob;
      const pa = (a as TopicoEntry).posicao ?? 0;
      const pb = (b as TopicoEntry).posicao ?? 0;
      return pa - pb;
    }) as TopicoEntry[];
  };

  return (
    <div className="pt-[60px] sm:pt-[70px]">
      <Header />
      <Toast ref={toast} />
      <Popup />

      <div className="p-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-4 px-6">
          <label className="block mb-0 text-xl font-medium">Comparação de Versões</label>
          
          <Dropdown
            value={selectedTitulo}
            options={titulos}
            onChange={handleChangeEmpreendimento}
            optionLabel="name"
            placeholder="Selecione um empreendimento"
            filter
            emptyMessage="Nenhuma opção disponível"
            emptyFilterMessage="Nenhum resultado encontrado"
            className="w-full"
          />

          {selectedTitulo && (
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Empreendimento: <strong>{selectedTitulo.name}</strong></p>
                <p className="text-sm text-gray-600">Versão atual: <strong>{selectedTitulo.versao}</strong></p>
              </div>
              
              <div className="flex-1 w-full">
                <p className="text-sm text-gray-600 mb-2">Comparar com:</p>
                <Dropdown
                  value={selectedVersao}
                  options={
                    versoes
                      .filter((v) => v !== (dadosVersaoAtual?.versao ?? selectedTitulo?.versao))
                      .map((v) => ({ label: `Versão ${v}`, value: v }))
                  }
                  onChange={handleChangeVersao}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecione a versão..."
                  className="w-full"
                  disabled={!selectedTitulo}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          {loadingAtual ? (
            <p className="flex justify-center">Carregando versão atual...</p>
          ) : dadosVersaoAtual ? (
            (() => {
              const versaoAtualCorreta = getDadosVersao(dadosVersaoAtual);
              const versaoComparadaCorreta = getDadosVersao(dadosVersaoComparada);
              
              return (
            <div className="max-w-7xl mx-auto px-6">
              <div className="lg:h-[70vh] lg:overflow-auto p-4 border rounded bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Versão Atual (Esquerda) */}
              <article className="p-6 border rounded bg-white h-[60vh] overflow-auto lg:h-auto lg:overflow-visible">
                <header className="mb-4 pb-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">Versão {versaoAtualCorreta?.versao} (Atual)</h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">Atual</span>
                  </div>
                  <p className="text-sm text-gray-600">Alterado por: {versaoAtualCorreta?.usuarioAlteracao}</p>
                  <p className="text-sm text-gray-600">Data: {formatarData(versaoAtualCorreta?.dataHoraAlteracao || '')}</p>
                </header>

                <section className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">{versaoAtualCorreta?.nome}</h3>
                  <div className="text-sm space-y-2">
                    <div><strong>Localização:</strong> {versaoAtualCorreta?.localizacao || '-'}</div>
                    <div><strong>Descrição:</strong> {versaoAtualCorreta?.descricao || '-'}</div>
                    <div><strong>Padrão:</strong> {versaoAtualCorreta?.padrao || '-'}</div>
                    <div><strong>Status:</strong> {versaoAtualCorreta?.status || '-'}</div>
                  </div>
                </section>

                {/* Tópicos */}
                {dadosVersaoAtual.empreendimentoTopicos && dadosVersaoAtual.empreendimentoTopicos.length > 0 && (
                  <section className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Tópicos</h3>
                    {sortTopicos(dadosVersaoAtual?.empreendimentoTopicos ?? []).map((topico, idx) => {
                      return (
                        <section key={topico.id || idx} className="mb-4">
                          <h4 className="font-bold text-base uppercase mb-1">{topicosMap[topico.topicoId ?? 0]?.nome || topico.topico?.nome || `Tópico ${topico.topicoId}`}</h4>
                          {topicosMap[topico.topicoId ?? 0]?.descricao || topico.topico?.descricao ? (
                            <p className="text-sm text-gray-600 mb-2">{topicosMap[topico.topicoId ?? 0]?.descricao || topico.topico?.descricao}</p>
                          ) : null}

                          {/* Ambientes */}
                          {topico.topicoAmbientes && topico.topicoAmbientes.length > 0 && (
                          <div className="mt-2">
                            {topico.topicoAmbientes.map((amb) => (
                              <div key={amb.id} className="mb-3 bg-gray-100 md:bg-transparent p-3 md:p-0 rounded">
                                <h5 className="font-semibold text-sm bg-gray-200 md:bg-gray-200 px-2 py-1 rounded mb-2">
                                  {ambientesMap[amb.ambienteId ?? 0]?.nome || amb.ambiente?.nome || `Ambiente ${amb.ambienteId}`}
                                </h5>
                                {amb.ambienteItens && amb.ambienteItens.length > 0 ? (
                                  <div className="overflow-x-auto px-3 md:px-0">
                                    <table className="w-full text-sm border-collapse">
                                      <thead className="hidden md:table-header-group">
                                        <tr className="bg-gray-100 md:border-b md:border-gray-300">
                                          <th className="px-3 py-2 text-left w-1/3">Item</th>
                                          <th className="px-3 py-2 text-left w-2/3">Descrição</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {amb.ambienteItens.map((item) => (
                                          <tr
                                            key={item.id}
                                            className="block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-300 md:border-b md:border-gray-300 bg-white md:bg-transparent hover:bg-gray-50"
                                          >
                                            <td className="block md:table-cell px-3 py-2 align-top md:pl-3">
                                              <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Item:</span>
                                              <span className="block">{itemsMap[item.itemId ?? 0]?.nome || item.item?.nome || `Item #${item.itemId}`}</span>
                                            </td>
                                            <td className="block md:table-cell px-3 py-2">
                                              <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Descrição:</span>
                                              <span className="block">{itemsMap[item.itemId ?? 0]?.descricao || item.item?.descricao || '-'}</span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Nenhum item cadastrado neste ambiente.</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Materiais */}
                        {topico.topicoMateriais && topico.topicoMateriais.length > 0 && (
                          <div className="mt-3">
                            <div className="bg-gray-100 md:bg-transparent p-3 md:p-0 rounded">
                              <h5 className="font-semibold text-sm">Materiais</h5>
                              <div className="overflow-x-auto px-3 md:px-0">
                                <table className="w-full text-sm border-collapse mt-2">
                                  <thead className="hidden md:table-header-group">
                                    <tr className="bg-gray-100 md:border-b md:border-gray-300">
                                      <th className="px-3 py-2 text-left w-1/3">Material</th>
                                      <th className="px-3 py-2 text-left w-2/3">Marcas</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {topico.topicoMateriais.map((mat) => (
                                      <tr
                                        key={mat.id}
                                        className="block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-200 bg-white md:bg-transparent md:border-b md:border-gray-300 hover:bg-gray-50"
                                      >
                                        <td className="block md:table-cell px-3 py-2">
                                          <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Material:</span>
                                          <span className="block">{materialNamesMap[mat.materialId ?? 0] || mat.material?.nome || `Material #${mat.materialId}`}</span>
                                        </td>
                                        <td className="block md:table-cell px-3 py-2">
                                          <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Marcas:</span>
                                          <span className="block">{marcasMap[mat.materialId ?? 0]?.join(', ') || '-'}</span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}
                      </section>
                      );
                    })}
                  </section>
                )}
              </article>

              {/* Versão Comparada (Direita) */}
              {loadingComparada ? (
                <div className="flex items-center justify-center p-6 border rounded bg-white">
                  <p>Carregando versão para comparação...</p>
                </div>
              ) : dadosVersaoComparada ? (
                <article className="p-6 border rounded bg-white h-[60vh] overflow-auto lg:h-auto lg:overflow-visible">
                  <header className="mb-4 pb-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold">Versão {versaoComparadaCorreta?.versao}</h2>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">Comparada</span>
                    </div>
                    <p className="text-sm text-gray-600">Alterado por: {versaoComparadaCorreta?.usuarioAlteracao}</p>
                    <p className="text-sm text-gray-600">Data: {formatarData(versaoComparadaCorreta?.dataHoraAlteracao || '')}</p>
                  </header>

                  <section className="mb-4">
                    <h3 className={`font-semibold text-lg mb-2 ${versaoAtualCorreta?.nome !== versaoComparadaCorreta?.nome ? 'bg-yellow-100 p-2 rounded' : ''}`}>
                      {versaoComparadaCorreta?.nome}
                    </h3>
                    <div className="text-sm space-y-2">
                      <div className={versaoAtualCorreta?.localizacao !== versaoComparadaCorreta?.localizacao ? 'bg-yellow-100 p-2 rounded' : ''}>
                        <strong>Localização:</strong> {versaoComparadaCorreta?.localizacao || '-'}
                      </div>
                      <div className={versaoAtualCorreta?.descricao !== versaoComparadaCorreta?.descricao ? 'bg-yellow-100 p-2 rounded' : ''}>
                        <strong>Descrição:</strong> {versaoComparadaCorreta?.descricao || '-'}
                      </div>
                      <div className={versaoAtualCorreta?.padrao !== versaoComparadaCorreta?.padrao ? 'bg-yellow-100 p-2 rounded' : ''}>
                        <strong>Padrão:</strong> {versaoComparadaCorreta?.padrao || '-'}
                      </div>
                      <div className={versaoAtualCorreta?.status !== versaoComparadaCorreta?.status ? 'bg-yellow-100 p-2 rounded' : ''}>
                        <strong>Status:</strong> {versaoComparadaCorreta?.status || '-'}
                      </div>
                    </div>
                  </section>

                  {/* Tópicos */}
                  {dadosVersaoComparada.empreendimentoTopicos && dadosVersaoComparada.empreendimentoTopicos.length > 0 && (
                    <section className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Tópicos</h3>
                      {sortTopicos(dadosVersaoComparada?.empreendimentoTopicos ?? []).map((topico, idx) => {
                        return (
                          <section key={topico.id || idx} className="mb-4">
                            <h4 className="font-bold text-base uppercase mb-1">{topicosMap[topico.topicoId ?? 0]?.nome || topico.topico?.nome || `Tópico ${topico.topicoId}`}</h4>
                            {topicosMap[topico.topicoId ?? 0]?.descricao || topico.topico?.descricao ? (
                              <p className="text-sm text-gray-600 mb-2 bg-yellow-100 p-2 rounded">{topicosMap[topico.topicoId ?? 0]?.descricao || topico.topico?.descricao}</p>
                            ) : null}

                            {/* Ambientes */}
                            {topico.topicoAmbientes && topico.topicoAmbientes.length > 0 && (
                            <div className="mt-2">
                              {topico.topicoAmbientes.map((amb) => (
                                <div key={amb.id} className="mb-3 bg-yellow-50 md:bg-yellow-50 p-3 md:p-3 rounded border border-yellow-200">
                                  <h5 className="font-semibold text-sm bg-yellow-200 md:bg-yellow-200 px-2 py-1 rounded mb-2">
                                    {ambientesMap[amb.ambienteId ?? 0]?.nome || amb.ambiente?.nome || `Ambiente ${amb.ambienteId}`}
                                  </h5>
                                  {amb.ambienteItens && amb.ambienteItens.length > 0 ? (
                                    <div className="overflow-x-auto px-3 md:px-0">
                                      <table className="w-full text-sm border-collapse">
                                        <thead className="hidden md:table-header-group">
                                          <tr className="bg-yellow-100 md:border-b md:border-yellow-300">
                                            <th className="px-3 py-2 text-left w-1/3">Item</th>
                                            <th className="px-3 py-2 text-left w-2/3">Descrição</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {amb.ambienteItens.map((item) => (
                                            <tr
                                              key={item.id}
                                              className="block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-yellow-300 md:border-b md:border-yellow-300 bg-yellow-50 md:bg-yellow-50 hover:bg-yellow-100"
                                            >
                                              <td className="block md:table-cell px-3 py-2 align-top md:pl-3">
                                                <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Item:</span>
                                                <span className="block">{itemsMap[item.itemId ?? 0]?.nome || item.item?.nome || `Item #${item.itemId}`}</span>
                                              </td>
                                              <td className="block md:table-cell px-3 py-2">
                                                <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Descrição:</span>
                                                <span className="block">{itemsMap[item.itemId ?? 0]?.descricao || item.item?.descricao || '-'}</span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">Nenhum item cadastrado neste ambiente.</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Materiais */}
                          {topico.topicoMateriais && topico.topicoMateriais.length > 0 && (
                            <div className="mt-3">
                              <div className="bg-yellow-50 md:bg-yellow-50 p-3 md:p-3 rounded border border-yellow-200">
                                <h5 className="font-semibold text-sm">Materiais</h5>
                                <div className="overflow-x-auto px-3 md:px-0">
                                  <table className="w-full text-sm border-collapse mt-2">
                                    <thead className="hidden md:table-header-group">
                                      <tr className="bg-yellow-100 md:border-b md:border-yellow-300">
                                        <th className="px-3 py-2 text-left w-1/3">Material</th>
                                        <th className="px-3 py-2 text-left w-2/3">Marcas</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {topico.topicoMateriais.map((mat) => (
                                        <tr
                                          key={mat.id}
                                          className="block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-yellow-200 bg-yellow-50 md:bg-yellow-50 md:border-b md:border-yellow-300 hover:bg-yellow-100"
                                        >
                                          <td className="block md:table-cell px-3 py-2">
                                            <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Material:</span>
                                            <span className="block">{materialNamesMap[mat.materialId ?? 0] || mat.material?.nome || `Material #${mat.materialId}`}</span>
                                          </td>
                                          <td className="block md:table-cell px-3 py-2">
                                            <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Marcas:</span>
                                            <span className="block">{marcasMap[mat.materialId ?? 0]?.join(', ') || '-'}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </section>
                        );
                      })}
                    </section>
                  )}
                </article>
              ) : selectedVersao ? (
                <div className="flex items-center justify-center p-6 border rounded bg-gray-50">
                  <p className="text-gray-500">Selecione uma versão para comparar</p>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 border rounded bg-gray-50">
                  <p className="text-gray-500">Selecione uma versão para comparar</p>
                </div>
              )}
                </div>
              </div>
            </div>
              );
            })()
          ) : null}
        </div>

        {dadosVersaoComparada && (
          <div className="mt-6 max-w-7xl mx-auto px-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> Os campos destacados em amarelo na versão comparada indicam diferenças em relação à versão atual.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}