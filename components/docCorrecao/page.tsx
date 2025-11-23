'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from 'react-dom';
import Header from "../headerUser/page";
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { empreendimentoService, Empreendimento, EmpreendimentoTopico, itemService, Item, materialService, ambienteService, topicoService, marcaMaterialService, Material } from '../../lib/services';
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
    const [showAddTopicoDialog, setShowAddTopicoDialog] = useState<boolean>(false);
    const [topicosOptions, setTopicosOptions] = useState<Array<{ label: string; value: number }>>([]);
    const [selectedTopicoToAdd, setSelectedTopicoToAdd] = useState<number | null>(null);
    const [showAddAmbienteDialog, setShowAddAmbienteDialog] = useState<boolean>(false);
    const [ambientesOptions, setAmbientesOptions] = useState<Array<{ label: string; value: number }>>([]);
    const [selectedAmbientesToAdd, setSelectedAmbientesToAdd] = useState<number[]>([]);
    const [currentTopicoIndexForAmbiente, setCurrentTopicoIndexForAmbiente] = useState<number | null>(null);
    const [showAddItemDialog, setShowAddItemDialog] = useState<boolean>(false);
    const [selectedItemsToAdd, setSelectedItemsToAdd] = useState<Item[]>([]);
    const [currentTopicoIndexForItem, setCurrentTopicoIndexForItem] = useState<number | null>(null);
    const [currentAmbienteIndexForItem, setCurrentAmbienteIndexForItem] = useState<number | null>(null);
    const [addItemOptions, setAddItemOptions] = useState<Array<{ label: string; value: Item }>>([]);
    const [showAddMaterialDialog, setShowAddMaterialDialog] = useState<boolean>(false);
    const [selectedMaterialToAdd, setSelectedMaterialToAdd] = useState<number | null>(null);
    const [currentTopicoIndexForMaterial, setCurrentTopicoIndexForMaterial] = useState<number | null>(null);
    const [addMaterialOptions, setAddMaterialOptions] = useState<Array<{ label: string; value: number | undefined }>>([]);
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
    const [savingDetalheChanges, setSavingDetalheChanges] = useState<boolean>(false);
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

    const handleOpenAddMaterial = async (topicoIndex: number) => {
        if (!detalhe) return;
        const top = detalhe.empreendimentoTopicos?.[topicoIndex];
        if (!top) return;
        try {
            const existingIds = new Set<number>();
            detalhe.empreendimentoTopicos?.forEach((t) => t.topicoMateriais?.forEach((m) => { if (typeof m.materialId === 'number') existingIds.add(Number(m.materialId)); }));
            const filtered = (materialsOptions || []).filter((o) => {
                try {
                    const val = o.value as number | undefined | null;
                    if (typeof val === 'number') return !existingIds.has(Number(val));
                } catch {}
                return true;
            });
            const opts = filtered.map((o) => ({ label: o.label, value: o.value }));
            setAddMaterialOptions(opts);
            setSelectedMaterialToAdd(opts.length > 0 ? (opts[0].value ?? null) : null);
            setCurrentTopicoIndexForMaterial(topicoIndex);
            setShowAddMaterialDialog(true);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar materiais', life: 3000 });
        }
    };

    const handleConfirmAddMaterial = async () => {
        if (currentTopicoIndexForMaterial === null || !detalhe) return;
        if (!selectedMaterialToAdd) {
            toast.current?.show({ severity: 'warn', summary: 'Selecione', detail: 'Selecione um material para adicionar', life: 3000 });
            return;
        }
        const top = detalhe.empreendimentoTopicos?.[currentTopicoIndexForMaterial];
        if (!top) return;
        const exists = top.topicoMateriais?.some((mat) => Number(mat.materialId) === Number(selectedMaterialToAdd));
        if (exists) {
            toast.current?.show({ severity: 'warn', summary: 'Já existe', detail: 'Material já adicionado neste tópico', life: 3000 });
            setShowAddMaterialDialog(false);
            return;
        }
        const novoMat = {
            id: undefined,
            materialId: Number(selectedMaterialToAdd),
            posicao: top.topicoMateriais ? top.topicoMateriais.length + 1 : 1,
            versoes: [] as number[]
        } as { id?: number; materialId?: number; posicao?: number; versoes?: number[] };
        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            const arr = Array.isArray(copy.empreendimentoTopicos) ? [...copy.empreendimentoTopicos] : [];
            const target = arr[currentTopicoIndexForMaterial];
            if (!target.topicoMateriais || !Array.isArray(target.topicoMateriais)) target.topicoMateriais = [];
            const filteredExisting = (target.topicoMateriais || []).filter((tm) => Number(tm.materialId ?? 0) !== Number(novoMat.materialId ?? 0));
            target.topicoMateriais = [...filteredExisting, novoMat];
            copy.empreendimentoTopicos = arr;
            return copy;
        });

        try {
            const fetched = await marcaMaterialService.getAllMarcasByMaterialId(Number(selectedMaterialToAdd));
            processMarcasResponse(Number(selectedMaterialToAdd), fetched);
        } catch {}

        toast.current?.show({ severity: 'success', summary: 'Adicionado', detail: 'Material adicionado ao tópico', life: 3000 });
        setShowAddMaterialDialog(false);
    };

    const handleMaterialChange = async (topicoMaterialId: number | undefined, newMaterialId: number | null) => {
        if (!topicoMaterialId) return;
        if (typeof newMaterialId === 'number') {
            const alreadyOnOther = Object.entries(selectedMaterialsMap).find(([k, v]) => {
                if (typeof v !== 'number') return false;
                return Number(k) !== Number(topicoMaterialId) && Number(v) === Number(newMaterialId);
            });
            if (alreadyOnOther) {
                toast.current?.show({ severity: 'warn', summary: 'Material duplicado', detail: 'Este material já foi selecionado em outra linha.', life: 3500 });
                return;
            }
        }

        setSelectedMaterialsMap((prev) => ({ ...prev, [Number(topicoMaterialId)]: newMaterialId }));

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
                processMarcasResponse(Number(newMaterialId), fetched);
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

    // Helper: normaliza respostas de marcas/material e atualiza mapas de estado
    const processMarcasResponse = (id: number, fetched: unknown) => {
        try {
            if (!fetched) return;
            if (Array.isArray(fetched)) {
                setMarcasMap((prev) => ({ ...prev, [Number(id)]: fetched as string[] }));
                return;
            }
            if (typeof fetched === 'object' && fetched !== null) {
                const obj = fetched as { marcas?: unknown; material?: unknown; materialName?: unknown };
                const marcas = Array.isArray(obj.marcas) ? obj.marcas.map(String) : [];
                setMarcasMap((prev) => ({ ...prev, [Number(id)]: marcas }));
                const matName = obj.material ?? obj.materialName ?? undefined;
                if (matName) setMaterialNamesMap((prev) => ({ ...prev, [Number(id)]: String(matName) }));
            }
        } catch {}
    };

    // Helper: extrai string de filtro de eventos do PrimeReact
    const parseFilter = (evt: unknown) => {
        try {
            const e = evt as Record<string, unknown> | null;
            return e && 'filter' in e && typeof e.filter !== 'undefined' ? String(e.filter) : '';
        } catch { return ''; }
    };

    const mapStatusToNumber = (s: string) => {
        const normalized = (s || '').toLowerCase().trim();
        if (normalized === 'aprovado' || normalized === 'aprovados') return 1;
        if (normalized === 'revisao' || normalized === 'em revisão' || normalized === 'em revisao' || normalized === 'revisão') return 2;
        if (normalized === 'pendente') return 3;
        if (normalized === 'cancelado') return 5;
        return 3;
    };

    // Função para preparar o payload completo do empreendimento
    const prepareEmpreendimentoPayload = () => {
        if (!detalhe?.id) return null;
        
        const payload = {
            id: String(detalhe.id),
            nome: detalhe.nome,
            descricao: detalhe.descricao,
            localizacao: detalhe.localizacao,
            tamanhoArea: 0,
            padrao: typeof detalhe.padrao === 'string' ? 
                (detalhe.padrao === 'Residence' ? 1 : detalhe.padrao === 'Mais Viver' ? 2 : detalhe.padrao === 'Vida Bela' ? 3 : 0) 
                : (detalhe.padrao ?? 0),
            empreendimentoTopicos: (detalhe.empreendimentoTopicos || []).map((topico, tIdx) => ({
                topicoId: topico.topicoId ?? 0,
                posicao: topico.posicao ?? (tIdx + 1),
                topicoAmbientes: (topico.topicoAmbientes || []).map((ambiente, aIdx) => ({
                    ambienteId: ambiente.ambienteId ?? 0,
                    area: 0,
                    posicao: ambiente.posicao ?? (aIdx + 1),
                    ambienteItens: (ambiente.ambienteItens || []).map((item) => ({
                        itemId: item.itemId ?? 0
                    }))
                })),
                topicoMateriais: (topico.topicoMateriais || []).map((material) => ({
                    materialId: material.materialId ?? 0
                }))
            }))
        };
        
        return payload;
    };

    const getTopicoPriority = (name?: string) => {
        if (!name) return 99;
        const n = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (n.includes('unidades privativas') || n.includes('unidade privativa')) return 1;
        if (n.includes('area comum') || n.includes('área comum')) return 2;
        if (n.includes('marca') || n.includes('marcas') || n.includes('material') || n.includes('materiais')) return 3;
        return 99;
    };

    const compareTopicos = useCallback((a: EmpreendimentoTopico, b: EmpreendimentoTopico, nameMap: Record<number, { nome?: string }> = topicosMap) => {
        const aName = String(nameMap[a.topicoId ?? 0]?.nome ?? a.topicoId ?? a.id ?? '');
        const bName = String(nameMap[b.topicoId ?? 0]?.nome ?? b.topicoId ?? b.id ?? '');
        const pa = getTopicoPriority(aName);
        const pb = getTopicoPriority(bName);
        if (pa !== pb) return pa - pb;
        return aName.localeCompare(bName, 'pt-BR', { sensitivity: 'base' });
    }, [topicosMap]);

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
        
        // Primeiro salvar as alterações do empreendimento
        if (detalhe?.id) {
            setSavingStatus(true);
            try {
                const payload = prepareEmpreendimentoPayload();
                if (payload) {
                    await empreendimentoService.updateEmpreendimentoCompleto(payload);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Erro ao salvar', 
                    detail: msg || 'Erro ao salvar alterações antes de mudar status', 
                    life: 4000 
                });
                setSavingStatus(false);
                return;
            }
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
                const filtered = data.filter((e) => mapStatusToNumber(e.status ?? '') === 2);
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

    const handleConfirmAddTopico = () => {
        if (!detalhe) return;
        if (!selectedTopicoToAdd) {
            toast.current?.show({ severity: 'warn', summary: 'Selecione', detail: 'Selecione um tópico para adicionar', life: 3000 });
            return;
        }
        const exists = detalhe.empreendimentoTopicos?.some((t) => Number(t.topicoId) === Number(selectedTopicoToAdd));
        if (exists) {
            toast.current?.show({ severity: 'warn', summary: 'Já existe', detail: 'Tópico já adicionado ao documento', life: 3000 });
            setShowAddTopicoDialog(false);
            return;
        }
        const novo = {
            id: undefined,
            topicoId: Number(selectedTopicoToAdd),
            posicao: detalhe.empreendimentoTopicos ? detalhe.empreendimentoTopicos.length + 1 : 1,
            versoes: [],
            topicoAmbientes: [],
            topicoMateriais: [],
    } as EmpreendimentoTopico;
        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            copy.empreendimentoTopicos = Array.isArray(copy.empreendimentoTopicos) ? [...copy.empreendimentoTopicos, novo] : [novo];
            return copy;
        });
        try {
            const label = topicosOptions.find((o) => Number(o.value) === Number(selectedTopicoToAdd))?.label;
            if (label) {
                    setTopicosMap((prev) => {
                    const next = { ...prev, [Number(selectedTopicoToAdd)]: { nome: label } };
                    setDetalhe((dprev) => {
                        if (!dprev || !dprev.empreendimentoTopicos) return dprev;
                        const sorted = [...dprev.empreendimentoTopicos].sort((a, b) => compareTopicos(a, b, next));
                        return { ...dprev, empreendimentoTopicos: sorted } as Empreendimento;
                    });
                    return next;
                });
            } else {
                setDetalhe((dprev) => {
                    if (!dprev || !dprev.empreendimentoTopicos) return dprev;
                    const sorted = [...dprev.empreendimentoTopicos].sort((a, b) => compareTopicos(a, b));
                    return { ...dprev, empreendimentoTopicos: sorted } as Empreendimento;
                });
            }
        } catch {}
        toast.current?.show({ severity: 'success', summary: 'Adicionado', detail: 'Tópico adicionado ao documento', life: 3000 });
        setShowAddTopicoDialog(false);
    };

    const handleOpenAddTopico = async () => {
        try {
            const all = await topicoService.getAllTopicos();
            const opts = (all || []).map((t) => ({ label: t.nome || String(t.id), value: Number(t.id) }));
            opts.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
            
            const existing = new Set<number>();
            detalhe?.empreendimentoTopicos?.forEach((et) => { if (typeof et.topicoId === 'number') existing.add(Number(et.topicoId)); });
            
            const filtered = opts.filter((o) => {
                const alreadyExists = existing.has(Number(o.value));
                return !alreadyExists;
            });
            
            if (filtered.length === 0) {
                toast.current?.show({ 
                    severity: 'info', 
                    summary: 'Nenhum tópico disponível', 
                    detail: 'Todos os tópicos cadastrados já foram adicionados ao documento', 
                    life: 4000 
                });
                return;
            }
            
            setTopicosOptions(filtered);
            setSelectedTopicoToAdd(filtered.length > 0 ? filtered[0].value : null);
            setShowAddTopicoDialog(true);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar tópicos', life: 3000 });
        }
    };

    const handleOpenAddAmbiente = async (topico: EmpreendimentoTopico, index: number) => {
        const name = String(topicosMap[topico.topicoId ?? 0]?.nome ?? '');
        const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (!(normalized.includes('unidades privativas') || normalized.includes('unidade privativa') || normalized.includes('area comum') || normalized.includes('área comum'))) {
            return;
        }
        try {
            const all = await ambienteService.getAllAmbientes();
            const existingIds = new Set<number>();
            (topico.topicoAmbientes || []).forEach((ta) => {
                const idnum = Number(ta.ambienteId ?? ta.id ?? 0);
                if (idnum) existingIds.add(idnum);
            });
            const filtered = (all || [])
                .filter((a) => {
                    const at = String(a.topico?.nome ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                    const aid = Number(a.id ?? 0);
                    if (!at) return false;
                    if (!(at.includes(normalized) || normalized.includes(at))) return false;
                    if (aid && existingIds.has(aid)) return false;
                    return true;
                })
                .map((a) => ({ label: a.nome || `Ambiente #${a.id}`, value: Number(a.id) }));
            filtered.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
            setAmbientesOptions(filtered);
            setSelectedAmbientesToAdd(filtered.length > 0 ? [filtered[0].value as number] : []);
            setCurrentTopicoIndexForAmbiente(index);
            setShowAddAmbienteDialog(true);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar ambientes', life: 3000 });
        }
    };

    const handleConfirmAddAmbiente = async () => {
        if (currentTopicoIndexForAmbiente === null || !detalhe) return;
        if (!selectedAmbientesToAdd || selectedAmbientesToAdd.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Selecione', detail: 'Selecione pelo menos um ambiente para adicionar', life: 3000 });
            return;
        }
        const top = detalhe.empreendimentoTopicos?.[currentTopicoIndexForAmbiente];
        if (!top) return;

        const toAdd = selectedAmbientesToAdd.map((id) => Number(id)).filter((id) => id && !(top.topicoAmbientes || []).some((ta) => Number(ta.ambienteId ?? ta.id ?? 0) === id));
        if (toAdd.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Já existe', detail: 'Os ambientes selecionados já estão adicionados neste tópico', life: 3000 });
            setShowAddAmbienteDialog(false);
            return;
        }

        const novos = toAdd.map((ambId, idx) => ({
            id: undefined,
            ambienteId: ambId,
            posicao: (top.topicoAmbientes ? top.topicoAmbientes.length : 0) + idx + 1,
            versoes: [],
            ambienteItens: [] as Array<{ id?: number; itemId?: number; versoes?: number[] }>
        } as { id?: number; ambienteId?: number; posicao?: number; versoes?: number[]; ambienteItens?: Array<{ id?: number; itemId?: number; versoes?: number[] }> }));

        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            const arr = Array.isArray(copy.empreendimentoTopicos) ? [...copy.empreendimentoTopicos] : [];
            const target = arr[currentTopicoIndexForAmbiente];
            if (!target.topicoAmbientes || !Array.isArray(target.topicoAmbientes)) target.topicoAmbientes = [];
            const filteredExisting = (target.topicoAmbientes || []).filter((ta) => !novos.some((n) => Number(n.ambienteId ?? 0) === Number(ta.ambienteId ?? ta.id ?? 0)));
            target.topicoAmbientes = [...filteredExisting, ...novos];
            copy.empreendimentoTopicos = arr;
            return copy;
        });

        await Promise.all(toAdd.map(async (ambId) => {
            try {
                const amb = await ambienteService.getAmbienteById(Number(ambId));
                if (amb && typeof amb.nome !== 'undefined') {
                    setAmbientesMap((prev) => ({ ...prev, [Number(ambId)]: { nome: amb.nome } }));
                }
            } catch {}
        }));

        toast.current?.show({ severity: 'success', summary: 'Adicionado', detail: `${toAdd.length} ambiente(s) adicionados ao tópico`, life: 3000 });
        setShowAddAmbienteDialog(false);
        setSelectedAmbientesToAdd([]);
    };

    const handleOpenAddItem = async (topicoIndex: number, ambienteIndex: number) => {
        if (!detalhe) return;
        const top = detalhe.empreendimentoTopicos?.[topicoIndex];
        if (!top) return;
        const amb = top.topicoAmbientes?.[ambienteIndex];
        if (!amb) return;

        try {
            const existingIds = new Set<number>();
            (amb.ambienteItens || []).forEach((it) => { if (typeof it.itemId === 'number') existingIds.add(Number(it.itemId)); });
            const filtered = (itemsOptions || []).filter((o) => {
                try {
                    const val = o.value as Item | undefined | null;
                    if (val && typeof val.id === 'number') return !existingIds.has(Number(val.id));
                } catch {}
                return true;
            });
            const opts = filtered.map((o) => ({ label: o.label, value: o.value }));
            setAddItemOptions(opts);
            setSelectedItemsToAdd(opts.length > 0 && opts[0].value ? [opts[0].value] as Item[] : []);
            setCurrentTopicoIndexForItem(topicoIndex);
            setCurrentAmbienteIndexForItem(ambienteIndex);
            setShowAddItemDialog(true);
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar itens', life: 3000 });
        }
    };

    const handleConfirmAddItem = () => {
        if (currentTopicoIndexForItem === null || currentAmbienteIndexForItem === null || !detalhe) return;
        if (!selectedItemsToAdd || selectedItemsToAdd.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Selecione', detail: 'Selecione ao menos um item para adicionar', life: 3000 });
            return;
        }
        const top = detalhe.empreendimentoTopicos?.[currentTopicoIndexForItem];
        if (!top) return;
        const amb = top.topicoAmbientes?.[currentAmbienteIndexForItem];
        if (!amb) return;

        const existingIds = new Set<number>();
        (amb.ambienteItens || []).forEach((it) => { if (typeof it.itemId === 'number') existingIds.add(Number(it.itemId)); });

        const toAdd = selectedItemsToAdd.filter((si) => si && typeof si.id === 'number' && !existingIds.has(Number(si.id)));
        if (toAdd.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Já existem', detail: 'Os itens selecionados já estão presentes neste ambiente', life: 3000 });
            setShowAddItemDialog(false);
            setSelectedItemsToAdd([]);
            return;
        }

        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            const arr = Array.isArray(copy.empreendimentoTopicos) ? [...copy.empreendimentoTopicos] : [];
            const targetTop = arr[currentTopicoIndexForItem];
            if (!targetTop.topicoAmbientes || !Array.isArray(targetTop.topicoAmbientes)) targetTop.topicoAmbientes = [];
            const targetAmb = targetTop.topicoAmbientes[currentAmbienteIndexForItem];
            if (!targetAmb.ambienteItens || !Array.isArray(targetAmb.ambienteItens)) targetAmb.ambienteItens = [];

            const existingFiltered = (targetAmb.ambienteItens || []).filter((it) => !toAdd.some((t) => Number(t.id) === Number(it.itemId)));
            const novos = toAdd.map((t, i) => ({ id: -Date.now() - i, itemId: Number(t.id), posicao: (targetAmb.ambienteItens?.length ?? 0) + 1 + i, versoes: [] as number[] }));
            targetAmb.ambienteItens = [...existingFiltered, ...novos];
            copy.empreendimentoTopicos = arr;
            return copy;
        });

        (async () => {
            try {
                await Promise.all(toAdd.map(async (s) => {
                    try {
                        const fetched = await itemService.getItemById(Number(s.id));
                        if (fetched) setItemsMap((prev) => ({ ...prev, [Number(s.id)]: { nome: fetched.nome, descricao: fetched.descricao } }));
                    } catch {}
                }));
            } catch {}
        })();

        toast.current?.show({ severity: 'success', summary: 'Adicionado', detail: `${toAdd.length} item(s) adicionados ao ambiente`, life: 3000 });
        setShowAddItemDialog(false);
        setSelectedItemsToAdd([]);
    };

    const handleRemoveTopico = (topicoIndex: number) => {
        if (!detalhe) return;
        const topico = detalhe.empreendimentoTopicos?.[topicoIndex];
        if (!topico) return;

        const ambientesCount = Array.isArray(topico.topicoAmbientes) ? topico.topicoAmbientes.length : 0;
        if (ambientesCount > 1) {
            toast.current?.show({ severity: 'warn', summary: 'Não permitido', detail: 'Não é possível remover o tópico enquanto ele contiver mais de 1 ambiente', life: 3500 });
            return;
        }

        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            const arr = Array.isArray(copy.empreendimentoTopicos) ? [...copy.empreendimentoTopicos] : [];
            arr.splice(topicoIndex, 1);
            copy.empreendimentoTopicos = arr;
            return copy;
        });

        const topicoNome = topicosMap[topico.topicoId ?? 0]?.nome || `Tópico ${topico.topicoId}`;
        toast.current?.show({ severity: 'success', summary: 'Removido', detail: `${topicoNome} removido do documento`, life: 3000 });
    };

    const handleRemoveAmbiente = (topicoIndex: number, ambienteIndex: number) => {
        if (!detalhe) return;
        const topico = detalhe.empreendimentoTopicos?.[topicoIndex];
        if (!topico) return;
        const ambiente = topico.topicoAmbientes?.[ambienteIndex];
        if (!ambiente) return;

        const itensCount = Array.isArray(ambiente.ambienteItens) ? ambiente.ambienteItens.length : 0;
        if (itensCount > 1) {
            toast.current?.show({ severity: 'warn', summary: 'Não permitido', detail: 'Não é possível remover o ambiente enquanto ele contiver mais de 1 item', life: 3500 });
            return;
        }

        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            const arr = Array.isArray(copy.empreendimentoTopicos) ? [...copy.empreendimentoTopicos] : [];
            const targetTop = arr[topicoIndex];
            if (!targetTop.topicoAmbientes || !Array.isArray(targetTop.topicoAmbientes)) return prev;
            targetTop.topicoAmbientes.splice(ambienteIndex, 1);
            copy.empreendimentoTopicos = arr;
            return copy;
        });

        const ambienteNome = ambientesMap[ambiente.ambienteId ?? 0]?.nome || `Ambiente ${ambiente.ambienteId}`;
        toast.current?.show({ severity: 'success', summary: 'Removido', detail: `${ambienteNome} removido do tópico`, life: 3000 });
    };

    const handleRemoveItem = (topicoIndex: number, ambienteIndex: number, itemIndex: number) => {
        if (!detalhe) return;
        const topico = detalhe.empreendimentoTopicos?.[topicoIndex];
        if (!topico) return;
        const ambiente = topico.topicoAmbientes?.[ambienteIndex];
        if (!ambiente) return;
        const item = ambiente.ambienteItens?.[itemIndex];
        if (!item) return;

        // Atualização imutável para evitar efeitos colaterais em referências compartilhadas
        setDetalhe((prev) => {
            if (!prev) return prev;
            const newTopicos = (prev.empreendimentoTopicos || []).map((t, tIdx) => {
                if (tIdx !== topicoIndex) return t;
                const newTopico: EmpreendimentoTopico = { ...t } as EmpreendimentoTopico;
                newTopico.topicoAmbientes = (t.topicoAmbientes || []).map((a, aIdx) => {
                    if (aIdx !== ambienteIndex) return a;
                    const newAmb = { ...a } as typeof a;
                    newAmb.ambienteItens = (a.ambienteItens || []).filter((_, idx) => idx !== itemIndex);
                    return newAmb;
                });
                return newTopico;
            });

            return { ...prev, empreendimentoTopicos: newTopicos } as Empreendimento;
        });

        const itemNome = itemsMap[item.itemId ?? 0]?.nome || `Item #${item.itemId}`;
        toast.current?.show({ severity: 'success', summary: 'Removido', detail: `${itemNome} removido do ambiente`, life: 3000 });
    };

    const handleRemoveMaterial = (topicoIndex: number, materialIndex: number) => {
        if (!detalhe) return;
        const topico = detalhe.empreendimentoTopicos?.[topicoIndex];
        if (!topico) return;
        const material = topico.topicoMateriais?.[materialIndex];
        if (!material) return;
        
        setDetalhe((prev) => {
            if (!prev) return prev;
            const copy = { ...prev } as Empreendimento;
            const arr = Array.isArray(copy.empreendimentoTopicos) ? [...copy.empreendimentoTopicos] : [];
            const targetTop = arr[topicoIndex];
            if (!targetTop.topicoMateriais || !Array.isArray(targetTop.topicoMateriais)) return prev;
            targetTop.topicoMateriais.splice(materialIndex, 1);
            copy.empreendimentoTopicos = arr;
            return copy;
        });
        
        const materialNome = materialNamesMap[material.materialId ?? 0] || `Material #${material.materialId}`;
        toast.current?.show({ severity: 'success', summary: 'Removido', detail: `${materialNome} removido do tópico`, life: 3000 });
    };

    const fetchItemsNames = async (d: Empreendimento) => {
        try {
            const itemIds = new Set<number>();
            const materialIds = new Set<number>();

            d.empreendimentoTopicos?.forEach((top) => {
                top.topicoAmbientes?.forEach((amb) => {
                    (amb.ambienteItens || []).forEach((it) => { if (typeof it.itemId === 'number') itemIds.add(Number(it.itemId)); });
                });
                (top.topicoMateriais || []).forEach((m) => { if (typeof m.materialId === 'number') materialIds.add(Number(m.materialId)); });
            });

            const fetchedItemsMap: Record<number, { nome?: string; descricao?: string }> = {};
            await Promise.all(Array.from(itemIds).map(async (id) => {
                try {
                    const it = await itemService.getItemById(id);
                    if (it) fetchedItemsMap[id] = { nome: it.nome, descricao: it.descricao };
                } catch {}
            }));
            if (Object.keys(fetchedItemsMap).length > 0) setItemsMap((prev) => ({ ...prev, ...fetchedItemsMap }));

            const fetchedMaterialNames: Record<number, string> = {};
            await Promise.all(Array.from(materialIds).map(async (id) => {
                try {
                    const m = await materialService.getMaterialById(id);
                    if (m && (m.nome || m.descricao)) fetchedMaterialNames[id] = m.nome ?? String(m.id ?? '');
                } catch {}
            }));
            if (Object.keys(fetchedMaterialNames).length > 0) setMaterialNamesMap((prev) => ({ ...prev, ...fetchedMaterialNames }));

            await Promise.all(Array.from(materialIds).map(async (id) => {
                try {
                    const marcas = await marcaMaterialService.getAllMarcasByMaterialId(id);
                    processMarcasResponse(id, marcas);
                } catch {}
            }));
        } catch {}
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
            let results: Material[] = [];
            if (!query || query.trim() === '') {
                results = await materialService.getAllMateriais();
            } else {
                results = await materialService.searchMaterials(query);
            }
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
        if (showAddItemDialog && currentTopicoIndexForItem !== null && currentAmbienteIndexForItem !== null) {
            const top = detalhe?.empreendimentoTopicos?.[currentTopicoIndexForItem];
            const amb = top?.topicoAmbientes?.[currentAmbienteIndexForItem];
            if (amb) {
                const existingIds = new Set<number>();
                (amb.ambienteItens || []).forEach((it) => { if (typeof it.itemId === 'number') existingIds.add(Number(it.itemId)); });
                const filtered = (itemsOptions || []).filter((o) => {
                    try {
                        const val = o.value as Item | undefined | null;
                        if (val && typeof val.id === 'number') return !existingIds.has(Number(val.id));
                    } catch {}
                    return true;
                }).map((o) => ({ label: o.label, value: o.value }));
                setAddItemOptions(filtered);
                try {
                    const availableIds = new Set<number>();
                    filtered.forEach((f) => { if (f && f.value && typeof (f.value as Item).id === 'number') availableIds.add(Number((f.value as Item).id)); });
                    setSelectedItemsToAdd((prevSelected) => {
                        const kept = prevSelected ? prevSelected.filter((si) => si && typeof si.id === 'number' && availableIds.has(Number(si.id))) : [];
                        if (kept.length > 0) {
                            return kept;
                        } else {
                            return filtered.length > 0 && filtered[0].value ? [filtered[0].value as Item] : [];
                        }
                    });
                } catch { /* ignore */ }
            }
        }
    }, [itemsOptions, showAddItemDialog, currentTopicoIndexForItem, currentAmbienteIndexForItem, detalhe]);

    useEffect(() => {
        if (showAddMaterialDialog && currentTopicoIndexForMaterial !== null) {
            const top = detalhe?.empreendimentoTopicos?.[currentTopicoIndexForMaterial];
            if (top) {
                const existingIds = new Set<number>();
                detalhe?.empreendimentoTopicos?.forEach((t) => t.topicoMateriais?.forEach((m) => { if (typeof m.materialId === 'number') existingIds.add(Number(m.materialId)); }));
                const filtered = (materialsOptions || []).filter((o) => {
                    try {
                        const val = o.value as number | undefined | null;
                        if (typeof val === 'number') return !existingIds.has(Number(val));
                    } catch {}
                    return true;
                }).map((o) => ({ label: o.label, value: o.value }));
                setAddMaterialOptions(filtered);
                if (selectedMaterialToAdd && filtered.every((f) => Number(f.value ?? 0) !== Number(selectedMaterialToAdd))) {
                    setSelectedMaterialToAdd(filtered.length > 0 ? (filtered[0].value ?? null) : null);
                }
            }
        }
    }, [materialsOptions, showAddMaterialDialog, currentTopicoIndexForMaterial, detalhe, selectedMaterialToAdd]);

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
        let tempItemKey = -1;
        detalhe.empreendimentoTopicos?.forEach((top) => {
            top.topicoAmbientes?.forEach((amb) => {
                amb.ambienteItens?.forEach((it) => {
                    const key = Number(it.id ?? tempItemKey--);
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
        let tempMatKey = -1;
        detalhe.empreendimentoTopicos?.forEach((top) => {
            top.topicoMateriais?.forEach((mat) => {
                const key = Number(mat.id ?? tempMatKey--);
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
        if (newItem && typeof newItem.id === 'number') {
            const alreadyOnOther = Object.entries(selectedItemsMap).find(([k, v]) => {
                if (!v) return false;
                return Number(k) !== Number(ambItemId) && Number(v.id) === Number(newItem.id);
            });
            if (alreadyOnOther) {
                toast.current?.show({ severity: 'warn', summary: 'Item duplicado', detail: 'Este item já foi selecionado em outra linha.', life: 3500 });
                return;
            }
        }

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
                Array.from(materialIds).forEach((id, idx) => {
                    const r = matResults[idx];
                    if (r && r.status === 'fulfilled') processMarcasResponse(id, (r as PromiseFulfilledResult<unknown>).value);
                });
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
    const handleSaveComment = async (itemKey: string) => {
        try {
            const parts = itemKey.split(':');
            if (parts.length !== 2) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Formato de chave inválido', life: 3000 });
                return;
            }
            const id = parseInt(parts[1]);
            if (isNaN(id)) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'ID inválido', life: 3000 });
                return;
            }

            const statusId = mapStatusToNumber(detalhe?.status ?? selectedStatus);

            if (parts[0] === 'item') {
                await itemService.setItemComentario(id, statusId, tempComment.trim());

                if (!tempComment || tempComment.trim() === '') {
                    setCommentsMap((prev) => {
                        const copy = { ...prev };
                        delete copy[itemKey];
                        return copy;
                    });
                } else {
                    const next = { ...commentsMap, [itemKey]: { text: tempComment.trim(), createdAt: new Date().toISOString() } };
                    setCommentsMap(next);
                }

                toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Comentário salvo com sucesso', life: 3000 });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Tipo inválido para comentário', life: 3000 });
            }
        } catch (err) {
            console.error('Erro ao salvar comentário:', err);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar comentário', life: 3000 });
        } finally {
            setSelectedCommentKey(null);
            setCommentBoxPos(null);
            setTempComment('');
        }
    };

    const handleDeleteComment = async (itemKey: string) => {
        try {
            const parts = itemKey.split(':');
            if (parts.length !== 2) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Formato de chave inválido', life: 3000 });
                return;
            }
            const id = parseInt(parts[1]);
            if (isNaN(id)) {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'ID inválido', life: 3000 });
                return;
            }

            if (parts[0] === 'item') {
                if (itemService.clearItemComentario) {
                    await itemService.clearItemComentario(id);
                } else {
                    await itemService.setItemComentario(id, mapStatusToNumber(selectedStatus), '');
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Tipo inválido para comentário', life: 3000 });
            }

            setCommentsMap((prev) => {
                const copy = { ...prev };
                delete copy[itemKey];
                return copy;
            });

            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Comentário removido', life: 3000 });
        } catch (err) {
            console.error('Erro ao deletar comentário:', err);
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'Erro ao remover comentário', life: 3000 });
        } finally {
            setSelectedCommentKey(null);
            setCommentBoxPos(null);
            setTempComment('');
        }
    };

    useEffect(() => {
        try {
            if (!detalhe?.id) { setCommentsMap({}); return; }

            // Carregar comentários da estrutura retornada pela API (revisaoItem / revisaoMaterial)
            const newCommentsMap: Record<string, { text: string; createdAt: string }> = {};

            detalhe.empreendimentoTopicos?.forEach((topico) => {
                topico.topicoAmbientes?.forEach((ambiente) => {
                    ambiente.ambienteItens?.forEach((item) => {
                        if (item.revisaoItem && item.revisaoItem.observacao) {
                            const itemKey = `item:${item.id}`;
                            newCommentsMap[itemKey] = {
                                text: item.revisaoItem.observacao,
                                createdAt: new Date().toISOString()
                            };
                        }
                    });
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

        useEffect(() => {
            if (options.length === 0) return; // ainda não carregou

            const storedId = sessionStorage.getItem("empreendimentoSelecionado");
            if (!storedId) return;

            const emp = options.find(e => String(e.value.id) === String(storedId));
            if (!emp) return;

            // Remove para evitar reuso ou loops
            sessionStorage.removeItem("empreendimentoSelecionado");

            setSelected(emp.value);        // preenche dropdown

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
                                                onClick={async () => {
                                                    if (!detalhe?.id) return;
                                                    setSavingDetalheChanges(true);
                                                    try {
                                                        const payload = prepareEmpreendimentoPayload();
                                                        if (!payload) {
                                                            throw new Error('Não foi possível preparar os dados');
                                                        }
                                                        await empreendimentoService.updateEmpreendimentoCompleto(payload);
                                                        toast.current?.show({ severity: 'success', summary: 'Salvo', detail: 'Empreendimento atualizado com sucesso', life: 3000 });
                                                        try {
                                                            const refreshed = await empreendimentoService.getEmpreendimentoById(detalhe.id as string | number);
                                                            if (refreshed) {
                                                                setDetalhe(refreshed);
                                                                fetchItemsNames(refreshed);
                                                                fetchAuxNames(refreshed);
                                                            }
                                                        } catch {}
                                                    } catch (err: unknown) {
                                                        const msg = err instanceof Error ? err.message : String(err);
                                                        toast.current?.show({ severity: 'error', summary: 'Erro', detail: msg || 'Erro ao salvar', life: 4000 });
                                                    } finally {
                                                        setSavingDetalheChanges(false);
                                                    }
                                                }}
                                                disabled={savingDetalheChanges}
                                                className="w-full px-3 py-1 rounded font-medium border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                            >
                                                {savingDetalheChanges ? (
                                                    <><i className="pi pi-spin pi-spinner mr-2" />Salvando</>
                                                ) : 'Salvar'}
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
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="block text-sm font-medium">Nome do empreendimento</label>
                                        <input
                                            type="text"
                                            value={detalhe.nome ?? detalhe.name ?? ''}
                                            onChange={(e) => setDetalhe((prev) => prev ? ({ ...prev, nome: e.target.value } as Empreendimento) : prev)}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Localização</label>
                                        <input
                                            type="text"
                                            value={detalhe.localizacao ?? ''}
                                            onChange={(e) => setDetalhe((prev) => prev ? ({ ...prev, localizacao: e.target.value } as Empreendimento) : prev)}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium">Padrão</label>
                                        <Dropdown
                                            value={detalhe.padrao ?? ''}
                                            options={[
                                                { label: 'Residence', value: 'Residence' },
                                                { label: 'Mais Viver', value: 'Mais Viver' },
                                                { label: 'Vida Bela', value: 'Vida Bela' },
                                            ]}
                                            optionLabel="label"
                                            optionValue="value"
                                            onChange={(e: DropdownChangeEvent) => setDetalhe((prev) => prev ? ({ ...prev, padrao: e.value } as Empreendimento) : prev)}
                                            placeholder="Selecione o padrão"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold">Descrição</label>
                                        <textarea
                                            value={detalhe.descricao ?? ''}
                                            onChange={(e) => setDetalhe((prev) => prev ? ({ ...prev, descricao: e.target.value } as Empreendimento) : prev)}
                                            className="w-full p-2 border rounded h-28"
                                        />
                                    </div>
                                </div>
                            </header>

                            {/* Metadados simples */}
                            <section className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div><strong>Status:</strong> {detalhe.status || '-'}</div>
                                <div><strong>Padrão:</strong> {String(detalhe.padrao ?? '-')}</div>
                                <div><strong>Versão:</strong> {detalhe.versao ?? '-'}</div>
                            </section>

                            {/* Tópicos -> Ambientes -> Itens: formatamos como seções com tabelas (Item | Versões) */}
                            <section>
                                    <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold mb-0">Tópicos</h3>
                                                <button
                                                    type="button"
                                                    title="Adicionar tópico"
                                                    onClick={() => handleOpenAddTopico()}
                                                    className="px-2 py-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center "
                                                    style={{ width: 28, height: 28 }}
                                                >
                                                    <i className="pi pi-plus" />
                                                    <span className="hidden sm:inline"></span>
                                                </button>
                                            </div>
                                            {detalhe.empreendimentoTopicos && detalhe.empreendimentoTopicos.length > 0 && detalhe.empreendimentoTopicos
                                        .map((topico, idx) => (
                                                                <section key={topico.id ?? idx} className="mb-4">
                                                                    <div className="flex items-center justify-between w-full gap-2 mb-2">
                                                                        <div className="flex items-center gap-2 flex-1">
                                                                            <h4 className="font-semibold mb-0">{topicosMap[topico.topicoId ?? 0]?.nome || `Tópico ${topico.topicoId ?? topico.id}`}</h4>
                                                                            {/* botão + para ações específicas por tópico (Ambientes para Unidades/Área comum, Materiais para MARCAS) */}
                                                                            {(() => {
                                                                            const tname = String(topicosMap[topico.topicoId ?? 0]?.nome ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                                                                            if (tname.includes('unidades privativas') || tname.includes('unidade privativa') || tname.includes('area comum') || tname.includes('área comum')) {
                                                                                return (
                                                                                    <button
                                                                                        type="button"
                                                                                        title="Adicionar ambiente"
                                                                                        onClick={() => handleOpenAddAmbiente(topico, idx)}
                                                                                        className="p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center flex-shrink-0"
                                                                                        style={{ width: 28, height: 28 }}
                                                                                    >
                                                                                        <i className="pi pi-plus" />
                                                                                    </button>
                                                                                );
                                                                            }
                                                                            if (tname.includes('marca') || tname.includes('marcas')) {
                                                                                return (
                                                                                    <button
                                                                                        type="button"
                                                                                        title="Adicionar material"
                                                                                        onClick={() => handleOpenAddMaterial(idx)}
                                                                                        className="p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center flex-shrink-0"
                                                                                        style={{ width: 28, height: 28 }}
                                                                                    >
                                                                                        <i className="pi pi-plus" />
                                                                                    </button>
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })()}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            title="Remover tópico"
                                                                            onClick={() => handleRemoveTopico(idx)}
                                                                            className="p-1 rounded bg-red-500 text-white hover:bg-red-700 flex items-center justify-center flex-shrink-0"
                                                                            style={{ width: 28, height: 28 }}
                                                                        >
                                                                            <i className="pi pi-times" />
                                                                        </button>
                                                                    </div>

                                            {/* Ambientes */}
                                            {topico.topicoAmbientes && topico.topicoAmbientes.length > 0 && (
                                                <div className="mt-2">
                                                    {(() => {
                                                        const seen = new Set<string>();
                                                        const unique = (topico.topicoAmbientes || []).filter((a, i) => {
                                                            const key = String(a.ambienteId ?? a.id ?? i);
                                                            if (seen.has(key)) return false;
                                                            seen.add(key);
                                                            return true;
                                                        });

                                                        return unique.map((amb, ambIdx) => (
                                                            <div key={String(amb.ambienteId ?? amb.id ?? ambIdx)} className="mb-3 bg-gray-100 md:bg-transparent p-3 md:p-0 rounded">
                                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                                    <div className="flex items-center gap-2 flex-1">
                                                                        <h5 className="font-medium mb-0">
                                                                            {ambientesMap[amb.ambienteId ?? 0]?.nome || `Ambiente ${amb.ambienteId ?? amb.id}`}
                                                                        </h5>
                                                                        <button
                                                                            type="button"
                                                                            title="Adicionar item"
                                                                            onClick={() => handleOpenAddItem(idx, ambIdx)}
                                                                            className="p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center flex-shrink-0"
                                                                            style={{ width: 28, height: 28 }}
                                                                        >
                                                                            <i className="pi pi-plus" />
                                                                        </button>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        title="Remover ambiente"
                                                                        onClick={() => handleRemoveAmbiente(idx, ambIdx)}
                                                                        className="p-1 rounded bg-red-500 text-white hover:bg-red-700 flex items-center justify-center flex-shrink-0"
                                                                        style={{ width: 28, height: 28 }}
                                                                    >
                                                                        <i className="pi pi-times" />
                                                                    </button>
                                                                </div>

                                                                {amb.ambienteItens && amb.ambienteItens.length > 0 ? (
                                                                    <div className="overflow-x-auto px-3 md:px-0">
                                                                        <table className="w-full text-sm border-collapse">
                                                                            <thead className="hidden md:table-header-group">
                                                                                <tr className="bg-gray-100 md:border-b md:border-gray-300">
                                                                                    <th className="px-3 py-2 text-left w-1/3">Item</th>
                                                                                    <th className="px-3 py-2 text-left">Descrição</th>
                                                                                    <th className="px-3 py-2 text-right" style={{ width: 40 }}>Ações</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                        {amb.ambienteItens.map((item, itemIdx) => (
                                                                                            <tr
                                                                                                key={`${item.id ?? item.itemId ?? 'item'}-${itemIdx}`}
                                                                                                onClick={(e) => handleOpenComment(e, `item:${item.id ?? item.itemId ?? itemIdx}`)}
                                                                                                title={commentsMap[`item:${item.id ?? item.itemId ?? itemIdx}`]?.text ?? ''}
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
                                                                                                    className="flex-1"
                                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                                    onMouseDown={(e) => e.stopPropagation()}
                                                                                                    onTouchStart={(e) => e.stopPropagation()}
                                                                                                >
                                                                                                    <Dropdown
                                                                                                        value={selectedItemsMap[Number(item.id ?? 0)] ?? null}
                                                                                                        options={itemsOptions.filter((opt) => {
                                                                                                            try {
                                                                                                                const val = opt.value as Item | undefined | null;
                                                                                                                const optId = val && typeof (val as Item).id === 'number' ? Number((val as Item).id) : undefined;
                                                                                                                const currentSel = selectedItemsMap[Number(item.id ?? 0)];
                                                                                                                if (typeof optId === 'number') {
                                                                                                                    if (currentSel && currentSel.id === optId) return true;
                                                                                                                    return !Object.values(selectedItemsMap).some((v) => v && typeof v.id === 'number' && Number(v.id) === optId);
                                                                                                                }
                                                                                                            } catch {}
                                                                                                            return true;
                                                                                                        })}
                                                                                                        onChange={async (e: DropdownChangeEvent) => {
                                                                                                            const newItem = e.value as Item | null;
                                                                                                            await handleItemChange(item.id, newItem);
                                                                                                        }}
                                                                                                        optionLabel="label"
                                                                                                        filter
                                                                                                        onFilter={(e) => { void loadItemOptions(parseFilter(e)); }}
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
                                                                                        <td className="block md:table-cell md:pr-0 py-2 md:text-right">
                                                                                            <button
                                                                                                type="button"
                                                                                                title="Remover item"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    if (typeof itemIdx === 'number' && itemIdx !== -1) handleRemoveItem(idx, ambIdx, itemIdx);
                                                                                                }}
                                                                                                className="p-1 rounded bg-red-500 text-white hover:bg-red-700 flex items-center justify-center flex-shrink-0 md:ml-auto"
                                                                                                style={{ width: 28, height: 28 }}
                                                                                            >
                                                                                                <i className="pi pi-times" style={{ fontSize: '0.875rem' }} />
                                                                                            </button>
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
                                                        ));
                                                    })()}
                                                </div>
                                            )}

                                            {/* Materiais */}
                                            {topico.topicoMateriais && topico.topicoMateriais.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="flex items-center w-full">
                                                        <h5 className="font-medium mb-0">Materiais</h5>
                                                        <button
                                                            type="button"
                                                            title="Adicionar material"
                                                            onClick={() => handleOpenAddMaterial(idx)}
                                                            className="ml-2 p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center"
                                                            style={{ width: 28, height: 28 }}
                                                        >
                                                            <i className="pi pi-plus" />
                                                        </button>
                                                    </div>
                                                    <div className="overflow-x-auto px-3 md:px-0">
                                                    <table className="w-full text-sm border-collapse mt-2">
                                                        <thead className="hidden md:table-header-group">
                                                            <tr className="bg-gray-100 md:border-b md:border-gray-300">
                                                                <th className="px-3 py-2 text-left w-1/3">Material</th>
                                                                <th className="px-3 py-2 text-left">Marcas</th>
                                                                <th className="px-3 py-2 text-right" style={{ width: 40 }}>Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topico.topicoMateriais.map((mat, mIdx) => (
                                                                <tr
                                                                    key={`${mat.id ?? mat.materialId ?? 'mat'}-${mIdx}`}
                                                                    className={
                                                                        `block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-200 bg-white md:bg-transparent md:border-b md:border-gray-300 transition-colors duration-150 ease-in-out`
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
                                                                                options={materialsOptions.filter((opt) => {
                                                                                    try {
                                                                                        const val = opt.value as number | undefined | null;
                                                                                        const currentSel = selectedMaterialsMap[Number(mat.id ?? mat.materialId ?? 0)];
                                                                                        if (typeof val === 'number') {
                                                                                            if (typeof currentSel === 'number' && currentSel === val) return true;
                                                                                            const existsInTopic = (topico.topicoMateriais || []).some((m) => {
                                                                                                const mid = Number(m.materialId ?? m.id ?? 0);
                                                                                                const thisRowId = Number(mat.id ?? mat.materialId ?? 0);
                                                                                                const otherRowId = Number(m.id ?? m.materialId ?? 0);
                                                                                                return mid === val && otherRowId !== thisRowId;
                                                                                            });
                                                                                            return !existsInTopic;
                                                                                        }
                                                                                    } catch {}
                                                                                    return true;
                                                                                })}
                                                                                optionLabel="label"
                                                                                optionValue="value"
                                                                                filter
                                                                                onChange={async (e) => {
                                                                                    const newMatId = (e.value as number) ?? null;
                                                                                    await handleMaterialChange(mat.id, newMatId);
                                                                                }}
                                                                                onFilter={(e) => { void loadMaterialOptions(parseFilter(e)); }}
                                                                                placeholder={materialNamesMap[mat.materialId ?? 0] || `Material #${mat.materialId}`}
                                                                                filterPlaceholder="Pesquisar material"
                                                                                className="w-full"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                    <td className="block md:table-cell px-3 py-2">
                                                                        <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Marcas:</span>
                                                                        <span className="block">{(marcasMap[mat.materialId ?? 0] || []).join(', ') || '-'}</span>
                                                                    </td>
                                                                    <td className="block md:table-cell md:pr-0 py-2 md:text-right">
                                                                        <button
                                                                            type="button"
                                                                            title="Remover material"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRemoveMaterial(idx, mIdx);
                                                                            }}
                                                                            className="p-1 rounded bg-red-500 text-white hover:bg-red-700 flex items-center justify-center flex-shrink-0 md:ml-auto"
                                                                            style={{ width: 28, height: 28 }}
                                                                        >
                                                                            <i className="pi pi-times" style={{ fontSize: '0.875rem' }} />
                                                                        </button>
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
                                    {(!detalhe.empreendimentoTopicos || detalhe.empreendimentoTopicos.length === 0) && (
                                        <div className="p-4 border rounded bg-gray-50 text-center">
                                            <p className="text-sm text-gray-600 mb-3">Nenhum tópico cadastrado neste documento.</p>
                                            <div className="flex justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenAddTopico()}
                                                    className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-700"
                                                >
                                                    Adicionar tópico
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </section>
                                {/* Diálogo para adicionar tópico */}
                                <Dialog header="Adicionar tópico" visible={showAddTopicoDialog} style={{ width: '90%', maxWidth: 500 }} modal onHide={() => setShowAddTopicoDialog(false)} footer={<div className="flex justify-end gap-2"><Button label="Cancelar" onClick={() => setShowAddTopicoDialog(false)} className="p-button-secondary" /><Button label="Adicionar" onClick={handleConfirmAddTopico} className="p-button-primary" /></div>}>
                                    <div className="p-2">
                                        <label className="block text-sm font-medium mb-2">Escolha um tópico</label>
                                        <Dropdown value={selectedTopicoToAdd ?? undefined} options={topicosOptions} optionLabel="label" optionValue="value" onChange={(e) => setSelectedTopicoToAdd(e.value as number)} placeholder="Selecione um tópico" className="w-full" />
                                    </div>
                                </Dialog>

                                {/* Diálogo para adicionar ambiente a um tópico (Unidades Privativas / Área Comum) */}
                                <Dialog
                                    header="Adicionar ambiente"
                                    visible={showAddAmbienteDialog}
                                    style={{ width: '90%', maxWidth: 500 }}
                                    modal
                                    onHide={() => setShowAddAmbienteDialog(false)}
                                    footer={
                                        <div className="flex justify-end gap-2">
                                            <Button label="Cancelar" onClick={() => setShowAddAmbienteDialog(false)} className="p-button-secondary" />
                                            <Button label="Adicionar" onClick={handleConfirmAddAmbiente} className="p-button-primary" disabled={selectedAmbientesToAdd.length === 0} />
                                        </div>
                                    }
                                >
                                    <div className="p-2">
                                        <label className="block text-sm font-medium mb-2">Escolha um ambiente</label>
                                        <MultiSelect
                                            value={selectedAmbientesToAdd}
                                            options={ambientesOptions}
                                            optionLabel="label"
                                            optionValue="value"
                                            onChange={(e) => setSelectedAmbientesToAdd(e.value as number[])}
                                            placeholder="Selecione um ou mais ambientes"
                                            className="w-full"
                                            filter
                                            display="chip"
                                        />
                                    </div>
                                </Dialog>

                                {/* Diálogo para adicionar item a um ambiente */}
                                <Dialog
                                    header="Adicionar item"
                                    visible={showAddItemDialog}
                                    style={{ width: '90%', maxWidth: 500 }}
                                    modal
                                    onHide={() => setShowAddItemDialog(false)}
                                    footer={
                                        <div className="flex justify-end gap-2">
                                            <Button label="Cancelar" onClick={() => setShowAddItemDialog(false)} className="p-button-secondary" />
                                            <Button label="Adicionar" onClick={handleConfirmAddItem} className="p-button-primary" disabled={selectedItemsToAdd.length === 0} />
                                        </div>
                                    }
                                >
                                    <div className="p-2">
                                        <label className="block text-sm font-medium mb-2">Escolha um item</label>
                                        <MultiSelect
                                            value={selectedItemsToAdd}
                                            options={addItemOptions.length > 0 ? addItemOptions : itemsOptions}
                                            optionLabel="label"
                                            optionValue="value"
                                            onChange={(e) => setSelectedItemsToAdd(e.value as Item[])}
                                            placeholder="Selecione um ou mais itens"
                                            className="w-full"
                                            filter
                                            display="chip"
                                            onFilter={(e) => { void loadItemOptions(parseFilter(e)); }}
                                        />
                                    </div>
                                </Dialog>

                                {/* Diálogo para adicionar material a um tópico */}
                                <Dialog
                                    header="Adicionar material"
                                    visible={showAddMaterialDialog}
                                    style={{ width: '90%', maxWidth: 500 }}
                                    modal
                                    onHide={() => setShowAddMaterialDialog(false)}
                                    footer={
                                        addMaterialOptions.length === 0 ? (
                                            <div className="flex justify-end gap-2">
                                                <Button label="Fechar" onClick={() => setShowAddMaterialDialog(false)} className="p-button-secondary" />
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <Button label="Cancelar" onClick={() => setShowAddMaterialDialog(false)} className="p-button-secondary" />
                                                <Button label="Adicionar" onClick={handleConfirmAddMaterial} className="p-button-primary" disabled={!selectedMaterialToAdd} />
                                            </div>
                                        )
                                    }
                                >
                                    <div className="p-2">
                                            <label className="block text-sm font-medium mb-2">Escolha um material</label>
                                            <Dropdown
                                                value={selectedMaterialToAdd ?? undefined}
                                                options={addMaterialOptions}
                                                optionLabel="label"
                                                optionValue="value"
                                                onChange={(e) => setSelectedMaterialToAdd(e.value as number)}
                                                placeholder="Selecione um material"
                                                className="w-full"
                                                filter
                                                disabled={addMaterialOptions.length === 0}
                                                onFilter={(e) => { void loadMaterialOptions(parseFilter(e)); }}
                                            />
                                            {addMaterialOptions.length === 0 && (
                                                <p className="text-sm text-gray-500 mt-2">Nenhum material disponível</p>
                                            )}
                                        </div>
                                    </Dialog>

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
                            Deseja alterar o status e salvar as alterações do empreendimento <strong>{detalhe?.nome || selected?.nome || selected?.name || detalhe?.id}</strong> para <strong className="text-yellow-600">{pendingStatus}</strong>?
                        </p>
                    </div>
                </Dialog>
            </div>
        </div>
    );
}