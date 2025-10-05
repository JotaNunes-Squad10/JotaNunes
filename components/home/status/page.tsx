"use client";

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { FilePen, FileCheck2, Eye, ThumbsUp, BookX } from "lucide-react";
import { useRouter } from "next/navigation";

type StatusItem = {
  key: string;
  label: string;
  value: number;
  icon: React.ReactElement;
};

const status: StatusItem[] = [
  { key: "Editando", label: "Editando", value: 7, icon: <FilePen color="red" size={30}/> },
  { key: "Pendente", label: "Pendente de aprovação", value: 3, icon: <FileCheck2 color="red" size={30}/> },
  { key: "Revisao", label: "Em Revisão", value: 3, icon: <Eye color="red" size={30}/> },
  { key: "Aprovados", label: "Aprovados", value: 5, icon: <ThumbsUp color="red" size={30}/> },
  { key: "Cancelados", label: "Cancelados", value: 1, icon: <BookX color="red" size={30}/> },
];

const StatusSummary: React.FC = () => {
  const router = useRouter();

  const handleClick = (key: string) => {
    router.push(`/statusTabela?status=${key}`);
  };

  return (
    <Box display="flex" 
    flexWrap="wrap" 
    gap={2}
    >
      {status.map((stat) => (
        <Paper
          key={stat.label}
          elevation={0}
          sx={{
            p: 3,
            minWidth: 260,
            maxWidth: 400,
            border: "1px solid #eee",
            flex: "1 1 calc(20% - 16px)",
            height: 120,
            backgroundColor: "#f5f6f795",
            cursor: "pointer",
            transition: "0.2s",
            "&:hover": {
              backgroundColor: "#f0f0f0",
              border: "1px solid #c7c7c7ff",
              transform: "scale(1.02)",
            },
          }}
          onClick={() => handleClick(stat.key)}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold", mb: 1 }}>
            {stat.label}
          </Typography>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
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
