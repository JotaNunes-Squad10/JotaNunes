'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from 'react-dom';
import Header from "../headerUser/page";
import CommentBox from '../docCorrecao/CommentBox';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { empreendimentoService, Empreendimento, itemService, ambienteService, topicoService, marcaMaterialService } from '../../lib/services';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function DocRevisao() {
    const [options, setOptions] = useState<Array<{ label: string; value: Empreendimento }>>([]);
    const [selected, setSelected] = useState<Empreendimento | null>(null);
    const [detalhe, setDetalhe] = useState<Empreendimento | null>(null);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);
    const [itemsMap, setItemsMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
    const [ambientesMap, setAmbientesMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
    const [topicosMap, setTopicosMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
    const [marcasMap, setMarcasMap] = useState<Record<number, string[]>>({});
    const [materialNamesMap, setMaterialNamesMap] = useState<Record<number, string>>({});
    const [commentsMap, setCommentsMap] = useState<Record<string, { text: string; createdAt: string }>>({});
    const [selectedCommentKey, setSelectedCommentKey] = useState<string | null>(null);
    const [commentBoxPos, setCommentBoxPos] = useState<{ top: number; left: number } | null>(null);

    const statusOptions: Array<{ label: string; value: string; color: string }> = [
        { label: 'Revisao', value: 'Revisao', color: '#FF9800' },
        { label: 'Aprovado', value: 'Aprovado', color: '#4CAF50' },
        { label: 'Cancelado', value: 'Cancelado', color: '#F44336' },
    ];

    const [selectedStatus, setSelectedStatus] = useState<string>('Pendente');
    const [showStatusMenu, setShowStatusMenu] = useState<boolean>(false);
    const statusMenuRef = useRef<HTMLDivElement | null>(null);
    const [savingStatus, setSavingStatus] = useState<boolean>(false);
    const [statusError, setStatusError] = useState<string | null>(null);
    const toast = useRef<Toast | null>(null);
    const router = useRouter();
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    useEffect(() => {
        setSelectedStatus(detalhe?.status ?? 'Pendente');
    }, [detalhe?.status]);

    useEffect(() => {
        if (!showStatusMenu) return;
        const onDocClick = (ev: MouseEvent) => {
            const target = ev.target as Node;
            if (statusMenuRef.current && !statusMenuRef.current.contains(target)) {
                setShowStatusMenu(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showStatusMenu]);

    const getTopicoPriority = (name?: string) => {
        if (!name) return 99;
        const n = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (n.includes('area comum') || n.includes('área comum')) return 1;
        if (n.includes('unidades privativas') || n.includes('unidade privativa')) return 2;
        if (n.includes('marca') || n.includes('marcas') || n.includes('material') || n.includes('materiais')) return 3;
        return 99;
    };

    const compareTopicos = useCallback((a: { topicoId?: number; id?: number }, b: { topicoId?: number; id?: number }, nameMap: Record<number, { nome?: string }> = topicosMap) => {
        const aName = String(nameMap[a.topicoId ?? 0]?.nome ?? a.topicoId ?? a.id ?? '');
        const bName = String(nameMap[b.topicoId ?? 0]?.nome ?? b.topicoId ?? b.id ?? '');
        const pa = getTopicoPriority(aName);
        const pb = getTopicoPriority(bName);
        if (pa !== pb) return pa - pb;
        return aName.localeCompare(bName, 'pt-BR', { sensitivity: 'base' });
    }, [topicosMap]);

    const getColorForStatus = (s: string) => {
        const found = statusOptions.find((o) => o.value === s || o.label === s);
        return found ? found.color : '#FFD966';
    };

    const hexToRgb = (hex: string) => {
        const h = hex.replace('#', '');
        const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    };

    const getTextColorForBg = (hex: string) => {
        try {
            const { r, g, b } = hexToRgb(hex);
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            return luminance > 0.6 ? '#000000' : '#ffffff';
        } catch {
            return '#000000';
        }
    };

    const mapStatusToNumber = (s: string) => {
        const normalized = (s || '').toLowerCase().trim();
        if (normalized === 'aprovado' || normalized === 'aprovados') return 1;
        if (normalized === 'revisao' || normalized === 'em revisão' || normalized === 'em revisao' || normalized === 'revisão') return 2;
        if (normalized === 'pendente') return 3;
        if (normalized === 'cancelado') return 5;
        return 3;
    };

    const handleSelectStatus = async (status: string) => {
        setShowStatusMenu(false);
        setStatusError(null);
        setSavingStatus(true);
        try {
            await empreendimentoService.updateStatus(detalhe?.id ?? selected?.id ?? '', mapStatusToNumber(status));

            setSelectedStatus(status);
            setDetalhe((prev) => {
                if (!prev) return prev;
                return { ...prev, status } as Empreendimento;
            });

            toast.current?.show({ severity: 'success', summary: 'Status atualizado', detail: `Status alterado para ${status}`, life: 3000 });

            const updatedId = detalhe?.id ?? selected?.id;
            if (updatedId) {
                setOptions((prev) => prev.filter((o) => String(o.value?.id) !== String(updatedId)));
            }

            setSelected(null);
            setDetalhe(null);
            setCommentsMap({});

            try { router.refresh(); } catch {}
        } catch {
            const errorMsg = 'Erro ao atualizar status';
            setStatusError(errorMsg);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: errorMsg, life: 3000 });
        } finally {
            setSavingStatus(false);
        }
    };

    const applyPendingStatus = async () => {
        if (!pendingStatus) {
            setShowConfirmModal(false);
            return;
        }
        await handleSelectStatus(pendingStatus);
        setPendingStatus(null);
        setShowConfirmModal(false);
    };

    const cancelPendingStatus = () => {
        setPendingStatus(null);
        setShowConfirmModal(false);
    };

    useEffect(() => {

        const storedId = sessionStorage.getItem("empreendimentoSelecionado");
            if (storedId) {
                setLoadingDetalhe(true);
            }

        (async () => {
            try {
                const data = await empreendimentoService.getAllEmpreendimentos();
                const filtered = data.filter((e) => e.status === 'Pendente');
                const mapped = filtered.map((e) => ({ label: e.nome || e.name || e.descricao || String(e.id), value: e }));
                mapped.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
                setOptions(mapped);
            } catch {

                toast.current?.show({
                severity: 'error',
                summary: 'Erro ao carregar',
                detail: 'Não foi possível carregar os empreendimentos.',
                life: 2000
            });
                if (storedId) {
                setLoadingDetalhe(false);
                sessionStorage.removeItem("empreendimentoSelecionado");
                }
            }
        })();
    }, []);

    useEffect(() => {
        if (options.length === 0) return; // ainda não carregou

        const storedId = sessionStorage.getItem("empreendimentoSelecionado");
        if (!storedId) return;

        const emp = options.find(e => String(e.value.id) === String(storedId));
        if (!emp) return;

        // Remove para não repetir
        sessionStorage.removeItem("empreendimentoSelecionado");

        setSelected(emp.value);

        empreendimentoService
            .getEmpreendimentoById(String(emp.value.id))
            .then((resp) => {
                if (resp) {
                    setDetalhe(resp);
                    fetchItemsNames(resp);
                    fetchAuxNames(resp);
                }
            })
            .finally(() => setLoadingDetalhe(false));

    }, [options]);

    useEffect(() => {
        if (!detalhe || !detalhe.empreendimentoTopicos || Object.keys(topicosMap).length === 0) return;
        try {
            const current = detalhe.empreendimentoTopicos;
            const sorted = [...current].sort((a, b) => compareTopicos(a, b));
            const sameOrder = current.length === sorted.length && current.every((c, idx) => Number(c.topicoId ?? c.id) === Number(sorted[idx].topicoId ?? sorted[idx].id));
            if (!sameOrder) {
                setDetalhe((prev) => {
                    if (!prev) return prev;
                    return { ...prev, empreendimentoTopicos: sorted } as Empreendimento;
                });
            }
        } catch {}
    }, [topicosMap, detalhe, compareTopicos]);

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
        } catch {
        }
    };

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

            if (materialIds.size > 0) {
                const matPromises = Array.from(materialIds).map((id) => marcaMaterialService.getAllMarcasByMaterialId(id));
                const matResults = await Promise.allSettled(matPromises);
                const mMap: Record<number, string[]> = {};
                const materialNameMap: Record<number, string> = {};
                matResults.forEach((r, idx) => {
                    const id = Array.from(materialIds)[idx];
                    if (r.status === 'fulfilled' && r.value) {
                        const val = r.value as unknown;
                        if (val) {
                            if (Array.isArray(val)) {
                                mMap[id] = val.map(String);
                            } else if (typeof val === 'object' && val !== null) {
                                const maybe = val as { marcas?: unknown; material?: unknown };
                                if (Array.isArray(maybe.marcas)) {
                                    mMap[id] = maybe.marcas.map(String);
                                    if (maybe.material) materialNameMap[id] = String(maybe.material);
                                } else {
                                    mMap[id] = [];
                                }
                            } else {
                                mMap[id] = [];
                            }
                        }
                    }
                });
                setMarcasMap(mMap);
                setMaterialNamesMap(materialNameMap);
            }
        } catch {
        }
    };

    const handleOpenComment = (e: React.MouseEvent, key: string) => {
        e.stopPropagation();
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const padding = 8;
        let left = rect.right + padding;

        const ESTIMATED_BOX_WIDTH = 320;
        const ESTIMATED_BOX_HEIGHT = 220; 
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (left + ESTIMATED_BOX_WIDTH > viewportWidth) {
            left = Math.max(rect.left - ESTIMATED_BOX_WIDTH - padding, padding);
        } else {
            const gap = left - rect.left;
            if (gap > ESTIMATED_BOX_WIDTH * 0.4) {
                left = Math.max(rect.right - Math.round(ESTIMATED_BOX_WIDTH * 0.6), padding);
            }
        }

        let top: number;
        const spaceBelow = viewportHeight - rect.bottom;
        if (spaceBelow >= ESTIMATED_BOX_HEIGHT + padding) {
            top = rect.bottom + padding;
        } else if (rect.top >= ESTIMATED_BOX_HEIGHT + padding) {
            top = rect.top - ESTIMATED_BOX_HEIGHT - padding;
        } else {
            top = Math.max(padding, Math.min(rect.top, viewportHeight - ESTIMATED_BOX_HEIGHT - padding));
        }

        setSelectedCommentKey(key);
        setCommentBoxPos({ top, left });
    };
    const handleSaveComment = async (comment: string, itemKey: string) => {
        try {
            // Extrair itemId do itemKey
            // itemKey formato: "item:123" ou "material:456"
            const parts = itemKey.split(':');
            if (parts.length !== 2) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Formato de chave inválido', life: 3000 });
                return;
            }
            
            const idStr = parts[1];
            const itemId = parseInt(idStr);
            
            if (isNaN(itemId)) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'ID inválido', life: 3000 });
                return;
            }
            
            const statusId = mapStatusToNumber(selectedStatus);
            
            // Salvar comentário via API
            await itemService.setItemComentario(itemId, statusId, comment.trim());
            
            // Atualizar o mapa local
            if (!comment || comment.trim() === '') {
                setCommentsMap((prev) => {
                    const copy = { ...prev };
                    delete copy[itemKey];
                    return copy;
                });
            } else {
                const next = { ...commentsMap, [itemKey]: { text: comment.trim(), createdAt: new Date().toISOString() } };
                setCommentsMap(next);
            }
            
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Comentário salvo com sucesso', life: 3000 });
        } catch (err) {
            console.error('Erro ao salvar comentário:', err);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar comentário', life: 3000 });
        }
        setSelectedCommentKey(null);
        setCommentBoxPos(null);
    };

    const handleDeleteComment = async (itemKey: string) => {
        try {
            const parts = itemKey.split(':');
            if (parts.length !== 2) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Formato de chave inválido', life: 3000 });
                return;
            }
            
            const idStr = parts[1];
            const itemId = parseInt(idStr);
            
            if (isNaN(itemId)) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'ID inválido', life: 3000 });
                return;
            }
            
            const statusId = mapStatusToNumber(selectedStatus);
            
            // Deletar comentário enviando string vazia para a API
            await itemService.setItemComentario(itemId, statusId, '');
            
            setCommentsMap((prev) => {
                const copy = { ...prev };
                delete copy[itemKey];
                return copy;
            });
            
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Comentário removido', life: 3000 });
        } catch (err) {
            console.error('Erro ao deletar comentário:', err);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover comentário', life: 3000 });
        }
        setSelectedCommentKey(null);
        setCommentBoxPos(null);
    };

    useEffect(() => {
        try {
            if (!detalhe?.id) { 
                setCommentsMap({}); 
                return; 
            }
            
            // Carregar comentários da estrutura revisaoItem retornada pela API
            const newCommentsMap: Record<string, { text: string; createdAt: string }> = {};
            
            detalhe.empreendimentoTopicos?.forEach((topico) => {
                topico.topicoAmbientes?.forEach((ambiente) => {
                    ambiente.ambienteItens?.forEach((item) => {
                        // revisaoItem agora é um objeto, não array
                        if (item.revisaoItem && item.revisaoItem.observacao) {
                            const itemKey = `item:${item.id}`;
                            newCommentsMap[itemKey] = {
                                text: item.revisaoItem.observacao,
                                createdAt: new Date().toISOString() // A API não retorna data, usar data atual
                            };
                        }
                    });
                });
                
                // Carregar comentários dos materiais
                topico.topicoMateriais?.forEach((material) => {
                    if (material.revisaoMaterial && material.revisaoMaterial.observacao) {
                        const materialKey = `material:${material.materialId ?? material.id ?? 0}`;
                        newCommentsMap[materialKey] = {
                            text: material.revisaoMaterial.observacao,
                            createdAt: new Date().toISOString()
                        };
                    }
                });
            });
            
            setCommentsMap(newCommentsMap);
        } catch (err) {
            console.error('Erro ao carregar comentários:', err);
            setCommentsMap({});
        }
    }, [detalhe?.id, detalhe?.empreendimentoTopicos]);

    const handleCloseComment = () => {
        setSelectedCommentKey(null);
        setCommentBoxPos(null);
    };

    const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
    useEffect(() => {
        const el = document.createElement('div');
        el.setAttribute('id', 'docRevisao-comment-portal');
        document.body.appendChild(el);
        setPortalEl(el);
        return () => {
            try { document.body.removeChild(el); } catch {}
            setPortalEl(null);
        };
    }, []);

    return (
        <div>
            <Header />
            <Toast ref={toast} />
            <div className="p-4">
                <div className="max-w-4xl mx-auto flex flex-col items-center md:items-start gap-3 px-6">
                    <label className="block mb-0 text-xl font-medium text-center md:text-left">Revisão de Empreendimento</label>
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
                                fetchItemsNames(resp);
                                fetchAuxNames(resp);
                            } else {
                                setErroDetalhe('Não foi possível obter os dados do empreendimento.');
                            }
                        } catch {
                            setErroDetalhe('Erro ao buscar detalhe do empreendimento');
                        } finally {
                            setLoadingDetalhe(false);
                        }
                    }}
                        options={options}
                        optionLabel="label"
                        filter
                        emptyMessage="Nenhuma opção disponível"
                        emptyFilterMessage="Nenhum resultado encontrado"
                        placeholder="Selecione um empreendimento"
                        className="w-full md:w-[54.5rem]"
                    />
                </div>
                {/* Botão de status alinhado à direita */}
                <div className="mt-2 max-w-4xl mx-auto px-6">
                    <div className="w-full">
                        <div className="md:fixed md:left-1/2 md:-translate-x-1/2 md:transform w-full max-w-4xl md:top-20 md:z-50 py-0">
                            <div className="max-w-4xl mx-auto px-0 flex justify-end">
                                {detalhe && (
                                    <div className="relative w-full sm:w-40">
                                        <button
                                            type="button"
                                            onClick={() => setShowStatusMenu((s) => !s)}
                                            className="w-full px-3 py-1 rounded font-semibold border text-center"
                                            style={{
                                                backgroundColor: getColorForStatus(detalhe?.status ?? selectedStatus),
                                                color: getTextColorForBg(getColorForStatus(detalhe?.status ?? selectedStatus)),
                                                borderColor: 'rgba(0,0,0,0.08)'
                                            }}
                                            disabled={savingStatus}
                                        >
                                            {savingStatus ? (
                                                <>
                                                    <i className="pi pi-spin pi-spinner mr-2" />
                                                    Atualizando
                                                </>
                                            ) : (detalhe?.status ?? selectedStatus)}
                                        </button>

                                        {showStatusMenu && (
                                            <div ref={statusMenuRef} className="absolute right-0 mt-2 w-44 bg-white border rounded shadow z-50">
                                                {statusOptions.map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => {
                                                            setPendingStatus(opt.value);
                                                            setShowStatusMenu(false);
                                                            setShowConfirmModal(true);
                                                        }}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-3"
                                                    >
                                                        <span style={{ width: 12, height: 12, backgroundColor: opt.color, borderRadius: 4, display: 'inline-block' }} />
                                                        <span className="flex-1">{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {statusError && (
                    <div className="max-w-4xl mx-auto px-6 mt-2">
                        <p className="text-sm text-red-600">{statusError}</p>
                    </div>
                )}
                <div className="h-0 md:h-0" />
                <div className="mt-4">
                    {loadingDetalhe ? (
                        <p className="flex justify-center">Carregando detalhes do empreendimento...</p>
                    ) : erroDetalhe ? (
                        <p className="text-red-600">{erroDetalhe}</p>
                    ) : detalhe ? (
                        <article className="p-6 border rounded bg-white max-w-4xl mx-auto">
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

                            {/* Tópicos -> Ambientes -> Itens: formatamos como seções com tabelas (Item | Versões) */}
                            {detalhe.empreendimentoTopicos && detalhe.empreendimentoTopicos.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-semibold mb-2">Tópicos</h3>
                                    {detalhe.empreendimentoTopicos.map((topico, idx) => (
                                        <section key={topico.id ?? idx} className="mb-4">
                                            <h4 className="font-semibold">{topicosMap[topico.topicoId ?? 0]?.nome || `Tópico ${topico.topicoId ?? topico.id}`}</h4>

                                            {/* Ambientes */}
                                            {topico.topicoAmbientes && topico.topicoAmbientes.length > 0 && (
                                                <div className="mt-2">
                                                    {topico.topicoAmbientes.map((amb) => (
                                                        <div key={amb.id} className="mb-3 bg-gray-100 md:bg-transparent p-3 md:p-0 rounded">
                                                            <h5 className="font-medium bg-gray-300 md:bg-transparent px-2 py-1 rounded">{ambientesMap[amb.ambienteId ?? 0]?.nome || `Ambiente ${amb.ambienteId ?? amb.id}`}</h5>
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
                                                                                onClick={(e) => handleOpenComment(e, `item:${item.id ?? 0}`)}
                                                                                title={commentsMap[`item:${item.id ?? 0}`]?.text ?? ''}
                                                                                className={
                                                                                    `block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-300 md:border-b md:border-gray-300 cursor-pointer transition-colors duration-150 ease-in-out ` +
                                                                                    (commentsMap[`item:${item.id ?? 0}`]
                                                                                        ? 'bg-yellow-50 md:bg-gradient-to-r md:from-yellow-200 md:to-orange-100 md:hover:opacity-95 hover:opacity-95'
                                                                                        : 'bg-white md:bg-transparent hover:bg-gray-50')
                                                                                }
                                                                            >
                                                                                <td className="block md:table-cell px-3 py-2 align-top md:pl-3">
                                                                                    <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Item:</span>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="block">{itemsMap[item.itemId ?? 0]?.nome ? itemsMap[item.itemId ?? 0].nome : `Item #${item.itemId}`}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="block md:table-cell px-3 py-2">
                                                                                    <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Descrição:</span>
                                                                                    <span className="block">{itemsMap[item.itemId ?? 0]?.descricao || '-'}</span>
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
                                                <div className="mt-2 bg-gray-100 md:bg-transparent p-3 md:p-0 rounded">
                                                    <h5 className="font-medium">Materiais</h5>
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
                                                                    onClick={(e) => handleOpenComment(e, `material:${mat.materialId ?? mat.id ?? 0}`)}
                                                                    title={commentsMap[`material:${mat.materialId ?? mat.id ?? 0}`]?.text ?? ''}
                                                                    className={
                                                                        `block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-200 bg-white md:bg-transparent md:border-b md:border-gray-300 cursor-pointer transition-colors duration-150 ease-in-out ` +
                                                                        (commentsMap[`material:${mat.materialId ?? mat.id ?? 0}`]
                                                                            ? 'bg-yellow-50 md:bg-gradient-to-r md:from-yellow-200 md:to-orange-100 md:hover:opacity-95 hover:opacity-95'
                                                                            : 'bg-white md:bg-transparent hover:bg-gray-50')
                                                                    }
                                                                >
                                                                    <td className="block md:table-cell px-3 py-2">
                                                                        <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Material:</span>
                                                                        <span className="block">{materialNamesMap[mat.materialId ?? 0] || `Material #${mat.materialId}`}</span>
                                                                    </td>
                                                                    <td className="block md:table-cell px-3 py-2">
                                                                        <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Marcas:</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="block">{marcasMap[mat.materialId ?? 0]?.join(', ') || '-'}</span>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    </div>
                                                </div>
                                            )}
                                        </section>
                                    ))}
                                </section>
                            )}
                                {/* Caixa flutuante de comentário (fixa, posicionada) */}
                                {selectedCommentKey !== null && commentBoxPos && portalEl && createPortal(
                                    <CommentBox
                                        position={commentBoxPos}
                                        initialComment={commentsMap[selectedCommentKey]?.text ?? ''}
                                        onSave={(comment) => handleSaveComment(comment, selectedCommentKey)}
                                        onDelete={() => handleDeleteComment(selectedCommentKey)}
                                        onClose={handleCloseComment}
                                        hasExistingComment={!!commentsMap[selectedCommentKey]}
                                    />,
                                    portalEl
                                )}
                        </article>
                    ) : null}
                </div>
                {/* Modal de confirmação de alteração de status (PrimeReact Dialog) */}
                <Dialog
                    header="Confirmar alteração de status"
                    visible={showConfirmModal}
                    style={{ width: '90%', maxWidth: '520px' }}
                    modal
                    onHide={cancelPendingStatus}
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button label="Cancelar" onClick={cancelPendingStatus} className="p-button-secondary" />
                            <Button
                                label={savingStatus ? 'Atualizando' : 'Confirmar'}
                                icon={savingStatus ? 'pi pi-spin pi-spinner' : undefined}
                                iconPos="left"
                                onClick={applyPendingStatus}
                                disabled={savingStatus}
                                className="p-button-danger"
                            />
                        </div>
                    }
                >
                    <div className="px-1 py-2 text-sm">
                        <p>
                            Deseja alterar o status do empreendimento <strong>{detalhe?.nome || selected?.nome || selected?.name || detalhe?.id}</strong> para <strong className="text-yellow-600">{pendingStatus}</strong>?
                        </p>
                    </div>
                </Dialog>
            </div>
        </div>
    );
}