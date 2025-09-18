import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';

import { UserRound } from 'lucide-react'

export default function menu_usuario() {
    const menu = useRef(null);
    const items: MenuItem[] = [
        {
            label: 'Sair',
             url: '/'
        },
        {
            label: 'Configuracoes',
        },
    ];

    return (
        <div className="card flex justify-content-center">
            <TieredMenu model={items} popup ref={menu} breakpoint="700px" />
            <Button label="Usuário" onClick={(e) => menu.current.toggle(e)} 
              icon={<UserRound size={20} color="white" />} 
              iconPos="left"
                unstyled
                    pt={{
                        root: { className: 'bg-red-600 hover:bg-red-700 cursor-pointer text-white p-1 rounded flex gap-2' },
                        label: { className: 'text-white font-bold text-lm' },
                    }}/>
        </div>
    )
}
        