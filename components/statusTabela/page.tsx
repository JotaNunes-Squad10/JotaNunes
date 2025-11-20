"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Box } from "@mui/material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../headerUser/page";
import StatusSummary from "../home/status/page";
import EmpreendimentosTable, { Empreendimento } from "../listaStatus/page";

const StatusTabela: React.FC = () => {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const status = statusParam || "Todos";
    setFiltroAtivo(status);
  }, [statusParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          "https://jotanunesservice.onrender.com/api/v1/empreendimento/GetAllEmpreendimentos"
        );

        const data = response.data?.data || [];

        const parsedData: Empreendimento[] = data.map((item: any) => ({
          id: item.id,
          nome: item.nome,
          ultimaAlteracao: item.dataHoraAlteracao,
          versao: item.versao,
          usuario: item.usuarioAlteracao,
          status: item.status,
        }));

        setEmpreendimentos(parsedData);
      } catch (error) {
        toast.error("Erro ao buscar empreendimentos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);   

  return (
    <>
      <Header />
      <Box sx={{ px: 4, py: 2 }}>
        {/* Cards de Status */}
        <Box mb={3}>
          <StatusSummary empreendimentos={empreendimentos} />
        </Box>

        {/* Tabela */}
        <Box>
          <EmpreendimentosTable
            empreendimentos={empreendimentos}
            filtroAtivo={filtroAtivo}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={loading}
          />
        </Box>
      </Box>
    </>
  );
};

export default StatusTabela;