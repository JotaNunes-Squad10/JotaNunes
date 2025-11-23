"use client";
import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';
import { Plus } from 'lucide-react';
import { useCopiarEmpreendimento } from "@/components/copiarEmpreendimento/useCopiarEmpreendimento";

export default function Menu_acoes_rapidas() {
    const menu = useRef<TieredMenu | null>(null);


    const { copiarEmpreendimento } = useCopiarEmpreendimento();

    const items: MenuItem[] = [
        {
            label: 'Criar Novo Documento',
            url: '/createEmpreendimento'
        },
        {
            label: "Criar a partir do Padrão - Mais Viver",
            command: () => copiarEmpreendimento("019aadc9-498d-74f6-9df2-ef0a1186f587")
        },
        {
            label: 'Criar a partir do Padrão - Residence',
            command: () => copiarEmpreendimento("019ab20d-5262-74dc-8770-eac753dd884f")
        },
        {
            label: "Criar a partir do Padrão - Vida Bela",
            command: () => copiarEmpreendimento("5aa5b2a6-2961-4a08-9049-71aafc9f9e22")
        },
    ];

    return (
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
    );
}