import React from "react";
import { Box, Paper, Typography } from "@mui/material";

type StatusItem = {
  label: string;
  value: number;
};

const status: StatusItem[] = [
  { label: "Editando", value: 7 },
  { label: "Pendente de aprovação", value: 3 },
  { label: "Em Revisão", value: 3 },
  { label: "Aprovados", value: 5 },
  { label: "Cancelados", value: 1 },
];

const StatusSummary: React.FC = () => {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap={2}
    >
      {status.map((stat) => (
        <Paper
          key={stat.label}
          elevation={0}
          sx={{
            p: 2,
            minWidth: 140,
            textAlign: "center",
            border: "1px solid #eee",
            flex: "1 1 calc(20% - 16px)", 
            height: 120, 
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {stat.label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {stat.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default StatusSummary;
