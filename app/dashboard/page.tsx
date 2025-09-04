import React from "react";
import { Box } from "@mui/material";

import Header from "../../components/teste/header/page";
import StatusSummary from "../../components/teste/status/page";
import Recentes from "../../components/teste/recentes/page";
import AcoesRapidas from "../../components/teste/acoesRapidas/page";

const Dashboard: React.FC = () => {
  return (
    <>
      <Header />
      <Box sx={{ px: 4, py: 2 }}>
        {/* Status */}
        <Box mb={3}>
          <StatusSummary />
        </Box>

        {/* Conteúdo principal */}
        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
        >
          <Box
            sx={{
              flex: "1 1 calc(66.66% - 16px)", // equivalente ao md=8
              minWidth: "300px",
            }}
          >
            <Recentes />
          </Box>

          <Box
            sx={{
              flex: "1 1 calc(33.33% - 16px)", // equivalente ao md=4
              minWidth: "300px",
            }}
          >
            <AcoesRapidas />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
