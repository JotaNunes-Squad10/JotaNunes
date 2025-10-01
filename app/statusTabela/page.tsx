"use client";

import React, {useState} from "react";
import { Box } from "@mui/material";

import Header from "../../components/headerUser/page";
import StatusSummary from "../../components/home/status/page";
import EmpreendimentosTable, { Empreendimento } from "../../components/listaStatus/page";


// Dados mockados
const mockEmpreendimentos: Empreendimento[] = [
  // 12 Editando
  { id: 1, nome: "Construção 1", ultimaAlteracao: "01/01/2024", versao: "1.0", usuario: "Maria", status: "Editando" },
  { id: 2, nome: "Construção 2", ultimaAlteracao: "02/01/2025", versao: "1.1", usuario: "João", status: "Editando" },
  { id: 3, nome: "Construção 3", ultimaAlteracao: "14/02/2025", versao: "1.0", usuario: "Maria", status: "Editando" },
  { id: 10, nome: "Construção 10", ultimaAlteracao: "10/01/2025", versao: "2.0", usuario: "Carlos", status: "Editando" },
  { id: 11, nome: "Construção 11", ultimaAlteracao: "11/01/2025", versao: "1.5", usuario: "Ana", status: "Editando" },
  { id: 12, nome: "Construção 12", ultimaAlteracao: "12/01/2025", versao: "1.2", usuario: "Pedro", status: "Editando" },
  { id: 13, nome: "Construção 13", ultimaAlteracao: "13/01/2025", versao: "1.8", usuario: "João", status: "Editando" },
  { id: 14, nome: "Construção 14", ultimaAlteracao: "14/01/2025", versao: "2.1", usuario: "Maria", status: "Editando" },
  { id: 15, nome: "Construção 15", ultimaAlteracao: "15/01/2025", versao: "1.3", usuario: "Carlos", status: "Editando" },
  { id: 16, nome: "Construção 16", ultimaAlteracao: "16/01/2025", versao: "1.7", usuario: "Ana", status: "Editando" },
  { id: 17, nome: "Construção 17", ultimaAlteracao: "17/01/2025", versao: "2.2", usuario: "Pedro", status: "Editando" },
  { id: 18, nome: "Construção 18", ultimaAlteracao: "18/01/2025", versao: "1.9", usuario: "João", status: "Editando" },
  
  // 3 Pendente
  { id: 4, nome: "Construção 4", ultimaAlteracao: "04/01/2025", versao: "1.2", usuario: "Pedro", status: "Pendente" },
  { id: 5, nome: "Construção 5", ultimaAlteracao: "05/01/2025", versao: "1.0", usuario: "Ana", status: "Pendente" },
  { id: 19, nome: "Construção 19", ultimaAlteracao: "19/01/2025", versao: "2.3", usuario: "Carlos", status: "Pendente" },
  
  // 3 Revisao
  { id: 6, nome: "Construção 6", ultimaAlteracao: "06/01/2025", versao: "1.3", usuario: "João", status: "Revisao" },
  { id: 20, nome: "Construção 20", ultimaAlteracao: "20/01/2025", versao: "1.6", usuario: "Maria", status: "Revisao" },
  { id: 21, nome: "Construção 21", ultimaAlteracao: "21/01/2025", versao: "2.4", usuario: "Pedro", status: "Revisao" },
  
  // 5 Aprovados
  { id: 7, nome: "Construção 7", ultimaAlteracao: "07/01/2025", versao: "1.0", usuario: "Maria", status: "Aprovados" },
  { id: 8, nome: "Construção 8", ultimaAlteracao: "08/01/2025", versao: "1.4", usuario: "Pedro", status: "Aprovados" },
  { id: 22, nome: "Construção 22", ultimaAlteracao: "22/01/2025", versao: "1.1", usuario: "Ana", status: "Aprovados" },
  { id: 23, nome: "Construção 23", ultimaAlteracao: "23/01/2025", versao: "2.5", usuario: "João", status: "Aprovados" },
  { id: 24, nome: "Construção 24", ultimaAlteracao: "24/01/2025", versao: "1.8", usuario: "Carlos", status: "Aprovados" },
  
  // 1 Cancelados
  { id: 9, nome: "Construção 9", ultimaAlteracao: "09/01/2025", versao: "1.0", usuario: "Ana", status: "Cancelados" }
];


const StatusTabela: React.FC = () => {

    const [filtroAtivo, setFiltroAtivo] = useState<string>("Editando");
    const [searchTerm, setSearchTerm] = useState<string>("");

    const handleFiltroChange = (filtro: string) => {
    setFiltroAtivo(filtro);
    setSearchTerm(""); // Limpa a busca quando muda o filtro
  };

  return (
    <>
      <Header />
      <Box sx={{ px: 4, py: 2 }}>
        {/* Status */}
        <Box mb={3}>
          <StatusSummary />
        </Box>

        {/* Tabela de Empreendimentos */}
        <Box>
          <EmpreendimentosTable
            empreendimentos={mockEmpreendimentos}
            filtroAtivo={filtroAtivo}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </Box>

      </Box>
    </>
  );
};

export default StatusTabela;