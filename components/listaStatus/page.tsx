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
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export type Empreendimento = {
  id: number;
  nome: string;
  ultimaAlteracao: string; // espera DD/MM/YYYY
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

  // Estado para ordenação
  const [orderBy, setOrderBy] = useState<"nome" | "ultimaAlteracao" | "usuario">("nome");
  const [orderAsc, setOrderAsc] = useState(true);

  // Função para parsear DD/MM/YYYY para timestamp (ms)
  const parseDateToTimestamp = (s?: string): number => {
    if (!s) return 0;
    const trimmed = s.trim();
    // Formato esperado: DD/MM/YYYY
    const parts = trimmed.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day).getTime();
      }
    }
    // fallback: tenta parsear ISO ou outros formatos
    const t = Date.parse(trimmed);
    if (!isNaN(t)) return t;
    return 0;
  };

  // Alternar coluna + direção (reseta página para 0)
  const handleSort = (column: "nome" | "ultimaAlteracao" | "usuario") => {
    setPage(0);
    if (orderBy === column) {
      setOrderAsc((prev) => !prev); // só troca direção
    } else {
      setOrderBy(column);
      setOrderAsc(true); // reset para asc
    }
  };

  // Filtragem
  const empreendimentosFiltrados = empreendimentos.filter(
    (emp) =>
      emp.status === filtroAtivo &&
      (emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.ultimaAlteracao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Ordenação dinâmica: trata datas separadamente
  const empreendimentosOrdenados = [...empreendimentosFiltrados].sort((a, b) => {
    if (orderBy === "ultimaAlteracao") {
      const ta = parseDateToTimestamp(a.ultimaAlteracao);
      const tb = parseDateToTimestamp(b.ultimaAlteracao);
      if (ta === tb) return 0;
      return orderAsc ? ta - tb : tb - ta;
    } else {
      // nome ou usuario -> natural sort (numeric + ignore accents/case)
      const fa = (a[orderBy] || "").toString();
      const fb = (b[orderBy] || "").toString();
      if (orderAsc) {
        return fa.localeCompare(fb, undefined, { numeric: true, sensitivity: "base" });
      } else {
        return fb.localeCompare(fa, undefined, { numeric: true, sensitivity: "base" });
      }
    }
  });

  // Paginação
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const empreendimentosPaginados = empreendimentosOrdenados.slice(startIndex, endIndex);

  const totalPages = Math.ceil(empreendimentosFiltrados.length / rowsPerPage);

  // Cabeçalho com seta
  const SortableHeader: React.FC<{ label: string; column: "nome" | "ultimaAlteracao" | "usuario" }> = ({ label, column }) => (
    <TableCell
      sx={{ fontWeight: "bold", cursor: "pointer" }}
      align="center"
      onClick={() => handleSort(column)}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {label}
        <ArrowDropDownIcon
          sx={{
            ml: 0.5,
            transition: "transform 0.25s",
            transform:
              orderBy === column
                ? orderAsc
                  ? "rotate(0deg)"
                  : "rotate(180deg)"
                : "rotate(0deg)",
            opacity: orderBy === column ? 1 : 0.35,
          }}
        />
      </Box>
    </TableCell>
  );

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
              <SortableHeader label="Empreendimentos" column="nome" />
              <SortableHeader label="Última alteração" column="ultimaAlteracao" />
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Versão
              </TableCell>
              <SortableHeader label="Usuário" column="usuario" />
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
                    transition: "background-color 0.3s",
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
                  "&:hover td": {
                    backgroundColor: "#e9e9e9",
                  },
                }}
              >
                <TableCell align="center">{empreendimento.nome}</TableCell>
                <TableCell align="center">{empreendimento.ultimaAlteracao}</TableCell>
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
                    <i className="pi pi-pen-to-square" style={{ fontSize: "1.2rem" }}></i>
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* sem dados */}
      {empreendimentosFiltrados.length === 0 && (
        <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
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