"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Box } from "@mui/material";
import Header from "../../components/headerUser/page";
import Popup from '../../components/popup/page';
import StatusSummary from "../../components/home/status/page";
import Recentes from "../../components/home/recentes/page";
import AcoesRapidas from "../../components/home/acoesRapidas/page";
import axios from "axios";
import type { Empreendimento } from "../../lib/api1";
import { toast } from "react-toastify";

const Dashboard: React.FC = () => {
  const [documentos, setDocumentos] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://jotanunesservice.onrender.com/api/v1/empreendimento/GetAllEmpreendimentos"
        );

        const data = response.data?.data || response.data || [];

        // converte para o shape esperado pelo Recentes (se necessário)
        const parsed = (data as Empreendimento[]).map((item: Empreendimento) => ({
          id: item.id,
          nome: item.nome,
          descricao: item.descricao ?? "",
          localizacao: item.localizacao ?? "",
          padrao: item.padrao ?? "",
          versao: item.versao ?? 0,
          status: item.status,
          usuarioAlteracao: item.usuarioAlteracao,
          dataHoraAlteracao: item.dataHoraAlteracao,
        }));

        setDocumentos(parsed);
      } catch {
        toast.error("Erro ao buscar empreendimentos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ 
      position: "relative",
      minHeight: "100vh",
      overflow: "visible"
    }}>
      <Header />
      <Box sx={{ 
        px: { xs: 2, sm: 4 }, 
        py: 2,
        pb: { xs: 12, sm: 4 }, 
        pt: { xs: '60px', sm: '70px' },
        minHeight: "auto"
      }}>
        {/* Status */}
        <Box mb={3}>
          <Suspense fallback={<div>Carregando...</div>}>
            <StatusSummary empreendimentos={documentos} loading={loading} />
          </Suspense>
        </Box>

        {/* Conteúdo principal */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          sx={{
            flexDirection: { xs: "column", md: "row" }
          }}
        >
          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 calc(33.33% - 16px)" },
              minWidth: { xs: "100%", sm: "300px" },
              width: { xs: "100%", md: "auto" },
              order: { xs: 1, md: 2 }
            }}
          >
            <AcoesRapidas />
          </Box>

          <Box
            sx={{
              flex: { xs: "1 1 100%", md: "1 1 calc(66.66% - 16px)" },
              minWidth: { xs: "100%", sm: "300px" },
              width: { xs: "100%", md: "auto" },
              order: { xs: 2, md: 1 } 
            }}
          >
            {/* passa documentos e loading para Recentes */}
            <Recentes documentos={documentos} loading={loading} />
          </Box>
        </Box>
      </Box>
      <Popup />
    </Box>
  );
};

export default Dashboard;