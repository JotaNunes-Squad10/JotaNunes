'use client';

import React, { memo, useCallback } from 'react';
import ItemRow from './ItemRow';
import { Item } from '../../lib/services';

interface AmbienteItem {
    id?: number;
    itemId?: number;
    revisaoItem?: { observacao?: string };
}

interface AmbienteSectionProps {
    ambiente: {
        id?: number;
        ambienteId?: number;
        ambienteItens?: AmbienteItem[];
    };
    ambIdx: number;
    topicoIdx: number;
    ambientesMap: Record<number, { nome?: string; descricao?: string }>;
    itemsMap: Record<number, { nome?: string; descricao?: string }>;
    itemsOptions: Array<{ label: string; value: Item }>;
    selectedItemsMap: Record<number, Item | null>;
    commentsMap: Record<string, { text: string; createdAt: string }>;
    onAddItem: (topicoIdx: number, ambIdx: number) => void;
    onRemoveAmbiente: (topicoIdx: number, ambIdx: number) => void;
    onRemoveItem: (topicoIdx: number, ambIdx: number, itemIdx: number) => void;
    onItemChange: (itemId: number | undefined, newItem: Item | null) => Promise<void>;
    onOpenComment: (e: React.MouseEvent, key: string) => void;
    loadItemOptions: (filter: string) => void;
}

const AmbienteSection = memo(function AmbienteSection({
    ambiente,
    ambIdx,
    topicoIdx,
    ambientesMap,
    itemsMap,
    itemsOptions,
    selectedItemsMap,
    commentsMap,
    onAddItem,
    onRemoveAmbiente,
    onRemoveItem,
    onItemChange,
    onOpenComment,
    loadItemOptions,
}: AmbienteSectionProps) {
    const handleAddItem = useCallback(() => {
        onAddItem(topicoIdx, ambIdx);
    }, [topicoIdx, ambIdx, onAddItem]);

    const handleRemoveAmbiente = useCallback(() => {
        onRemoveAmbiente(topicoIdx, ambIdx);
    }, [topicoIdx, ambIdx, onRemoveAmbiente]);

    const handleRemoveItem = useCallback((itemIdx: number) => {
        onRemoveItem(topicoIdx, ambIdx, itemIdx);
    }, [topicoIdx, ambIdx, onRemoveItem]);

    return (
        <div className="mb-3 bg-gray-100 md:bg-transparent p-3 md:p-0 rounded">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                    <h5 className="font-medium mb-0">
                        {ambientesMap[ambiente.ambienteId ?? 0]?.nome || `Ambiente ${ambiente.ambienteId ?? ambiente.id}`}
                    </h5>
                    <button
                        type="button"
                        title="Adicionar item"
                        onClick={handleAddItem}
                        className="p-1 rounded bg-green-500 text-white hover:bg-green-700 flex items-center justify-center flex-shrink-0"
                        style={{ width: 28, height: 28 }}
                    >
                        <i className="pi pi-plus" />
                    </button>
                </div>
                <button
                    type="button"
                    title="Remover ambiente"
                    onClick={handleRemoveAmbiente}
                    className="p-1 rounded bg-red-500 text-white hover:bg-red-700 flex items-center justify-center flex-shrink-0"
                    style={{ width: 28, height: 28 }}
                >
                    <i className="pi pi-times" />
                </button>
            </div>

            {ambiente.ambienteItens && ambiente.ambienteItens.length > 0 ? (
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
                            {ambiente.ambienteItens.map((item, itemIdx) => (
                                <ItemRow
                                    key={`${item.id ?? item.itemId ?? 'item'}-${itemIdx}`}
                                    item={item}
                                    itemIdx={itemIdx}
                                    itemsMap={itemsMap}
                                    itemsOptions={itemsOptions}
                                    selectedItemsMap={selectedItemsMap}
                                    hasComment={!!commentsMap[`item:${item.id ?? 0}`]}
                                    onItemChange={onItemChange}
                                    onRemoveItem={handleRemoveItem}
                                    onOpenComment={onOpenComment}
                                    loadItemOptions={loadItemOptions}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-gray-500">Nenhum item cadastrado neste ambiente.</p>
            )}
        </div>
    );
});

export default AmbienteSection;
