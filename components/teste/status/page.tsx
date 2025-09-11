import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { FilePen, FileCheck2, Eye, ThumbsUp, BookX} from 'lucide-react';

type StatusItem = {
  label: string;
  value: number;
  icon: React.ReactElement;
};

const status: StatusItem[] = [
  { label: "Editando", value: 7, icon: <FilePen color="red" size={30}/> },
  { label: "Pendente de aprovação", value: 3, icon:<FileCheck2 color="red" size={30}/> },
  { label: "Em Revisão", value: 3, icon: <Eye color="red" size={30}/> },
  { label: "Aprovados", value: 5, icon: <ThumbsUp color="red" size={30}/> },
  { label: "Cancelados", value: 1, icon: <BookX color="red" size={30}/> },
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
            p: 3,
            minWidth:260,
            maxWidth: 400,
            border: "1px solid #eee",
            flex: "1 1 calc(20% - 16px)", 
            height: 120, 
            backgroundColor: "#f5f6f795",
          }}
        >
          <Typography variant="body2"  color="text.secondary" sx={{ fontWeight: "bold", mb: 1 }}>
            {stat.label}
          </Typography>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {stat.value}
              </Typography>
              {stat.icon}
            </div>
        </Paper>
      ))}
    </Box>
  );
};

export default StatusSummary;
