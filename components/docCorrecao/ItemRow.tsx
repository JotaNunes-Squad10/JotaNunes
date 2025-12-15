'use client';

import React, { memo, useCallback } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Item } from '../../lib/services';

interface ItemRowProps {
    item: {
        id?: number;
        itemId?: number;
        revisaoItem?: { observacao?: string };
    };
    itemIdx: number;
    itemsMap: Record<number, { nome?: string; descricao?: string }>;
    itemsOptions: Array<{ label: string; value: Item }>;
    selectedItemsMap: Record<number, Item | null>;
    hasComment: boolean;
    onItemChange: (itemId: number | undefined, newItem: Item | null) => Promise<void>;
    onRemoveItem: (itemIdx: number) => void;
    onOpenComment: (e: React.MouseEvent, key: string) => void;
    loadItemOptions: (filter: string) => void;
}

const ItemRow = memo(function ItemRow({
    item,
    itemIdx,
    itemsMap,
    itemsOptions,
    selectedItemsMap,
    hasComment,
    onItemChange,
    onRemoveItem,
    onOpenComment,
    loadItemOptions,
}: ItemRowProps) {
    const itemKey = `item:${item.id ?? item.itemId ?? itemIdx}`;
    const itemId = Number(item.id ?? 0);
    
    const handleDropdownChange = useCallback(async (e: DropdownChangeEvent) => {
        const newItem = e.value as Item | null;
        await onItemChange(item.id, newItem);
    }, [item.id, onItemChange]);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onRemoveItem(itemIdx);
    }, [itemIdx, onRemoveItem]);

    const handleRowClick = useCallback((e: React.MouseEvent) => {
        onOpenComment(e, itemKey);
    }, [itemKey, onOpenComment]);

    const handleFilter = useCallback((e: { filter?: string }) => {
        loadItemOptions(e.filter ?? '');
    }, [loadItemOptions]);

    const filteredOptions = itemsOptions.filter((opt) => {
        try {
            const val = opt.value as Item | undefined | null;
            const optId = val && typeof val.id === 'number' ? Number(val.id) : undefined;
            const currentSel = selectedItemsMap[itemId];
            if (typeof optId === 'number') {
                if (currentSel && currentSel.id === optId) return true;
                return !Object.values(selectedItemsMap).some((v) => v && typeof v.id === 'number' && Number(v.id) === optId);
            }
        } catch { /* ignore */ }
        return true;
    });

    return (
        <tr
            onClick={handleRowClick}
            className={
                `block md:table-row mb-3 md:mb-0 rounded md:rounded-none border-b border-gray-300 md:border-b md:border-gray-300 cursor-pointer transition-colors duration-150 ease-in-out ` +
                (hasComment
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
                            value={selectedItemsMap[itemId] ?? null}
                            options={filteredOptions}
                            onChange={handleDropdownChange}
                            optionLabel="label"
                            filter
                            onFilter={handleFilter}
                            placeholder={itemsMap[item.itemId ?? 0]?.nome || `Item #${item.itemId}`}
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
                    onClick={handleRemove}
                    className="p-1 rounded bg-red-500 text-white hover:bg-red-700 flex items-center justify-center flex-shrink-0 md:ml-auto"
                    style={{ width: 28, height: 28 }}
                >
                    <i className="pi pi-times" style={{ fontSize: '0.875rem' }} />
                </button>
            </td>
        </tr>
    );
});

export default ItemRow;
