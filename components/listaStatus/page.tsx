import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";

export type Empreendimento = {
  id: number;
  nome: string;
  ultimaAlteracao: string;
  versao: string;
  usuario: string;
  status: string;
};

type EmpreendimentosTableProps = {
  empreendimentos: Empreendimento[];
  filtroAtivo: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
};

const EmpreendimentosTable: React.FC<EmpreendimentosTableProps> = ({
  empreendimentos,
  filtroAtivo,
  searchTerm,
  onSearchChange,
}) => {
  // Paginação
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // Filtragem
  const empreendimentosFiltrados = empreendimentos.filter(
    (emp) =>
      emp.status === filtroAtivo &&
      (emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.ultimaAlteracao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Paginação com slice
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const empreendimentosPaginados = empreendimentosFiltrados.slice(
    startIndex,
    endIndex
  );

  const totalPages = Math.ceil(empreendimentosFiltrados.length / rowsPerPage);

  return (
    <Paper elevation={0} sx={{ p: 3, border: "none" }}>
      {/* Cabeçalho */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mr: 2 }}>
          {filtroAtivo}
        </Typography>
        <TextField
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment:
              searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange("")}
                    edge="end"
                  >
                    ✕
                  </IconButton>
                </InputAdornment>
              ),
          }}
          sx={{
            maxWidth: 400,
            "& .MuiOutlinedInput-root": {
              borderRadius: "50px",
            },
          }}
        />
      </Box>

      {/* Tabela */}
      <TableContainer>
        <Table sx={{ borderSpacing: "0 12px", borderCollapse: "separate" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Empreendimentos
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Última alteração
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Versão
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Usuário
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {empreendimentosPaginados.map((empreendimento) => (
              <TableRow
                key={empreendimento.id}
                sx={{
                  "& td": {
                    backgroundColor: "#f3f3f3",
                    borderTop: "1px solid #d7d7d7",
                    borderBottom: "1px solid #d7d7d7",
                    padding: "12px 16px",
                  },
                  "& td:first-of-type": {
                    borderLeft: "1px solid #d7d7d7",
                    borderTopLeftRadius: "12px",
                    borderBottomLeftRadius: "12px",
                  },
                  "& td:last-of-type": {
                    borderRight: "1px solid #d7d7d7",
                    borderTopRightRadius: "12px",
                    borderBottomRightRadius: "12px",
                  },
                }}
              >
                <TableCell align="center">{empreendimento.nome}</TableCell>
                <TableCell align="center">
                  {empreendimento.ultimaAlteracao}
                </TableCell>
                <TableCell align="center">{empreendimento.versao}</TableCell>
                <TableCell align="center">{empreendimento.usuario}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={empreendimento.status}
                    sx={{
                      backgroundColor:
                        empreendimento.status === "Editando"
                          ? "#A8E6A1"
                          : empreendimento.status === "Pendente"
                          ? "#FFD966"
                          : empreendimento.status === "Revisao"
                          ? "#FF9800"
                          : empreendimento.status === "Aprovados"
                          ? "#4CAF50"
                          : empreendimento.status === "Cancelados"
                          ? "#F44336"
                          : "#9E9E9E",
                      color: "white",
                      fontWeight: "bold",
                      borderRadius: "20px",
                      px: 1,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* sem dados */}
      {empreendimentosFiltrados.length === 0 && (
        <Typography
          sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
        >
          Nenhum empreendimento encontrado
        </Typography>
      )}

      {/* paginação */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 4, alignItems: "center" }}>
          <IconButton
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
            sx={{ color: "crimson" }}
          >
            <FirstPageIcon />
          </IconButton>

          {/* indicador da página */}
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            Página {page + 1} de {totalPages}
          </Typography>

          <IconButton
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
            sx={{ color: "crimson" }}
          >
            <LastPageIcon />
          </IconButton>
        </Box>
      )}

    </Paper>
  );
};

export default EmpreendimentosTable;