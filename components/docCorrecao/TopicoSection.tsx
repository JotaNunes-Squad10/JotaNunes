'use client';

import React, { memo, useCallback, useMemo } from 'react';
import AmbienteSection from './AmbienteSection';
import MaterialRow from './MaterialRow';
import { Item } from '../../lib/services';

interface AmbienteItem {
    id?: number;
    itemId?: number;
    revisaoItem?: { observacao?: string };
}

interface TopicoAmbiente {
    id?: number;
    ambienteId?: number;
    ambienteItens?: AmbienteItem[];
}

interface TopicoMaterial {
    id?: number;
    materialId?: number;
}

interface TopicoData {
    id?: number;
    topicoId?: number;
    posicao?: number;
    topicoAmbientes?: TopicoAmbiente[];
    topicoMateriais?: TopicoMaterial[];
}

interface TopicoSectionProps {
    topico: TopicoData;
    idx: number;
    topicosMap: Record<number, { nome?: string; descricao?: string }>;
    ambientesMap: Record<number, { nome?: string; descricao?: string }>;
    itemsMap: Record<number, { nome?: string; descricao?: string }>;
    itemsOptions: Array<{ label: string; value: Item }>;
    selectedItemsMap: Record<number, Item | null>;
    materialsOptions: Array<{ label: string; value: number | undefined }>;
    selectedMaterialsMap: Record<number, number | null>;
    materialNamesMap: Record<number, string>;
    marcasMap: Record<number, string[]>;
    commentsMap: Record<string, { text: string; createdAt: string }>;
    onAddAmbiente: (topicoIdx: number) => void;
    onAddItem: (topicoIdx: number, ambIdx: number) => void;
    onAddMaterial: (topicoIdx: number) => void;
    onRemoveTopico: (topicoIdx: number) => void;
    onRemoveAmbiente: (topicoIdx: number, ambIdx: number) => void;
    onRemoveItem: (topicoIdx: number, ambIdx: number, itemIdx: number) => void;
    onRemoveMaterial: (topicoIdx: number, mIdx: number) => void;
    onItemChange: (itemId: number | undefined, newItem: Item | null) => Promise<void>;
    onMaterialChange: (materialId: number | undefined, newMaterialId: number | null) => Promise<void>;
    onOpenComment: (e: React.MouseEvent, key: string) => void;
    loadItemOptions: (filter: string) => void;
    loadMaterialOptions: (filter: string) => void;
}

