import Layout from "@/app/layout";
import React from "react";
import Sidebar from "@/components/sections/Sidebar";
import { section } from "@/types/sections";

const EmpreendimentoPage: React.FC = () => {
  return (
    <Layout>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 bg-white p-6  shadow-md overflow-auto">
          <h2 className="text-black font-semibold mb-4">
            Adicionar Itens
          </h2>
          
        </div>
      </div>
    </Layout>
  );
};

export default EmpreendimentoPage;
