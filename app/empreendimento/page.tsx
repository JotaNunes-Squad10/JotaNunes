"use client";

import React from "react";
import Sidebar from "@/components/sections/Sidebar";
import Button from "@/components/sections/Button";
import DropDown from "@/components/sections/DropBox";
import DropBoxSubSelect from "@/components/sections/DropBoxSubSelect";
import SelectedEdit from "@/components/sections/SelectedEdit";
import CustomTable from "@/components/tableInfo/page";
import ObserverComponent from "@/components/ObserverComponent/page";

const EmpreendimentoPage: React.FC = () => {
  return (
    <div>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 bg-white p-6 shadow-md overflow-auto">
          <h2 className="text-black font-semibold mb-4">Adicionar Itens</h2>
          <div>
            <div>
              <DropDown
                options={[
                  "1. Unidades Privativas",
                  "2. Área Comum",
                  "3. Marcas",
                ]}
              />
              <DropBoxSubSelect options={["Opção 1", "Opção 2"]} />
            </div>

            <div>
              <label className="text-black">Item</label>
              <div className="flex items-center flex-col mr-120">
                <SelectedEdit />

                <Button
                  color="green"
                  onClick={() => alert("Botão foi clicado")}
                >
                  Adicionar Item
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <CustomTable />
            </div>
            <div>
              <ObserverComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpreendimentoPage;
