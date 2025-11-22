"use client";

import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu';
import { MenuItem } from 'primereact/menuitem';
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

import { Plus  } from 'lucide-react'

interface JwtPayload {
  groups?: string[];
}

export default function Menu_acoes_rapidas() {
    const menu = useRef(null);

    const token = Cookies.get("accessToken");
    let isAdmin = false;
    let isOperador = false;

    if (token) {
      try {   
        const payload = jwtDecode<JwtPayload>(token);

        if (payload.groups?.includes("Administrador")) {
          isAdmin = true;
        } 
        if (payload.groups?.includes("Operador")) {
            isOperador = true;
        }

      } catch (err) {
        console.error("Erro ao decodificar JWT:", err);
      }
    }

    const items: MenuItem[] = [

        ...(isAdmin || isOperador 
        ? [
             {
                label: 'Criar Novo Documento',
                url: ''
            },

            {
                label: 'Criar a partir do Padrão Torre PC - Mais Viver',
            },

            {
                label: 'Criar a partir do Padrão Torre PC - Residence',
            },

            {
                label: 'Criar a partir do Padrão Sobrado PC - Mais Viver',
            },
        ]
         : [

            {
                label: 'Você não tem permissão para criar um novo documento',
            },
         ]),
        ]

    
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