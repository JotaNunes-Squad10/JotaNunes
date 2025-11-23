"use client";
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import Menu_acoes_rapidas from "../menu_acoes_rapidas/page";

const AcoesRapidas: React.FC = () => {
  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} mb={3}>
        Ações Rápidas
      </Typography>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" fontWeight={500}>
            Criar Documento
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Inicie um novo documento usando nossos templates prontos
          </Typography>

          <Menu_acoes_rapidas/>

        </CardContent>
      </Card>
    </>
  );
};

export default AcoesRapidas;