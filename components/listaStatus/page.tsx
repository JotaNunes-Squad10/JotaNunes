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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { Skeleton } from "primereact/skeleton";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useCopiarEmpreendimento } from "@/components/copiarEmpreendimento/useCopiarEmpreendimento";

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

  const { copiarEmpreendimento } = useCopiarEmpreendimento();

  const router = useRouter();

  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [filtroAtivo]);

  const [userProfile, setUserProfile] = useState<number | null>(null);
  const rowsPerPage = 10;
  const [orderBy, setOrderBy] = useState<"nome" | "ultimaAlteracao" | "usuario">("nome");
  const [orderAsc, setOrderAsc] = useState(true);

  // Novo estado para dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmp, setSelectedEmp] = useState<Empreendimento | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [novoStatusSelecionado, setNovoStatusSelecionado] = useState<string | null>(null);

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

    // REGRAS ESPECIAIS DO OPERADOR
    if (userProfile === 3) {
      if (status === "Pendente") {
        return ["Comparar", "Criar cópia"];
      }

    }

    // REGRAS ESPECIAIS DO GESTOR
    if (userProfile === 2) {

      if (status === "Pendente") return ["Verificar","Comparar","Mudar status"];

      if (status === "Aprovado") return ["Visualizar","Comparar"];
      if (status === "Cancelado") return ["Visualizar","Comparar"];
    }


    // REGRAS NORMAIS (ADMIN + restante do sistema)
    switch (status) {
      case "Editando":
        return ["Editar","Comparar","Criar cópia","Mudar status"];
      case "Em revisão":
        return ["Revisar","Comparar","Criar cópia","Mudar status"];
      case "Pendente":
        return ["Verificar","Comparar","Criar cópia","Mudar status"];
      case "Aprovado":
        return ["Visualizar","Comparar","Criar cópia"];
      case "Cancelado":
        return ["Visualizar","Comparar","Criar cópia"];
      default:
        return [];
    }
  };

  // Decodifica o token JWT e extrai o grupo
  useEffect(() => {
    try {
      const token = getCookie("accessToken");

      if (!token || typeof token !== "string") {
        setUserProfile(null);
        return;
      }

      type JwtPayload = {
        groups?: string[];
      };

      const decoded = jwtDecode<JwtPayload>(token);
      const grupo = decoded.groups?.[0];

      if (!grupo) {
        setUserProfile(null);
        return;
      }

      const mapPerfil: Record<string, number> = {
        Administrador: 1,
        Gestor: 2,
        Operador: 3,
      };

      const perfilId = mapPerfil[grupo] ?? null;
      setUserProfile(perfilId);
    } catch (error) {
      console.error("Erro ao decodificar o token:", error);
      setUserProfile(null);
    }
  }, []);

  // Define quais status cada perfil pode editar
  const permissoes: Record<number, string[]> = {
    1: ["Editando", "Pendente", "Em revisão", "Aprovado", "Cancelado"], // Admin
    2: ["Pendente", "Aprovado", "Cancelado"], // Gestor
    3: ["Editando", "Pendente", "Em revisão", "Aprovado", "Cancelado"], // Operador
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

    // ISO 8601 (ex: 2025-10-30T17:51:37.173961)
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
      const t = new Date(s).getTime();
      return isNaN(t) ? 0 : t;
    }

    // Formato dd/mm/yyyy ou dd/mm/yyyy HH:MM:SS
    if (s.includes("/")) {
      const [d, m, y] = s.split("/").map(Number);
      const t = new Date(y, (m || 1) - 1, d).getTime();
      return isNaN(t) ? 0 : t;
    }

    // fallback: tenta o parser do Date (lida com outros formatos)
    const t = Date.parse(s);
    return isNaN(t) ? 0 : t;
  };

    const formatarData = (dataISO?: string) => {
    if (!dataISO) return "";
    const d = new Date(dataISO);
    if (isNaN(d.getTime())) return dataISO;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const atualizarStatusEmpreendimento = async (id: string, status: number) => {
    try {
      const token = getCookie("accessToken");

      const response = await axios.patch(
        "https://jotanunesservice.onrender.com/api/v1/empreendimento/UpdateEmpreendimentoStatus",
        { id, status },
        {
          headers: {
            "Content-Type": "application/json-patch+json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
        throw error;
      }
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
        (emp.ultimaAlteracao || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const empreendimentosOrdenados = [...empreendimentosFiltrados].sort((a, b) => {
    if (orderBy === "ultimaAlteracao") {
      const ta = parseDateToTimestamp(a.ultimaAlteracao);
      const tb = parseDateToTimestamp(b.ultimaAlteracao);
      return orderAsc ? ta - tb : tb - ta;
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
                  <TableCell align="center">{formatarData(empreendimento.ultimaAlteracao)}</TableCell>
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
                            : empreendimento.status === "Em revisão"
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
                      {(
                        // Se Operador e status é Pendente ícone aparece
                        (userProfile === 3 && empreendimento.status === "Pendente") ||

                        // Caso contrário, segue regras normais
                        podeEditar(userProfile, empreendimento.status)
                      ) && (
                        <IconButton onClick={(e) => handleMenuOpen(e, empreendimento)}>
                          <i className="pi pi-pen-to-square" style={{ fontSize: "1.2rem" }}></i>
                        </IconButton>
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
                    
                    if (opt === "Editar") {
                      router.push(`/empreendimento/${selectedEmp.id}`); 
                      return; 
                    }

                    if (opt === "Comparar") {
                      sessionStorage.setItem("empreendimentoSelecionado", String(selectedEmp.id)); 
                      router.push("/comparacao"); 
                      return; 
                    }

                    if (opt === "Criar cópia") {
                      copiarEmpreendimento(String(selectedEmp.id))
                      return; 
                    }

                    if (opt === "Verificar") {
                      sessionStorage.setItem("empreendimentoSelecionado", String(selectedEmp.id)); 
                      router.push("/revisao"); 
                      return; 
                    }

                    if (opt === "Revisar") {
                      sessionStorage.setItem("empreendimentoSelecionado", String(selectedEmp.id)); 
                      router.push("/docCorrecao"); 
                      return; 
                    }

                    if (opt === "Visualizar") {
                      router.push(`/pdfEmpreendimento?id=${selectedEmp.id}`);
                      return;
                    }

                    if (opt === "Mudar status") {
                      setSelectedEmp((prev) => prev ? { ...prev, showStatusChange: true } : selectedEmp);
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
                    : status === "Em revisão"
                    ? ["Pendente"]
                    : status === "Pendente"
                    ? ["Em revisão", "Aprovado", "Cancelado"]
                    : [];

                return opcoesStatus.map((novo) => (
                  <MenuItem
                    key={novo}
                    onClick={() => {
                      setNovoStatusSelecionado(novo);
                      setOpenConfirmModal(true);
                      setAnchorEl(null);
                    }}
                    sx={{
                      fontWeight: "bold",
                      borderBottom: "1px solid #d7d7d7",
                      "&:last-of-type": { borderBottom: "none" },
                      "&:hover": { backgroundColor: "#e9e9e9" },
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

      {/* Modal de confirmação */}
      <Dialog
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        PaperProps={{
          sx: { borderRadius: "16px", p: 1, minWidth: 360 },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
          Confirmar mudança de status
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center" }}>
            Deseja realmente mudar o empreendimento{" "}
            <strong>{selectedEmp?.nome}</strong> de{" "}
            <strong>{selectedEmp?.status}</strong> para{" "}
            <strong>{novoStatusSelecionado}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenConfirmModal(false)}
            sx={{ borderRadius: "20px", px: 3 }}
          >
            Não
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              if (!selectedEmp || !novoStatusSelecionado) return;

              
              const mapStatus: Record<string, number> = {
                Aprovado: 1,
                'Em revisão': 2,
                Pendente: 3,
                Editando: 4,
                Cancelado: 5,
              };

              const novoStatusCode = mapStatus[novoStatusSelecionado] ?? 0;

              try {
                const result = await atualizarStatusEmpreendimento(
                  selectedEmp.id.toString(),
                  novoStatusCode
                );

                if (result) {
                  setOpenConfirmModal(false);

                  toast.success("Status atualizado com sucesso!", {
                    onClose: () => {
                      window.location.reload();  // só recarrega depois que o toast sumir
                    },
                  });
                }
              } catch (error) {
                console.error(error);
                toast.error("Erro ao atualizar o status.");
              }
            }}
            sx={{ borderRadius: "20px", px: 3 }}
          >
            Sim
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer autoClose={2000} theme="colored" />
    </Paper>
  );
};

export default EmpreendimentosTable;