"use client";
import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';
import { Dialog } from 'primereact/dialog';
import { Plus } from 'lucide-react';
import { useCopiarEmpreendimento } from "@/components/copiarEmpreendimento/useCopiarEmpreendimento";

export default function Menu_acoes_rapidas() {
    const menu = useRef<TieredMenu | null>(null);

    const { copiarEmpreendimento } = useCopiarEmpreendimento();

    // --- ESTADOS DO MODAL ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPadraoId, setSelectedPadraoId] = useState<string | null>(null);
    const [savingStatus, setSavingStatus] = useState(false);

    const [selectedPadraoName, setSelectedPadraoName] = useState<string | null>(null);

    const openConfirmModal = (padraoId: string, padraoName: string) => {
        setSelectedPadraoId(padraoId);
        setSelectedPadraoName(padraoName);
        setShowConfirmModal(true);
    };

    // Fecha modal
    const cancelConfirmModal = () => {
        setShowConfirmModal(false);
        setSelectedPadraoId(null);
    };

    // Confirma e executa a cópia
    const applyCopy = async () => {
        if (!selectedPadraoId) return;

        try {
            setSavingStatus(true);
            await copiarEmpreendimento(selectedPadraoId);
        } finally {
            setSavingStatus(false);
            setShowConfirmModal(false);
        }
    };

    // --- ITENS DO MENU ---
    const items: MenuItem[] = [
        {
            label: 'Criar Novo Documento',
            url: '/createEmpreendimento'
        },
        {
            label: "Criar a partir do Padrão - Mais Viver",
            command: () => openConfirmModal("019aadc9-498d-74f6-9df2-ef0a1186f587", "Padrão - Mais Viver")
        },
        {
            label: 'Criar a partir do Padrão - Residence',
            command: () => openConfirmModal("019ab20d-5262-74dc-8770-eac753dd884f", "Padrão - Residence")
        },
        {
            label: "Criar a partir do Padrão - Vida Bela",
            command: () => openConfirmModal("5aa5b2a6-2961-4a08-9049-71aafc9f9e22", "Padrão - Vida Bela")
        },
    ];

    return (
        <>
            <div className="card flex justify-content-center">
                <TieredMenu model={items} popup ref={menu} breakpoint="700px" />

                <Button
                    label="Começar"
                    onClick={(e) => menu.current?.toggle(e)}
                    icon={<Plus size={20} color="white" />}
                    iconPos="left"
                    unstyled
                    pt={{
                        root: {
                            className:
                                'bg-red-600 hover:bg-red-700 cursor-pointer text-white p-1 rounded flex gap-2 w-full flex items-center justify-center'
                        },
                        label: { className: 'text-white font-bold text-lm' },
                    }}
                />
            </div>

            {/* --- MODAL DE CONFIRMAÇÃO --- */}
            <Dialog
                header="Confirmar criação"
                visible={showConfirmModal}
                style={{ width: '90%', maxWidth: '520px' }}
                modal
                onHide={cancelConfirmModal}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Cancelar"
                            onClick={cancelConfirmModal}
                            className="p-button-secondary"
                        />
                        <Button
                            label={savingStatus ? 'Criando...' : 'Confirmar'}
                            icon={savingStatus ? 'pi pi-spin pi-spinner' : undefined}
                            iconPos="left"
                            onClick={applyCopy}
                            disabled={savingStatus}
                            className="p-button-danger"
                        />
                    </div>
                }
            >
                <div className="px-1 py-2 text-sm">
                    <p>
                        Deseja criar um novo empreendimento a partir de
                        {" "}
                        <strong className="text-yellow-600">{selectedPadraoName}</strong> ?
                    </p>
                </div>
            </Dialog>
        </>
    );
}