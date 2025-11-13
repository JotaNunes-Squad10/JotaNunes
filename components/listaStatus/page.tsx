"use client";

import React, { useState, useEffect } from "react";
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
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Skeleton } from "primereact/skeleton";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

export type Empreendimento = {
  id: number;
  nome: string;
  ultimaAlteracao: string;
  versao: string;
  usuario: string;
  status: string;
  showStatusChange?: boolean;
};

type EmpreendimentosTableProps = {
  empreendimentos: Empreendimento[];
  filtroAtivo: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  loading?: boolean;
};

const EmpreendimentosTable: React.FC<EmpreendimentosTableProps> = ({
  empreendimentos,
  filtroAtivo,
  searchTerm,
  onSearchChange,
  loading = false,
}) => {
  const [page, setPage] = useState(0);
  const [userProfile, setUserProfile] = useState<number | null>(null);
  const rowsPerPage = 10;
  const [orderBy, setOrderBy] = useState<"nome" | "ultimaAlteracao" | "usuario">("nome");
  const [orderAsc, setOrderAsc] = useState(true);

  // Novo estado para dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmp, setSelectedEmp] = useState<Empreendimento | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, emp: Empreendimento) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmp(emp);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmp(null);
  };

  // Função que retorna as opções do dropdown baseado no status
  const getDropdownOptions = (status: string) => {
    switch (status) {
      case "Editando":
      case "Revisão":
        return ["Editar", "Mudar status"];
      case "Pendente":
        return ["Revisar", "Mudar status"];
      case "Aprovados":
      case "Cancelados":
        return ["Visualizar", "Criar padrão"];
      default:
        return [];
    }
  };

  // Decodifica o token JWT e extrai o perfil
  useEffect(() => {
    try {
      const token = getCookie("accessToken");
      if (token && typeof token === "string") {
        type JwtPayload = { profile?: number };
        const decoded = jwtDecode<JwtPayload>(token);
        setUserProfile(decoded.profile || null);
      }
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      setUserProfile(null);
    }
  }, []);

  // Define quais status cada perfil pode editar
  const permissoes: Record<number, string[]> = {
    1: ["Editando", "Pendente", "Revisão", "Aprovado", "Cancelado"], // Admin
    2: ["Pendente", "Aprovado"], // Gestor
    3: ["Editando", "Revisão"], // Operador
  };

  const podeEditar = (perfil: number | null, status: string) => {
    if (!perfil) return false;
    const permitidos = permissoes[perfil] || [];
    return permitidos.includes(status);
  };

  const possuiPermissaoGeral =
    filtroAtivo === "Todos"
      ? true
      : userProfile
      ? permissoes[userProfile]?.includes(filtroAtivo) ?? false
      : false;

  // Ordenação e filtragem
  const parseDateToTimestamp = (s?: string): number => {
    if (!s) return 0;
    const [d, m, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d).getTime();
  };

  const handleSort = (column: "nome" | "ultimaAlteracao" | "usuario") => {
    setPage(0);
    if (orderBy === column) setOrderAsc((prev) => !prev);
    else {
      setOrderBy(column);
      setOrderAsc(true);
    }
  };

  const empreendimentosFiltrados = empreendimentos.filter(
    (emp) =>
      (filtroAtivo === "Todos" || emp.status === filtroAtivo) &&
      (emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.ultimaAlteracao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const empreendimentosOrdenados = [...empreendimentosFiltrados].sort((a, b) => {
    if (orderBy === "ultimaAlteracao") {
      const ta = parseDateToTimestamp(a.ultimaAlteracao);
      const tb = parseDateToTimestamp(b.ultimaAlteracao);
      return orderAsc ? ta - tb : tb - ta;
    }

    if (orderBy === "nome") {
      const numA = parseInt(a.nome.match(/\d+/)?.[0] || "0", 10);
      const numB = parseInt(b.nome.match(/\d+/)?.[0] || "0", 10);
      return orderAsc ? numA - numB : numB - numA;
    }

    const fa = a[orderBy].toLowerCase();
    const fb = b[orderBy].toLowerCase();
    return orderAsc ? fa.localeCompare(fb) : fb.localeCompare(fa);
  });

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const empreendimentosPaginados = empreendimentosOrdenados.slice(startIndex, endIndex);
  const totalPages = Math.ceil(empreendimentosFiltrados.length / rowsPerPage);

  const SortableHeader: React.FC<{ label: string; column: "nome" | "ultimaAlteracao" | "usuario" }> = ({
    label,
    column,
  }) => (
    <TableCell sx={{ fontWeight: "bold", cursor: "pointer" }} align="center" onClick={() => handleSort(column)}>
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
          {filtroAtivo === "Todos" ? "Todos" : filtroAtivo}
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
                  <IconButton size="small" onClick={() => onSearchChange("")} edge="end">
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
              {possuiPermissaoGeral && (
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              [...Array(Math.min(empreendimentosFiltrados.length || 10, 10))].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} sx={{ border: "none", py: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mb: -2,
                        alignItems: "center",
                        backgroundColor: "#f3f3f3",
                        borderRadius: "12px",
                        p: 2,
                      }}
                    >
                      <Skeleton width="20%" height="1.2rem" />
                      <Skeleton width="20%" height="1.2rem" />
                      <Skeleton width="20%" height="1.2rem" />
                      <Skeleton width="20%" height="1.2rem" />
                      <Skeleton width="20%" height="1.2rem" />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              empreendimentosPaginados.map((empreendimento) => (
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
                            : empreendimento.status === "Revisão"
                            ? "#FF9800"
                            : empreendimento.status === "Aprovado"
                            ? "#4CAF50"
                            : empreendimento.status === "Cancelado"
                            ? "#F44336"
                            : "#9E9E9E",
                        color: "white",
                        fontWeight: "bold",
                        borderRadius: "20px",
                        px: 1,
                      }}
                    />
                  </TableCell>

                  {possuiPermissaoGeral && (
                    <TableCell align="center">
                      {podeEditar(userProfile, empreendimento.status) && (
                        <>
                          <IconButton onClick={(e) => handleMenuOpen(e, empreendimento)}>
                            <i className="pi pi-pen-to-square" style={{ fontSize: "1.2rem" }}></i>
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dropdown dinâmico */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            backgroundColor: "#f3f3f3",
            border: "2px solid #d7d7d7",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
          },
        }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {selectedEmp &&
          (!selectedEmp.showStatusChange
            ? getDropdownOptions(selectedEmp.status).map((opt) => (
                <MenuItem
                  key={opt}
                  onClick={() => {
                    if (opt === "Mudar status") {
                      setSelectedEmp({ ...selectedEmp, showStatusChange: true });
                    } else {
                      handleMenuClose();
                    }
                  }}
                  sx={{
                    fontWeight: "bold",
                    borderBottom: "1px solid #d7d7d7",
                    "&:last-of-type": { borderBottom: "none" },
                    "&:hover": {
                      backgroundColor: "#e9e9e9",
                    },
                  }}
                >
                  {opt}
                </MenuItem>
              ))
            : (() => {
                const status = selectedEmp.status;
                const opcoesStatus =
                  status === "Editando"
                    ? ["Pendente"]
                    : status === "Revisão"
                    ? ["Pendente"]
                    : status === "Pendente"
                    ? ["Revisão", "Aprovados"]
                    : [];

                return opcoesStatus.map((novo) => (
                  <MenuItem
                    key={novo}
                    onClick={() => {
                      handleMenuClose();
                    }}
                    sx={{
                      fontWeight: "bold",
                      borderBottom: "1px solid #d7d7d7",
                      "&:last-of-type": { borderBottom: "none" },
                      "&:hover": {
                        backgroundColor: "#e9e9e9",
                      },
                    }}
                  >
                    {novo}
                  </MenuItem>
                ));
              })())}
      </Menu>

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 4, alignItems: "center" }}>
          <IconButton onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0} sx={{ color: "crimson" }}>
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