"use client";

import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export default function SideBarCreate() {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div className="card flex justify-content-center">
      <Sidebar
        visible={visible}
        onHide={() => setVisible(false)}
        className="w-full md:w-20rem lg:w-30rem"
      >
        <div className="flex flex-col space-y-2">
          <button
            type="button"
            className="
            flex items-center justify-center
            w-full py-4 px-2
            text-blue-600 font-semibold
            bg-white transition duration-150
            border-2 border border-blue-500
            rounded-xl
            hover:bg-red-50/70 hover:border-red-500 hover:text-red-600
            cursor-pointer
            "
          >
            <i className="pi pi-plus mr-3 text-lg" />
            Criar tópicos
          </button>
          <button
            type="button"
            className="
            flex items-center justify-center
            w-full py-4 px-2
            text-blue-600 font-semibold
            bg-white transition duration-150
            border-2 border border-blue-500
            rounded-xl
            hover:bg-red-50/70 hover:border-red-500 hover:text-red-600
            cursor-pointer
            "
          >
            <i className="pi pi-plus mr-3 text-lg" />
            Criar ambiente
          </button>
          <button
            type="button"
            className="
            flex items-center justify-center
            w-full py-4 px-2
            text-blue-600 font-semibold
            bg-white transition duration-150
            border-2 border border-blue-500
            rounded-xl
            hover:bg-red-50/70 hover:border-red-500 hover:text-red-600
            cursor-pointer
            "
          >
            <i className="pi pi-plus mr-3 text-lg" />
            Criar marcas
          </button>
        </div>
      </Sidebar>
      <Button
        icon="pi pi-bars"
        onClick={() => setVisible(true)}
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "4px",
          marginLeft: "10vw", // 10% da largura da tela
        }}
      />
    </div>
  );
}
