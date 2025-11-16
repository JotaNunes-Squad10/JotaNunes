'use client';

import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/gerenciamentoUser/headerUser/page";
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { empreendimentoService, Empreendimento, itemService, ambienteService, topicoService, marcaMaterialService } from '../../lib/services';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
// Button import removido — usamos botão nativo e menu customizado

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
        // Comentários locais (itemId -> { text, createdAt })
        const [commentsMap, setCommentsMap] = useState<Record<number, { text: string; createdAt: string }>>({});
        // Item atualmente selecionado para criar/editar comentário
        const [selectedCommentItem, setSelectedCommentItem] = useState<number | null>(null);
        // Posição da caixa flutuante {top, left}
        const [commentBoxPos, setCommentBoxPos] = useState<{ top: number; left: number } | null>(null);
        const [tempComment, setTempComment] = useState<string>('');

        // Status options e cores
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

        // Sincroniza status inicial com o detalhe quando carregado
        useEffect(() => {
            setSelectedStatus(detalhe?.status ?? 'Pendente');
        }, [detalhe?.status]);

        // Fecha o menu de status ao clicar fora
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
                // relative luminance
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

                // atualiza estado localmente
                setSelectedStatus(status);
                setDetalhe((prev) => {
                    if (!prev) return prev;
                    return { ...prev, status } as Empreendimento;
                });

                // informar o usuário com Toast
                toast.current?.show({ severity: 'success', summary: 'Status atualizado', detail: `Status alterado para ${status}`, life: 3000 });

                // Remover o empreendimento atualizado da lista local de opções (apenas Pendente deve aparecer)
                const updatedId = detalhe?.id ?? selected?.id;
                if (updatedId) {
                    setOptions((prev) => prev.filter((o) => String(o.value?.id) !== String(updatedId)));
                }

                // limpar seleção/detalhe e comentários locais relacionados
                setSelected(null);
                setDetalhe(null);
                setCommentsMap({});

                // Forçar refresh leve (opcional) — mantemos por compatibilidade
                try { router.refresh(); } catch {}
            } catch (err: unknown) {
                console.error('Erro ao atualizar status no servidor', err);
                const msg = err instanceof Error ? err.message : String(err);
                setStatusError(msg || 'Erro ao atualizar status');
                try { window.alert('Não foi possível atualizar o status: ' + msg); } catch {}
            } finally {
                setSavingStatus(false);
            }
        };

        // Aplica o status pendente (chamado ao confirmar no modal)
        const applyPendingStatus = async () => {
            if (!pendingStatus) {
                setShowConfirmModal(false);
                return;
            }
            // reutiliza a rotina existente
            await handleSelectStatus(pendingStatus);
            setPendingStatus(null);
            setShowConfirmModal(false);
        };

        const cancelPendingStatus = () => {
            setPendingStatus(null);
            setShowConfirmModal(false);
        };


    useEffect(() => {
        // carregar empreendimentos
        (async () => {
            try {
                const data = await empreendimentoService.getAllEmpreendimentos();
                const filtered = data.filter((e) => e.status === 'Pendente');
                const mapped = filtered.map((e) => ({ label: e.nome || e.name || e.descricao || String(e.id), value: e }));
                mapped.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base' }));
                setOptions(mapped);
            } catch (err) {
                console.error('Erro ao carregar empreendimentos', err);
            }
        })();
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

            // Limitar concorrência: buscar em lotes (batch) para evitar sobrecarregar a API
            const idsArray = Array.from(ids);
            const BATCH_SIZE = 10;
            const fetchedMap: Record<number, { nome?: string; descricao?: string }> = {};

            for (let i = 0; i < idsArray.length; i += BATCH_SIZE) {
                const batch = idsArray.slice(i, i + BATCH_SIZE);
                const promises = batch.map((id) => itemService.getItemById(id));
                const results = await Promise.allSettled(promises);
                results.forEach((r, idx) => {
                    const id = batch[idx];
                    if (r.status === 'fulfilled' && r.value) {
                        fetchedMap[id] = { nome: r.value.nome, descricao: r.value.descricao };
                    }
                });
                // Atualizar incrementalmente para permitir render mais rápido
                setItemsMap((prev) => ({ ...prev, ...fetchedMap }));
            }
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

    // Abre a caixa de comentário para um item (clicado)
    const handleOpenComment = (e: React.MouseEvent, itemId: number) => {
        e.stopPropagation();
        // posição baseada no retângulo do elemento clicado
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const padding = 8;
        // tenta posicionar à direita do elemento no viewport; se não couber, posiciona à esquerda
        // getBoundingClientRect() retorna coordenadas relativas ao viewport,
        // e como a caixa é position:fixed usaremos essas coordenadas (sem somar scroll)
        let left = rect.right + padding;
        const top = rect.top; // relativo ao viewport
        const viewportWidth = window.innerWidth;
        const estimatedBoxWidth = 320;

        // se não couber à direita, posiciona à esquerda do elemento
        if (left + estimatedBoxWidth > viewportWidth) {
            left = Math.max(rect.left - estimatedBoxWidth - padding, padding);
        } else {
            // se houver muito espaço entre o início do elemento e o left calculado,
            // aproximamos a caixa para ficar mais próxima da linha (sobrepondo levemente)
            const gap = left - rect.left;
            if (gap > estimatedBoxWidth * 0.4) {
                left = Math.max(rect.right - Math.round(estimatedBoxWidth * 0.6), padding);
            }
        }
        const finalLeft = left;

        setSelectedCommentItem(itemId);
        setCommentBoxPos({ top: top, left: finalLeft });
        setTempComment(commentsMap[itemId]?.text ?? '');
    };

    const handleSaveComment = (itemId: number) => {
        // Atualiza o mapa local e também persiste no localStorage por empreendimento
        const key = `docRevisao_comments_${detalhe?.id ?? 'global'}`;
        if (!tempComment || tempComment.trim() === '') {
            // não salvar comentários vazios: excluir se existir
            setCommentsMap((prev) => {
                const copy = { ...prev };
                delete copy[itemId];
                try {
                    // grava no localStorage
                    const next = { ...copy };
                    localStorage.setItem(key, JSON.stringify(next));
                } catch (err) {
                    console.warn('Erro ao salvar comentários no localStorage', err);
                }
                return copy;
            });
        } else {
            const next = { ...commentsMap, [itemId]: { text: tempComment.trim(), createdAt: new Date().toISOString() } };
            setCommentsMap(next);
            try {
                localStorage.setItem(key, JSON.stringify(next));
            } catch (err) {
                console.warn('Erro ao salvar comentários no localStorage', err);
            }
        }
        setSelectedCommentItem(null);
        setCommentBoxPos(null);
        setTempComment('');
    };

    const handleDeleteComment = (itemId: number) => {
        const key = `docRevisao_comments_${detalhe?.id ?? 'global'}`;
        setCommentsMap((prev) => {
            const copy = { ...prev };
            delete copy[itemId];
            try {
                localStorage.setItem(key, JSON.stringify(copy));
            } catch (err) {
                console.warn('Erro ao salvar comentários no localStorage', err);
            }
            return copy;
        });
        setSelectedCommentItem(null);
        setCommentBoxPos(null);
        setTempComment('');
    };

    // Carrega comentários do localStorage quando um empreendimento (detalhe) é carregado
    useEffect(() => {
        try {
            if (!detalhe?.id) {
                setCommentsMap({});
                return;
            }
            const key = `docRevisao_comments_${detalhe.id}`;
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') setCommentsMap(parsed);
            } else {
                setCommentsMap({});
            }
        } catch (err) {
            console.warn('Erro ao restaurar comentários do localStorage', err);
        }
    }, [detalhe?.id]);

    const handleCloseComment = () => {
        setSelectedCommentItem(null);
        setCommentBoxPos(null);
        setTempComment('');
    };

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
                        className="w-full"
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
                                                // quando não há detalhe selecionado, mostra um espaço vazio para alinhamento
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

                            {/* seção "Unidades / Empreendimentos" removida por conter duplicação dos dados do próprio empreendimento */}

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
                                                                                onClick={(e) => handleOpenComment(e, item.id ?? 0)}
                                                                                title={commentsMap[item.id ?? 0]?.text ?? ''}
                                                                                className={
                                                                                    `block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-300 md:border-b md:border-gray-300 cursor-pointer transition-colors duration-150 ease-in-out ` +
                                                                                    (commentsMap[item.id ?? 0]
                                                                                        ? 'bg-yellow-50 md:bg-gradient-to-r md:from-yellow-200 md:to-orange-100 md:hover:opacity-95 hover:opacity-95'
                                                                                        : 'bg-white md:bg-transparent hover:bg-gray-50')
                                                                                }
                                                                            >
                                                                                <td className="block md:table-cell px-3 py-2 align-top md:pl-3">
                                                                                    <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Item:</span>
                                                                                    <span className="block">{itemsMap[item.itemId ?? 0]?.nome ? itemsMap[item.itemId ?? 0].nome : `Item #${item.itemId}`}</span>
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
                                                                <tr key={mat.id} className="block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-200 bg-white md:bg-transparent md:border-b md:border-gray-300">
                                                                    <td className="block md:table-cell px-3 py-2">
                                                                        <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Material:</span>
                                                                        <span className="block">{materialNamesMap[mat.materialId ?? 0] || `Material #${mat.materialId}`}</span>
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
                                            )}
                                        </section>
                                    ))}
                                </section>
                            )}
                                {/* Caixa flutuante de comentário (fixa, posicionada) */}
                                {selectedCommentItem !== null && commentBoxPos && (
                                    <div style={{ position: 'fixed', top: commentBoxPos.top, left: commentBoxPos.left, width: 340 }} className="z-50">
                                        <div className="bg-white border rounded shadow-lg p-3 text-sm">
                                            <label className="block text-xs font-semibold mb-1">Comentário</label>
                                            <textarea
                                                value={tempComment}
                                                onChange={(ev) => setTempComment(ev.target.value)}
                                                className="w-full h-28 p-2 border rounded text-sm resize-none"
                                            />
                                            <div className="mt-2 flex justify-end gap-2">
                                                <button onClick={() => handleCloseComment()} className="px-3 py-1 text-sm border rounded bg-gray-100">Cancelar</button>
                                                <button onClick={() => selectedCommentItem !== null && handleDeleteComment(selectedCommentItem)} className="px-3 py-1 text-sm border rounded bg-red-50 text-red-600">Excluir</button>
                                                <button onClick={() => selectedCommentItem !== null && handleSaveComment(selectedCommentItem)} className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 rounded">Salvar</button>
                                            </div>
                                        </div>
                                    </div>
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
                            Deseja alterar o status do empreendimento <strong>{detalhe?.nome || selected?.nome || selected?.name || detalhe?.id}</strong> para <strong>{pendingStatus}</strong>?
                        </p>
                    </div>
                </Dialog>
            </div>
        </div>
    );
}