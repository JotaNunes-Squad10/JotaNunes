"use client";
import React, { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';
import { Dialog } from 'primereact/dialog';
import { Plus } from 'lucide-react';
import { useCopiarEmpreendimento } from "@/components/copiarEmpreendimento/useCopiarEmpreendimento";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Menu_acoes_rapidas() {
    const menu = useRef<TieredMenu | null>(null);

    const router = useRouter();

    async function validarPermissao() {
        const token = getCookie("accessToken");

        if (!token || typeof token !== "string") {
            toast.error("Token inválido ou usuário não autenticado!");
            return null;
        }

        try {
            interface MyJwtPayload {
                groups?: string[];
            }

            const decoded = jwtDecode<MyJwtPayload>(token);

            const grupo = decoded.groups?.[0];

            const mapPerfil: Record<string, number> = {
                Administrador: 1,
                Gestor: 2,
                Operador: 3,
            };

            if (!grupo) return null;

            return mapPerfil[grupo] ?? null;

        } catch {
            toast.error("Erro ao validar autenticação.");
            return null;
        }
    }

    const criarNovoDocumento = async () => {
        const perfil = await validarPermissao();

        if (perfil !== 1 && perfil !== 3) {
            toast.warning("Usuário sem permissão para criar documento");
            return;
        }

        router.push("/createEmpreendimento");
    };

    const { copiarEmpreendimento } = useCopiarEmpreendimento();

    // --- ESTADOS DO MODAL ---
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPadraoId, setSelectedPadraoId] = useState<string | null>(null);
    const [savingStatus, setSavingStatus] = useState(false);

    const [selectedPadraoName, setSelectedPadraoName] = useState<string | null>(null);

    const openConfirmModal = async (padraoId: string, padraoName: string) => {
        const perfil = await validarPermissao();

        // Somente Administrador (1) ou Operador (3)
        if (perfil !== 1 && perfil !== 3) {
            toast.warning("Usuário sem permissão para criar documento");
            return;
        }

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
            command: criarNovoDocumento
        },
        {
            label: "Criar a partir do Padrão - Mais Viver",
            command: () => openConfirmModal("019ac5a0-91c0-7fbf-81a0-9802917f6e60", "Padrão - Mais Viver")
        },
        {
            label: 'Criar a partir do Padrão - Residence',
            command: () => openConfirmModal("019ac59f-87db-7432-9062-b789d7bd0e2d", "Padrão - Residence")
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
            <ToastContainer autoClose={2000} theme="colored" />
        </>
    );
}