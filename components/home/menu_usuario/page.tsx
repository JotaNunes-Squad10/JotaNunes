import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';

import { UserRound } from 'lucide-react'

interface MenuUsuarioProps {
  userName: string;
}

export default function Menu_usuario({ userName }: MenuUsuarioProps) {
    const menu = useRef<TieredMenu>(null);

    const items: MenuItem[] = [
        {
            label: 'Sair',
             url: '/'
        },
        {
            label: 'Mudar senha',
        },
    ];

return (
    <div className="flex items-center gap-1 sm:gap-2 flex-nowrap cursor-pointer">
      {/* Menu invisível, só aparece no clique */}
      <TieredMenu model={items} popup ref={menu} breakpoint="700px" />

      {/* Container que abre o menu */}
      <div
        onClick={(e) => menu.current?.toggle(e)}
        className="flex items-center gap-1 sm:gap-2"
      >
        <UserRound size={22} className="text-gray-700" />
        <span className="text-xs sm:text-base truncate max-w-[120px] sm:max-w-xs">
          Bem-vindo(a), <span className="font-semibold">{userName}</span>
        </span>
      </div>
    </div>
  );
}
        