'use client';

import React, { memo, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';

interface MaterialRowProps {
    material: {
        id?: number;
        materialId?: number;
    };
    mIdx: number;
    materialNamesMap: Record<number, string>;
    marcasMap: Record<number, string[]>;
    materialsOptions: Array<{ label: string; value: number | undefined }>;
    selectedMaterialsMap: Record<number, number | null>;
    topicoMateriais: Array<{ id?: number; materialId?: number }>;
    onMaterialChange: (materialId: number | undefined, newMaterialId: number | null) => Promise<void>;
    onRemoveMaterial: (mIdx: number) => void;
    loadMaterialOptions: (filter: string) => void;
}

const MaterialRow = memo(function MaterialRow({
    material,
    mIdx,
    materialNamesMap,
    marcasMap,
    materialsOptions,
    selectedMaterialsMap,
    topicoMateriais,
    onMaterialChange,
    onRemoveMaterial,
    loadMaterialOptions,
}: MaterialRowProps) {
    const matId = Number(material.id ?? material.materialId ?? 0);
    
    const handleDropdownChange = useCallback(async (e: { value: unknown }) => {
        const newMatId = (e.value as number) ?? null;
        await onMaterialChange(material.id, newMatId);
    }, [material.id, onMaterialChange]);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onRemoveMaterial(mIdx);
    }, [mIdx, onRemoveMaterial]);

    const handleFilter = useCallback((e: { filter?: string }) => {
        loadMaterialOptions(e.filter ?? '');
    }, [loadMaterialOptions]);

    const filteredOptions = materialsOptions.filter((opt) => {
        try {
            const val = opt.value as number | undefined | null;
            const currentSel = selectedMaterialsMap[matId];
            if (typeof val === 'number') {
                if (typeof currentSel === 'number' && currentSel === val) return true;
                const existsInTopic = topicoMateriais.some((m) => {
                    const mid = Number(m.materialId ?? m.id ?? 0);
                    const thisRowId = matId;
                    const otherRowId = Number(m.id ?? m.materialId ?? 0);
                    return mid === val && otherRowId !== thisRowId;
                });
                return !existsInTopic;
            }
        } catch { /* ignore */ }
        return true;
    });

    return (
        <tr
            className="block md:table-row mb-3 md:mb-0 hover:bg-gray-100 rounded md:rounded-none border-b border-gray-200 bg-gray-100 md:bg-transparent md:border-b md:border-gray-300 transition-colors duration-150 ease-in-out"
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
                        value={selectedMaterialsMap[matId] ?? null}
                        options={filteredOptions}
                        optionLabel="label"
                        optionValue="value"
                        filter
                        onChange={handleDropdownChange}
                        onFilter={handleFilter}
                        placeholder={materialNamesMap[material.materialId ?? 0] || `Material #${material.materialId}`}
                        filterPlaceholder="Pesquisar material"
                        className="w-full"
                    />
                </div>
            </td>
            <td className="block md:table-cell px-3 py-2">
                <span className="md:hidden inline-block w-28 font-semibold text-gray-700">Marcas:</span>
                <span className="block">{(marcasMap[material.materialId ?? 0] || []).join(', ') || '-'}</span>
            </td>
            <td className="block md:table-cell md:pr-0 py-2 md:text-right">
                <button
                    type="button"
                    title="Remover material"
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

export default MaterialRow;
