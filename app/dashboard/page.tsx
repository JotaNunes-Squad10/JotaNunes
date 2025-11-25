import React, { Suspense } from "react";
import { Box } from "@mui/material";
import Header from "../../components/headerUser/page";
import Popup from '../../components/popup/page';
import StatusSummary from "../../components/home/status/page";
import Recentes from "../../components/home/recentes/page";
import AcoesRapidas from "../../components/home/acoesRapidas/page";

const Dashboard: React.FC = () => {
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
        minHeight: "auto"
      }}>
        {/* Status */}
        <Box mb={3}>
          <Suspense fallback={<div>Carregando...</div>}>
            <StatusSummary />
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
            <Recentes />
          </Box>
        </Box>
      </Box>
      <Popup />
    </Box>
  );
};

export default Dashboard;
