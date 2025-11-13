import { authApi } from "./api";
import { getCookie } from "cookies-next";

// Interfaces baseadas na API real do projeto
export interface User {
  id?: string | number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  enabled?: boolean;
  createdTimestamp?: number;
  profile?: number;
  profiles?: Array<{ id: number; name: string }>;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profile: number;
  password: string;
}

// Helper para obter token de autorização
const getAuthToken = (): string => {
  const token = getCookie("accessToken");
  return token ? `Bearer ${token}` : "";
};

// Serviços para gerenciamento de usuários baseados na API real
export const userService = {
  // Buscar todos os usuários
  async getAllUsers(): Promise<User[]> {
    const response = await authApi.get<{ data: User[] }>("/api/v1/authentication/GetAllUsers", {
      headers: { Authorization: getAuthToken() }
    });
    return response.data.data;
  },

  // Criar novo usuário
  async createUser(payload: CreateUserPayload): Promise<void> {
    await authApi.post("/api/v1/authentication/CreateUser", payload, {
      headers: { Authorization: getAuthToken() }
    });
  },

  // Deletar usuário
  async deleteUser(id: string): Promise<void> {
    await authApi.delete(`/api/v1/authentication/DeleteUser/${id}`, {
      headers: { Authorization: getAuthToken() }
    });
  },

  // Atualizar usuário
  async updateUser(userData: Partial<User> & { id: string | number }): Promise<void> {
    await authApi.patch("/api/v1/authentication/UpdateUser", userData, {
      headers: { Authorization: getAuthToken() }
    });
  },

  // Resetar senha do usuário
  async resetPassword(userId: string): Promise<{ newPassword: string }> {
    // Gerar senha temporária
    const generateTempPassword = (length = 8) => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let pass = "";
      for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return pass;
    };

    const newPassword = generateTempPassword(8);

    await authApi.patch("/api/v1/authentication/ResetPassword", 
      { userId, newPassword }, 
      { headers: { Authorization: getAuthToken() } }
    );

    // Buscar o nome real do usuário pelo ID
    let username = '';
    try {
      const allUsers = await userService.getAllUsers();
      const found = allUsers.find(u => String(u.id) === String(userId));
      username = found?.username || `user-${userId}`;
    } catch {
      username = `user-${userId}`;
    }

    // Enviar dados para o banco via API
    await fetch('http://localhost:3000/api/usuario-temporario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: Date.now(),
        usuario: username,
        numero: '',
        email: '',
        senha: newPassword
      })
    });

    return { newPassword };
  }
};

// Interface para Empreendimento
export interface Empreendimento {
  id?: string | number;
  nome?: string;
  name?: string;
  descricao?: string;
  status?: string;
  localizacao?: string;
  padrao?: string | number;
  versao?: number;
  usuarioAlteracao?: string;
  dataHoraAlteracao?: string;
  empreendimentos?: Empreendimento[];
  empreendimentoTopicos?: EmpreendimentoTopico[];
}

export interface EmpreendimentoTopico {
  id?: number;
  topicoId?: number;
  posicao?: number;
  versoes?: number[];
  topicoAmbientes?: Array<{
    id?: number;
    ambienteId?: number;
    posicao?: number;
    versoes?: number[];
    ambienteItens?: Array<{
      id?: number;
      itemId?: number;
      versoes?: number[];
    }>;
  }>;
  topicoMateriais?: Array<{
    id?: number;
    materialId?: number;
    versoes?: number[];
  }>;
}

// Item retornado pelo endpoint /api/v1/items/GetItemById/{id}
export interface Item {
  id?: number;
  nome?: string;
  descricao?: string;
}

