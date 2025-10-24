"use client";

import React, { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { FilePen, FileCheck2, Eye, ThumbsUp, BookX } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Skeleton } from "primereact/skeleton";

type Empreendimento = {
  id: number;
  nome: string;
  status: string;
};

type StatusSummaryProps = {
  empreendimentos?: Empreendimento[];
};

const StatusSummary: React.FC<StatusSummaryProps> = ({ empreendimentos }) => {
  const router = useRouter();
  const [data, setData] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (empreendimentos && empreendimentos.length > 0) {
      setData(empreendimentos);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://jotanunesservice.onrender.com/api/v1/empreendimento/GetAllEmpreendimentos"
        );
        setData(response.data?.data || []);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empreendimentos]);

  const counts: Record<string, number> = {};
  data.forEach((item) => {
    const status = (item.status || "Desconhecido").trim();
    counts[status] = (counts[status] || 0) + 1;
  });

  const statusList = [
    { key: "Editando", label: "Editando", icon: <FilePen color="red" size={30} strokeWidth={1} /> },
    { key: "Pendente", label: "Pendente de aprovação", icon: <FileCheck2 color="red" size={30} strokeWidth={1} /> },
    { key: "Revisão", label: "Em Revisão", icon: <Eye color="red" size={30} strokeWidth={1} /> },
    { key: "Aprovado", label: "Aprovados", icon: <ThumbsUp color="red" size={30} strokeWidth={1} /> },
    { key: "Cancelado", label: "Cancelados", icon: <BookX color="red" size={30} strokeWidth={1} /> },
  ];

  const handleClick = (key: string) => {
    router.push(`/statusTabela?status=${key}`);
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2}>
      {statusList.map((stat) => (
        <Paper
          key={stat.key}
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
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            {stat.label}
          </Typography>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {loading ? (
              <Skeleton
                width="2.5rem"
                height="1.8rem"
                borderRadius="8px"
                style={{ backgroundColor: "#e0e0e0" }}
              />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {counts[stat.key] || 0}
              </Typography>
            )}
            {stat.icon}
          </div>
        </Paper>
      ))}
    </Box>
  );
};

export default StatusSummary;