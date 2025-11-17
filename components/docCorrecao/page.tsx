'use client';

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from 'react-dom';
import Header from "../gerenciamentoUser/headerUser/page";
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { empreendimentoService, Empreendimento, itemService, Item, materialService, ambienteService, topicoService, marcaMaterialService } from '../../lib/services';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

export default function DocRevisao() {
    const [options, setOptions] = useState<Array<{ label: string; value: Empreendimento }>>([]);
    const [selected, setSelected] = useState<Empreendimento | null>(null);
    const [detalhe, setDetalhe] = useState<Empreendimento | null>(null);
    const [loadingDetalhe, setLoadingDetalhe] = useState(false);
    const [erroDetalhe, setErroDetalhe] = useState<string | null>(null);
    const [itemsMap, setItemsMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
    const [itemsOptions, setItemsOptions] = useState<Array<{ label: string; value: Item }>>([]);
    const [selectedItemsMap, setSelectedItemsMap] = useState<Record<number, Item | null>>({});
    const [ambientesMap, setAmbientesMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
    const [topicosMap, setTopicosMap] = useState<Record<number, { nome?: string; descricao?: string }>>({});
    const [marcasMap, setMarcasMap] = useState<Record<number, string[]>>({});
    const [materialNamesMap, setMaterialNamesMap] = useState<Record<number, string>>({});
    const [materialsOptions, setMaterialsOptions] = useState<Array<{ label: string; value: number | undefined }>>([]);
    const [selectedMaterialsMap, setSelectedMaterialsMap] = useState<Record<number, number | null>>({});
    const [commentsMap, setCommentsMap] = useState<Record<string, { text: string; createdAt: string }>>({});
    const [selectedCommentKey, setSelectedCommentKey] = useState<string | null>(null);
    const [commentBoxPos, setCommentBoxPos] = useState<{ top: number; left: number } | null>(null);
    const [tempComment, setTempComment] = useState<string>('');

    const statusOptions: Array<{ label: string; value: string; color: string }> = [
        { label: 'Pendente', value: 'Pendente', color: '#FFD966' },
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
        setSelectedStatus(detalhe?.status ?? 'Em revisão');
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

    const getColorForStatus = (s: string) => {
        const found = statusOptions.find((o) => o.value === s || o.label === s);
        return found ? found.color : '#FF9800';
    };

    const handleMaterialChange = async (topicoMaterialId: number | undefined, newMaterialId: number | null) => {
        if (!topicoMaterialId) return;
        setSelectedMaterialsMap((prev) => ({ ...prev, [Number(topicoMaterialId)]: newMaterialId }));

        // atualizar detalhe localmente (apenas alterar materialId)
        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            copy.empreendimentoTopicos = copy.empreendimentoTopicos?.map((top) => ({
                ...top,
                topicoMateriais: top.topicoMateriais?.map((mat) => {
                    if (Number(mat.id) === Number(topicoMaterialId)) {
                        return { ...mat, materialId: newMaterialId ?? undefined };
                    }
                    return mat;
                })
            }));
            return copy;
        });

        if (typeof newMaterialId === 'number') {
            try {
                const fetched = await marcaMaterialService.getAllMarcasByMaterialId(newMaterialId);
                if (fetched) {
                    if (Array.isArray(fetched)) {
                        setMarcasMap((prev) => ({ ...prev, [Number(newMaterialId)]: fetched as string[] }));
                    } else if (typeof fetched === 'object' && fetched !== null) {
                        const obj = fetched as { marcas?: unknown; material?: unknown; materialName?: unknown };
                        const marcas = Array.isArray(obj.marcas) ? obj.marcas.map(String) : [];
                        setMarcasMap((prev) => ({ ...prev, [Number(newMaterialId)]: marcas }));
                        const matName = obj.material ?? obj.materialName ?? undefined;
                        if (matName) setMaterialNamesMap((prev) => ({ ...prev, [Number(newMaterialId)]: String(matName) }));
                    }
                }
            } catch {}
        }
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
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setStatusError(msg || 'Erro ao atualizar status');
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
        (async () => {
            try {
                const data = await empreendimentoService.getAllEmpreendimentos();
                const filtered = data.filter((e) => mapStatusToNumber(e.status ?? '') === 2);
                const mapped = filtered.map((e) => ({ label: e.nome || e.name || e.descricao || String(e.id), value: e }));
                mapped.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
                setOptions(mapped);
            } catch {
            }
        })();
    }, []);

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

    const loadItemOptions = async (query: string) => {
        try {
            const results = await itemService.searchItems(query);
            const opts = results.map((it) => ({ label: it.nome || it.descricao || `Item #${it.id}`, value: it }));
            opts.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
            setItemsOptions(opts);
        } catch {
            setItemsOptions([]);
        }
    };

    const loadMaterialOptions = async (query: string) => {
        try {
            const results = await materialService.searchMaterials(query);
            const opts = results.map((m) => ({ label: m.nome || m.descricao || `Material #${m.id}`, value: m.id }));
            opts.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
            setMaterialsOptions(opts);
        } catch {
            setMaterialsOptions([]);
        }
    };

    useEffect(() => {
        void loadItemOptions('');
        void loadMaterialOptions('');
    }, []);

    useEffect(() => {
        const entries = Object.keys(itemsMap).map((k) => {
            const id = Number(k);
            const v = itemsMap[id];
            return { label: v?.nome || v?.descricao || `Item #${id}`, value: { id, nome: v?.nome, descricao: v?.descricao } as Item };
        });
        if (entries.length > 0) {
            entries.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
            setItemsOptions((prev) => {
                const map = new Map<number, { label: string; value: Item }>();
                prev.forEach((p) => { if (p.value && typeof p.value.id === 'number') map.set(Number(p.value.id), p); });
                entries.forEach((e) => { if (e.value && typeof e.value.id === 'number') map.set(Number(e.value.id), e); });
                return Array.from(map.values());
            });
        }
    }, [itemsMap]);

    useEffect(() => {
        const entries = Object.keys(materialNamesMap).map((k) => {
            const id = Number(k);
            const v = materialNamesMap[id];
            return { label: v || `Material #${id}`, value: id };
        });
        if (entries.length > 0) {
            entries.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
            setMaterialsOptions((prev) => {
                const map = new Map<number, { label: string; value: number | undefined }>();
                prev.forEach((p) => { if (typeof p.value === 'number') map.set(Number(p.value), p); });
                entries.forEach((e) => { if (typeof e.value === 'number') map.set(Number(e.value), e); });
                return Array.from(map.values());
            });
        }
    }, [materialNamesMap]);

    useEffect(() => {
        if (!detalhe) {
            setSelectedItemsMap({});
            return;
        }
        const next: Record<number, Item | null> = {};
        detalhe.empreendimentoTopicos?.forEach((top) => {
            top.topicoAmbientes?.forEach((amb) => {
                amb.ambienteItens?.forEach((it) => {
                    const key = Number(it.id ?? Math.random());
                    const itemId = Number(it.itemId ?? 0);
                    if (itemId && itemsMap[itemId]) {
                        next[key] = { id: itemId, nome: itemsMap[itemId].nome, descricao: itemsMap[itemId].descricao } as Item;
                    } else if (itemId) {
                        next[key] = { id: itemId, nome: `Item #${itemId}` } as Item;
                    } else {
                        next[key] = null;
                    }
                });
            });
        });
        setSelectedItemsMap(next);
        const nextMat: Record<number, number | null> = {};
        detalhe.empreendimentoTopicos?.forEach((top) => {
            top.topicoMateriais?.forEach((mat) => {
                const key = Number(mat.id ?? Math.random());
                const mid = Number(mat.materialId ?? 0);
                if (mid) {
                    nextMat[key] = mid;
                } else {
                    nextMat[key] = null;
                }
            });
        });
        setSelectedMaterialsMap(nextMat);
    }, [detalhe, itemsMap, materialNamesMap]);

    const handleItemChange = async (ambItemId: number | undefined, newItem: Item | null) => {
        if (!ambItemId) return;
        setSelectedItemsMap((prev) => ({ ...prev, [Number(ambItemId)]: newItem }));

        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            copy.empreendimentoTopicos = copy.empreendimentoTopicos?.map((top) => ({
                ...top,
                topicoAmbientes: top.topicoAmbientes?.map((amb) => ({
                    ...amb,
                    ambienteItens: amb.ambienteItens?.map((it) => {
                        if (Number(it.id) === Number(ambItemId)) {
                            return { ...it, itemId: newItem?.id ?? undefined };
                        }
                        return it;
                    })
                }))
            }));
            return copy;
        });

        // buscar detalhes do item selecionado para atualizar itemsMap (nome/descrição)
        if (newItem && typeof newItem.id === 'number') {
            try {
                const fetched = await itemService.getItemById(newItem.id);
                if (fetched) {
                    setItemsMap((prev) => ({ ...prev, [Number(newItem.id)]: { nome: fetched.nome, descricao: fetched.descricao } }));
                }
            } catch {}
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
                                mMap[id] = val as string[];
                            } else if (typeof val === 'object' && val !== null) {
                                const obj = val as { marcas?: unknown; material?: unknown; materialName?: unknown };
                                if (Array.isArray(obj.marcas)) {
                                    mMap[id] = obj.marcas.map(String);
                                    if (obj.material) materialNameMap[id] = String(obj.material);
                                } else {
                                    mMap[id] = Array.isArray(val) ? (val as unknown[]).map(String) : [];
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
        setTempComment(commentsMap[key]?.text ?? '');
    };
    const handleSaveComment = (itemKey: string) => {
        const storageKey = `docRevisao_comments_${detalhe?.id ?? 'global'}`;
        if (!tempComment || tempComment.trim() === '') {
            setCommentsMap((prev) => {
                const copy = { ...prev };
                delete copy[itemKey];
                try { localStorage.setItem(storageKey, JSON.stringify(copy)); } catch {}
                return copy;
            });
        } else {
            const next = { ...commentsMap, [itemKey]: { text: tempComment.trim(), createdAt: new Date().toISOString() } };
            setCommentsMap(next);
            try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
        }
        setSelectedCommentKey(null);
        setCommentBoxPos(null);
        setTempComment('');
    };

    const handleDeleteComment = (itemKey: string) => {
        const storageKey = `docRevisao_comments_${detalhe?.id ?? 'global'}`;
        setCommentsMap((prev) => {
            const copy = { ...prev };
            delete copy[itemKey];
            try { localStorage.setItem(storageKey, JSON.stringify(copy)); } catch {}
            return copy;
        });
        setSelectedCommentKey(null);
        setCommentBoxPos(null);
        setTempComment('');
    };

    useEffect(() => {
        try {
            if (!detalhe?.id) { setCommentsMap({}); return; }
            const key = `docRevisao_comments_${detalhe.id}`;
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') setCommentsMap(parsed);
            } else {
                setCommentsMap({});
            }
    } catch { /* ignore */ }
    }, [detalhe?.id]);

    const handleCloseComment = () => {
        setSelectedCommentKey(null);
        setCommentBoxPos(null);
        setTempComment('');
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
                    <label className="block mb-0 text-xl font-medium text-center md:text-left">Correção de Empreendimento</label>
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
                {/* Botões abaixo do input, alinhados à direita dentro do mesmo container do input */}
                <div className="mt-2 max-w-4xl mx-auto px-6">
                    <div className="w-full">
                        <div className="md:fixed md:left-1/2 md:-translate-x-1/2 md:transform w-full max-w-4xl md:top-20 md:z-50 py-0">
                            <div className="max-w-4xl mx-auto px-0 flex justify-end">
                                <div className="w-full md:w-80">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {detalhe ? (
                                                <div className="relative">
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
                                                                        // abrir modal de confirmação
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
                                            ) : (
                                                <div />
                                            )}

                                        <div>
                                            <button
                                                type="button"
                                                className="w-full px-3 py-1 rounded font-medium border bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Salvar
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                                                                    <div className="flex items-center gap-2 w-full">
                                                                                        <div
                                                                                            className="w-full"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            onMouseDown={(e) => e.stopPropagation()}
                                                                                            onTouchStart={(e) => e.stopPropagation()}
                                                                                        >
                                                                                            <Dropdown
                                                                                                value={selectedItemsMap[Number(item.id ?? 0)] ?? null}
                                                                                                options={itemsOptions}
                                                                                                onChange={async (e: DropdownChangeEvent) => {
                                                                                                    const newItem = e.value as Item | null;
                                                                                                    await handleItemChange(item.id, newItem);
                                                                                                }}
                                                                                                optionLabel="label"
                                                                                                filter
                                                                                                onFilter={(e) => {
                                                                                                    const evt = e as unknown as Record<string, unknown> | null;
                                                                                                    const q = evt && 'filter' in evt && typeof evt.filter !== 'undefined' ? String(evt.filter) : '';
                                                                                                    void loadItemOptions(String(q));
                                                                                                }}
                                                                                                placeholder={itemsMap[item.itemId ?? 0]?.nome ? itemsMap[item.itemId ?? 0].nome : `Item #${item.itemId}`}
                                                                                                filterPlaceholder="Pesquisar item"
                                                                                                className="w-full"
                                                                                            />
                                                                                        </div>
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
                                                <div className="mt-2">
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
                                                                        <div
                                                                            className="w-full"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onMouseDown={(e) => e.stopPropagation()}
                                                                            onTouchStart={(e) => e.stopPropagation()}
                                                                        >
                                                                            <Dropdown
                                                                                value={selectedMaterialsMap[Number(mat.id ?? mat.materialId ?? 0)] ?? null}
                                                                                options={materialsOptions}
                                                                                optionLabel="label"
                                                                                optionValue="value"
                                                                                filter
                                                                                onChange={async (e) => {
                                                                                    const newMatId = (e.value as number) ?? null;
                                                                                    await handleMaterialChange(mat.id, newMatId);
                                                                                }}
                                                                                onFilter={(e) => {
                                                                                    const evt = e as unknown as Record<string, unknown> | null;
                                                                                    const q = evt && 'filter' in evt && typeof evt.filter !== 'undefined' ? String(evt.filter) : '';
                                                                                    void loadMaterialOptions(String(q));
                                                                                }}
                                                                                placeholder={materialNamesMap[mat.materialId ?? 0] || `Material #${mat.materialId}`}
                                                                                filterPlaceholder="Pesquisar material"
                                                                                className="w-full"
                                                                            />
                                                                        </div>
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
                                    <div style={{ position: 'fixed', top: commentBoxPos.top, left: commentBoxPos.left, width: 340, zIndex: 9999 }}>
                                        <div className="bg-white border rounded shadow-lg p-3 text-sm">
                                            <label className="block text-xs font-semibold mb-1">Comentário</label>
                                            <textarea
                                                value={tempComment}
                                                onChange={(ev) => setTempComment(ev.target.value)}
                                                className="w-full h-28 p-2 border rounded text-sm resize-none"
                                            />
                                            <div className="mt-2 flex justify-end gap-2">
                                                <button onClick={() => handleCloseComment()} className="px-3 py-1 text-sm rounded hover:bg-gray-400 bg-gray-300">Cancelar</button>
                                                <button onClick={() => selectedCommentKey !== null && handleDeleteComment(selectedCommentKey)} className="px-3 py-1 text-sm rounded hover:bg-red-600 bg-red-400">Excluir</button>
                                                <button onClick={() => selectedCommentKey !== null && handleSaveComment(selectedCommentKey)} className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-600 rounded">Salvar</button>
                                            </div>
                                        </div>
                                    </div>,
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