export const itemService = {
  async getItemById(id: number | string): Promise<Item | null> {
    try {
      const response = await authApi.get<{ data: Item }>(`/api/v1/items/GetItemById/${id}`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data;
      if (!respData) return null;
      if ('data' in respData) return (respData as { data: Item }).data || null;
      return respData as unknown as Item;
    } catch (err) {
      console.error(`Erro ao buscar item por id ${id}:`, err);
      return null;
    }
  }
};

export const empreendimentoService = {
  async getAllEmpreendimentos(): Promise<Empreendimento[]> {
    const response = await authApi.get<Empreendimento[] | { data: Empreendimento[] }>(
      "/api/v1/empreendimento/GetAllEmpreendimentos",
      { headers: { Authorization: getAuthToken() } }
    );
    const respData = response.data;
    if (Array.isArray(respData)) {
      return respData as Empreendimento[];
      console.log('Resposta é um array direto:', respData);
    }
    if (respData && typeof respData === 'object' && 'data' in respData && Array.isArray((respData as { data: Empreendimento[] }).data)) {
      return (respData as { data: Empreendimento[] }).data;
    }
    return [];
  },
  // Buscar um empreendimento por ID
  async getEmpreendimentoById(id: string | number): Promise<Empreendimento | null> {
    try {
      const response = await authApi.get<Empreendimento | { data: Empreendimento }>(
        `/api/v1/empreendimento/GetEmpreendimentoById/${id}`,
        { headers: { Authorization: getAuthToken() } }
      );
      const respData = response.data;
      if (!respData) return null;
      if (Array.isArray(respData)) {
        // inesperado: retornar primeiro
        return respData[0] || null;
      }
      if (respData && typeof respData === 'object' && 'data' in respData) {
        return (respData as { data: Empreendimento }).data || null;
      }
      return respData as Empreendimento;
    } catch (err) {
      console.error(`Erro ao buscar empreendimento por id ${id}:`, err);
      return null;
    }
  },
};

export interface Ambiente {
  id?: number;
  nome?: string;
  descricao?: string;
}

export const ambienteService = {
  async getAmbienteById(id: number | string): Promise<Ambiente | null> {
    try {
      const response = await authApi.get<{ data: Ambiente }>(`/api/v1/ambiente/GetAmbienteById/${id}`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data;
      if (!respData) return null;
      if ('data' in respData) return (respData as { data: Ambiente }).data || null;
      return respData as unknown as Ambiente;
    } catch (err) {
      console.error(`Erro ao buscar ambiente por id ${id}:`, err);
      return null;
    }
  }
};

export interface Topico {
  id?: number;
  nome?: string;
  descricao?: string;
}

export const topicoService = {
  async getTopicoById(id: number | string): Promise<Topico | null> {
    try {
      const response = await authApi.get<{ data: Topico }>(`/api/v1/topico/GetTopicoById/${id}`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data;
      if (!respData) return null;
      if ('data' in respData) return (respData as { data: Topico }).data || null;
      return respData as unknown as Topico;
    } catch (err) {
      console.error(`Erro ao buscar topico por id ${id}:`, err);
      return null;
    }
  }
};

export interface Marca {
  id?: number;
  nome?: string;
}

export interface MarcaMaterialResult {
  material?: string;
  marcas?: string[];
}

export const marcaMaterialService = {
  async getAllMarcasByMaterialId(id: number | string): Promise<MarcaMaterialResult | null> {
    try {
      // allow inspecting non-2xx responses instead of throwing immediately
      const response = await authApi.get(`/api/v1/marca-material/GetAllMarcasByMaterialId/${id}`, {
        headers: { Authorization: getAuthToken() },
        validateStatus: () => true,
      });
      // Se a resposta não for 200 OK, retornamos null (server retornou 400/401 etc)
      if (response.status !== 200) {
        // opcional: registrar apenas em nível debug
        console.debug(`marcaMaterialService: status ${response.status} ao buscar marcas para material ${id}`);
        return null;
      }
      const respData = response.data;
      if (!respData) return null;
      // se o servidor devolveu texto/html (por ex. página de login), não tentamos parsear
      const contentType = response.headers && (response.headers['content-type'] || response.headers['Content-Type']);
      if (typeof respData === 'string' && contentType && !contentType.includes('application/json')) {
        console.debug(`marcaMaterialService: resposta não-JSON (content-type=${contentType}) para material ${id}`);
        return null;
      }
      // Caso 1: API retorna { data: { materialId, material, marcas: string[] } }
      if (typeof respData === 'object' && 'data' in respData && respData.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inner = (respData as any).data;
        const result: MarcaMaterialResult = {};
        if (inner && Array.isArray(inner.marcas)) result.marcas = inner.marcas as string[];
        if (inner && (inner.material || inner.materialName)) result.material = inner.material || inner.materialName;
        return result;
      }
      // Caso 2: API retorna diretamente um array de strings
      if (Array.isArray(respData)) return { marcas: respData as string[] };
      return null;
    } catch (err) {
      console.error(`Erro ao buscar marcas do material ${id}:`, err);
      return null;
    }
  }
};