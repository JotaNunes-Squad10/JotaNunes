import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';


import { Plus  } from 'lucide-react'

export default function Menu_acoes_rapidas() {
    const menu = useRef(null);
    const items: MenuItem[] = [
        {
            label: 'Criar Novo Documento',
             url: ''
        },
        {
            label: 'Criar a partir de modelo',
        },
    ];

    return (
        <div className="card flex justify-content-center">
            <TieredMenu model={items} popup ref={menu} breakpoint="700px" />
            <Button label="Começar" onClick={(e) => menu.current.toggle(e)} 
              icon={<Plus  size={20} color="white" />} 
              iconPos="left"
                unstyled
                    pt={{
                        root: { className: 'bg-red-600 hover:bg-red-700 cursor-pointer text-white p-1 rounded flex gap-2 w-full flex items-center justify-center' },
                        label: { className: 'text-white  font-bold text-lm' },
                    }}/>
        </div>
    )
}