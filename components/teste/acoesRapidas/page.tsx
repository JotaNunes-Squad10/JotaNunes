import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
          <Button
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Começar
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default AcoesRapidas;
