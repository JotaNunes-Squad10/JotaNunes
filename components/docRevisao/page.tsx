'use client';

import React, { useEffect, useState } from "react";
import Header from "../../components/gerenciamentoUser/headerUser/page";
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { empreendimentoService, Empreendimento, itemService, ambienteService, topicoService, marcaMaterialService } from '../../lib/services';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function DocRevisao() {
    const [options, setOptions] = useState<Array<{ label: string; value: Empreendimento }>>([]);
    const [selected, setSelected] = useState<Empreendimento | null>(null);
    const [detalhe, setDetalhe] = useState<Empreendimento | null>(null);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);
    // Mapa de itemId -> dados do item (nome, descricao)
    const [itemsMap, setItemsMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
        // Mapa de ambienteId -> dados (nome, descricao)
        const [ambientesMap, setAmbientesMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
        // Mapa de topicoId -> dados (nome, descricao)
        const [topicosMap, setTopicosMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
        // Mapa materialId -> marcas (array de nomes)
        const [marcasMap, setMarcasMap] = useState<Record<number, string[]>>({});
        // Mapa materialId -> nome do material
        const [materialNamesMap, setMaterialNamesMap] = useState<Record<number, string>>({});

    useEffect(() => {
        const load = async () => {
            try {
                const data = await empreendimentoService.getAllEmpreendimentos();
                // Filtrar apenas empreendimentos com status "Pendente"
                const filtered = data.filter((e) => e.status === 'Pendente');
                const mapped = filtered.map((e) => ({
                    label: e.nome || e.name || e.descricao || String(e.id),
                    value: e,
                }));
                mapped.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
                setOptions(mapped);
            } catch (err) {
                console.error('Erro ao carregar empreendimentos', err);
            }
        };

        load();
    }, []);

    // Busca os nomes dos itens referenciados no detalhe (ambienteItens)
    const fetchItemsNames = async (d: Empreendimento) => {
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

            const promises = Array.from(ids).map((id) => itemService.getItemById(id));
            const results = await Promise.allSettled(promises);
            const map: Record<number, { nome?: string; descricao?: string }> = {};
            results.forEach((r, idx) => {
                const id = Array.from(ids)[idx];
                if (r.status === 'fulfilled' && r.value) {
                    map[id] = { nome: r.value.nome, descricao: r.value.descricao };
                }
            });
            setItemsMap(map);
        } catch (err) {
            console.error('Erro ao buscar nomes de items:', err);
        }
    };
    
    // Busca nomes de ambientes, tópicos e marcas (materiais)
    const fetchAuxNames = async (d: Empreendimento) => {
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

            // Topicos
            if (topicoIds.size > 0) {
                const topPromises = Array.from(topicoIds).map((id) => topicoService.getTopicoById(id));
                const topResults = await Promise.allSettled(topPromises);
                const tMap: Record<number, { nome?: string; descricao?: string }> = {};
                topResults.forEach((r, idx) => {
                    const id = Array.from(topicoIds)[idx];
                    if (r.status === 'fulfilled' && r.value) tMap[id] = { nome: r.value.nome, descricao: r.value.descricao };
                });
                setTopicosMap(tMap);
            }

            // Ambientes
            if (ambienteIds.size > 0) {
                const ambPromises = Array.from(ambienteIds).map((id) => ambienteService.getAmbienteById(id));
                const ambResults = await Promise.allSettled(ambPromises);
                const aMap: Record<number, { nome?: string; descricao?: string }> = {};
                ambResults.forEach((r, idx) => {
                    const id = Array.from(ambienteIds)[idx];
                    if (r.status === 'fulfilled' && r.value) aMap[id] = { nome: r.value.nome, descricao: r.value.descricao };
                });
                setAmbientesMap(aMap);
            }

            // Marcas por material
            if (materialIds.size > 0) {
                const matPromises = Array.from(materialIds).map((id) => marcaMaterialService.getAllMarcasByMaterialId(id));
                const matResults = await Promise.allSettled(matPromises);
                const mMap: Record<number, string[]> = {};
                const materialNameMap: Record<number, string> = {};
                matResults.forEach((r, idx) => {
                    const id = Array.from(materialIds)[idx];
                    if (r.status === 'fulfilled' && r.value) {
                        // r.value is MarcaMaterialResult | string[] | null depending on service
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const val: any = r.value;
                        if (val) {
                            if (Array.isArray(val)) {
                                mMap[id] = val as string[];
                            } else if (val.marcas && Array.isArray(val.marcas)) {
                                mMap[id] = val.marcas as string[];
                                if (val.material) materialNameMap[id] = String(val.material);
                            } else {
                                // fallback: try to map array-like
                                mMap[id] = Array.isArray(val) ? val.map(String) : [];
                            }
                        }
                    }
                });
                setMarcasMap(mMap);
                setMaterialNamesMap(materialNameMap);
            }
        } catch (err) {
            console.error('Erro ao buscar nomes auxiliares (topicos/ambientes/marcas):', err);
        }
    };

    return (
        <div>
            <Header />
            <div className="p-4">
                <label className="block mb-2 text-xl font-medium">Revisão de Empreendimento</label>
                <Dropdown
                    value={selected}
                    onChange={async (e: DropdownChangeEvent) => {
                        const emp = e.value as Empreendimento;
                        setSelected(emp);
                        setDetalhe(null);
                        setErroDetalhe(null);
                        if (!emp || !emp.id) return;
                        try {
                            setLoadingDetalhe(true);
                            const resp = await empreendimentoService.getEmpreendimentoById(emp.id as string | number);
                            if (resp) {
                                setDetalhe(resp);
                                // Buscar nomes dos itens referenciados (se houver)
                                fetchItemsNames(resp);
                                // Buscar nomes auxiliares: tópicos, ambientes e marcas
                                fetchAuxNames(resp);
                            } else {
                                setErroDetalhe('Não foi possível obter os dados do empreendimento.');
                            }
                        } catch (err) {
                            console.error('Erro ao buscar detalhe do empreendimento', err);
                            setErroDetalhe('Erro ao buscar detalhe do empreendimento');
                        } finally {
                            setLoadingDetalhe(false);
                        }
                    }}
                    options={options}
                    optionLabel="label"
                    filter
                    placeholder="Selecione um empreendimento"
                    className="w-150 md:w-20rem"
                />
                <div className="mt-4">
                    {loadingDetalhe ? (
                        <p>Carregando detalhes do empreendimento...</p>
                    ) : erroDetalhe ? (
                        <p className="text-red-600">{erroDetalhe}</p>
                    ) : detalhe ? (
                        <article className="p-6 border rounded bg-white">
                            {/* Cabeçalho similar ao PDF: nome, local, descrição */}
                            <header className="mb-4">
                                <h2 className="text-2xl font-bold">Empreendimento: {detalhe.nome || detalhe.name}</h2>
                                <p className="text-sm text-gray-600">Localização: {detalhe.localizacao || '-'}</p>
                                <div className="mt-3">
                                    <h3 className="font-semibold">Descrição</h3>
                                    <p className="text-justify">{detalhe.descricao || '-'}</p>
                                </div>
                            </header>

                            {/* Metadados simples */}
                            <section className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div><strong>Status:</strong> {detalhe.status || '-'}</div>
                                <div><strong>Padrão:</strong> {String(detalhe.padrao ?? '-')}</div>
                                <div><strong>Versão:</strong> {detalhe.versao ?? '-'}</div>
                            </section>

                            {/* Empreendimentos relacionados — apresentamos como lista compacta */}
                            {detalhe.empreendimentos && detalhe.empreendimentos.length > 0 && (
                                <section className="mb-4">
                                    <h3 className="text-lg font-semibold">Unidades / Empreendimentos</h3>
                                    <div className="mt-2 grid gap-3">
                                        {detalhe.empreendimentos.map((ep) => (
                                            <div key={String(ep.id)} className="p-3 border rounded bg-gray-50">
                                                <div className="flex justify-between">
                                                    <strong>{ep.nome || ep.name || `#${ep.id}`}</strong>
                                                    <span className="text-sm text-gray-600">Versão: {ep.versao ?? '-'}</span>
                                                </div>
                                                <p className="mt-1 text-sm">{ep.descricao || '-'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Tópicos -> Ambientes -> Itens: formatamos como seções com tabelas (Item | Versões) */}
                            {detalhe.empreendimentoTopicos && detalhe.empreendimentoTopicos.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-semibold mb-2">Tópicos</h3>
                                    {detalhe.empreendimentoTopicos.map((topico, idx) => (
                                        <section key={topico.id ?? idx} className="mb-4">
                                            <h4 className="font-semibold">{topicosMap[topico.topicoId ?? 0]?.nome || `Tópico ${topico.topicoId ?? topico.id}`}</h4>
                                            <p className="text-sm text-gray-600">Posição: {topico.posicao ?? '-' } — Versões: {Array.isArray(topico.versoes) ? topico.versoes.join(', ') : '-'}</p>

                                            {/* Ambientes */}
                                            {topico.topicoAmbientes && topico.topicoAmbientes.length > 0 && (
                                                <div className="mt-2">
                                                    {topico.topicoAmbientes.map((amb) => (
                                                        <div key={amb.id} className="mb-3">
                                                            <h5 className="font-medium">{ambientesMap[amb.ambienteId ?? 0]?.nome || `Ambiente ${amb.ambienteId ?? amb.id}`} — Versões: {Array.isArray(amb.versoes) ? amb.versoes.join(', ') : '-'}</h5>
                                                            {amb.ambienteItens && amb.ambienteItens.length > 0 ? (
                                                                <table className="w-full text-sm border-collapse border border-black">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="border border-black px-3 py-2 text-left bg-gray-100">Item</th>
                                                                            <th className="border border-black px-3 py-2 text-left bg-gray-100">Descrição</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {amb.ambienteItens.map((item) => (
                                                                            <tr key={item.id} className="align-top">
                                                                                <td className="border border-black px-3 py-2 align-top">
                                                                                    {itemsMap[item.itemId ?? 0]?.nome
                                                                                        ? itemsMap[item.itemId ?? 0].nome
                                                                                        : `Item #${item.itemId}`}
                                                                                </td>
                                                                                <td className="border border-black px-3 py-2">
                                                                                    {itemsMap[item.itemId ?? 0]?.descricao || '-'}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            ) : (
                                                                <p className="text-sm text-gray-500">Nenhum item cadastrado neste ambiente.</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Materiais */}
                                            {topico.topicoMateriais && topico.topicoMateriais.length > 0 && (
                                                <div className="mt-2">
                                                    <h5 className="font-medium">Materiais</h5>
                                                    <table className="w-full text-sm border-collapse border border-black">
                                                        <thead>
                                                            <tr>
                                                                <th className="border border-black px-3 py-2 text-left bg-gray-100">Material</th>
                                                                <th className="border border-black px-3 py-2 text-left bg-gray-100">Marcas</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topico.topicoMateriais.map((mat) => (
                                                                <tr key={mat.id}>
                                                                    <td className="border border-black px-3 py-2">{materialNamesMap[mat.materialId ?? 0] || `Material #${mat.materialId}`}</td>
                                                                    <td className="border border-black px-3 py-2">{marcasMap[mat.materialId ?? 0]?.join(', ') || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </section>
                                    ))}
                                </section>
                            )}
                        </article>
                    ) : null}
                </div>
            </div>
        </div>
    );
}