const TopicoSection = memo(function TopicoSection({
    topico,
    idx,
    topicosMap,
    ambientesMap,
    itemsMap,
    itemsOptions,
    selectedItemsMap,
    materialsOptions,
    selectedMaterialsMap,
    materialNamesMap,
    marcasMap,
    commentsMap,
    onAddAmbiente,
    onAddItem,
    onAddMaterial,
    onRemoveTopico,
    onRemoveAmbiente,
    onRemoveItem,
    onRemoveMaterial,
    onItemChange,
    onMaterialChange,
    onOpenComment,
    loadItemOptions,
    loadMaterialOptions,
}: TopicoSectionProps) {
    const topicoName = topicosMap[topico.topicoId ?? 0]?.nome || `Tópico ${topico.topicoId ?? topico.id}`;
    const tname = topicoName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    
    const isUnidadesPrivativas = tname.includes('unidades privativas') || tname.includes('unidade privativa');
    const isAreaComum = tname.includes('area comum') || tname.includes('área comum');
    const isMarcas = tname.includes('marca') || tname.includes('marcas');

    const handleAddAmbiente = useCallback(() => {
        onAddAmbiente(idx);
    }, [idx, onAddAmbiente]);

    const handleAddMaterial = useCallback(() => {
        onAddMaterial(idx);
    }, [idx, onAddMaterial]);

    const handleRemoveTopico = useCallback(() => {
        onRemoveTopico(idx);
    }, [idx, onRemoveTopico]);

    const handleRemoveMaterial = useCallback((mIdx: number) => {
        onRemoveMaterial(idx, mIdx);
    }, [idx, onRemoveMaterial]);

    // Deduplica ambientes
    const uniqueAmbientes = useMemo(() => {
        const seen = new Set<string>();
        return (topico.topicoAmbientes || []).filter((a, i) => {
            const key = String(a.ambienteId ?? a.id ?? i);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [topico.topicoAmbientes]);

    return (
        <section className="mb-4 border p-3 rounded bg-gray-50">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold mb-0">{topicoName}</h4>
                    {/* Botões de adicionar baseados no tipo de tópico */}
                    {(isUnidadesPrivativas || isAreaComum) && (
                        <button
                            type="button"
                            title="Adicionar ambiente"
                            onClick={handleAddAmbiente}
                            className="p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center flex-shrink-0"
                            style={{ width: 28, height: 28 }}
                        >
                            <i className="pi pi-plus" />
                        </button>
                    )}
                    {isMarcas && (
                        <button
                            type="button"
                            title="Adicionar material"
                            onClick={handleAddMaterial}
                            className="p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center flex-shrink-0"
                            style={{ width: 28, height: 28 }}
                        >
                            <i className="pi pi-plus" />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    title="Remover tópico"
                    onClick={handleRemoveTopico}
                    className="p-1 rounded bg-red-500 text-white hover:bg-red-700 flex items-center justify-center flex-shrink-0"
                    style={{ width: 28, height: 28 }}
                >
                    <i className="pi pi-times" />
                </button>
            </div>

            {/* Ambientes */}
            {uniqueAmbientes.length > 0 && (
                <div className="mt-2">
                    {uniqueAmbientes.map((amb, ambIdx) => (
                        <AmbienteSection
                            key={String(amb.ambienteId ?? amb.id ?? ambIdx)}
                            ambiente={amb}
                            ambIdx={ambIdx}
                            topicoIdx={idx}
                            ambientesMap={ambientesMap}
                            itemsMap={itemsMap}
                            itemsOptions={itemsOptions}
                            selectedItemsMap={selectedItemsMap}
                            commentsMap={commentsMap}
                            onAddItem={onAddItem}
                            onRemoveAmbiente={onRemoveAmbiente}
                            onRemoveItem={onRemoveItem}
                            onItemChange={onItemChange}
                            onOpenComment={onOpenComment}
                            loadItemOptions={loadItemOptions}
                        />
                    ))}
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
                            onClick={handleAddMaterial}
                            className="ml-2 p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center"
                            style={{ width: 28, height: 28 }}
                        >
                            <i className="pi pi-plus" />
                        </button>
                    </div>
                    <div className="md:overflow-x-auto px-0 md:px-0">
                        <table className="block md:table w-full text-sm border-collapse mt-2">
                            <thead className="hidden md:table-header-group">
                                <tr className="bg-gray-100 md:border-b md:border-gray-300">
                                    <th className="px-3 py-2 text-left w-1/3">Material</th>
                                    <th className="px-3 py-2 text-left">Marcas</th>
                                    <th className="px-3 py-2 text-right" style={{ width: 40 }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topico.topicoMateriais.map((mat, mIdx) => (
                                    <MaterialRow
                                        key={`${mat.id ?? mat.materialId ?? mIdx}`}
                                        material={mat}
                                        mIdx={mIdx}
                                        materialNamesMap={materialNamesMap}
                                        marcasMap={marcasMap}
                                        materialsOptions={materialsOptions}
                                        selectedMaterialsMap={selectedMaterialsMap}
                                        topicoMateriais={topico.topicoMateriais || []}
                                        onMaterialChange={onMaterialChange}
                                        onRemoveMaterial={handleRemoveMaterial}
                                        loadMaterialOptions={loadMaterialOptions}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    );
});

export default TopicoSection;
