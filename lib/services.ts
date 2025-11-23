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
      revisaoItem?: {
        id?: number;
        statusId?: number;
        status?: string;
        observacao?: string;
      };
    }>;
  }>;
  topicoMateriais?: Array<{
    id?: number;
    materialId?: number;
    versoes?: number[];
    revisaoMaterial?: {
      id?: number;
      statusId?: number;
      status?: string;
      observacao?: string;
    };
  }>;
}

// Item retornado pelo endpoint /api/v1/items/GetItemById/{id}
export interface Item {
  id?: number;
  nome?: string;
  descricao?: string;
}

export interface Material {
  id?: number;
  nome?: string;
  descricao?: string;
}

export const itemService = {
  // Salvar comentário do item
  async setItemComentario(itemId: number, statusId: number, observacao: string): Promise<void> {
    try {
      await authApi.post(
        "/api/v1/items/SetItemComentario",
        { itemId, statusId, observacao },
        { headers: { Authorization: getAuthToken() } }
      );
    } catch (err) {
      console.error(`Erro ao salvar comentário do item ${itemId}:`, err);
      throw err;
    }
  },
  
  async clearItemComentario(itemId: number): Promise<void> {
    try {
      await authApi.delete(`/api/v1/items/ClearItemComentario/${itemId}`, {
        headers: { Authorization: getAuthToken() }
      });
    } catch (err) {
      console.error(`Erro ao limpar comentário do item ${itemId}:`, err);
      throw err;
    }
  },

  async getItemById(id: number | string): Promise<Item | null> {
    // Implementa tentativas (retry) simples com backoff exponencial
    const maxAttempts = 3;
    const perRequestTimeout = 30000; // 30s por requisição
    let attempt = 0;
    let lastErr: unknown = null;

    while (attempt < maxAttempts) {
      try {
        const response = await authApi.get<{ data: Item }>(`/api/v1/items/GetItemById/${id}`, {
          headers: { Authorization: getAuthToken() },
          timeout: perRequestTimeout,
        });
        const respData = response.data;
        if (!respData) return null;
        if ('data' in respData) return (respData as { data: Item }).data || null;
        return respData as unknown as Item;
      } catch (err) {
        lastErr = err;
        attempt += 1;
        // decidir se devemos tentar novamente: falhas de rede/timeout ou 5xx do servidor
        let status: number | null = null;
        let code: string | null = null;
        if (err && typeof err === 'object') {
          const resp = (err as { response?: { status?: number } }).response;
          status = resp && typeof resp.status === 'number' ? resp.status : null;
          const c = (err as { code?: unknown }).code;
          code = typeof c === 'string' ? c : null;
        }
        const shouldRetry = !status || (typeof status === 'number' && status >= 500) || code === 'ECONNABORTED';
        if (!shouldRetry || attempt >= maxAttempts) break;

        const backoff = 200 * Math.pow(2, attempt); // 400ms, 800ms, ...
        // aguardar antes da próxima tentativa
        await new Promise((res) => setTimeout(res, backoff));
      }
    }

    console.error(`Erro ao buscar item por id ${id} após ${maxAttempts} tentativas:`, lastErr);
    return null;
  }
  ,
  // Busca itens por texto (usada pelo seletor com filtro)
  async searchItems(query: string): Promise<Item[]> {
    try {
      if (!query || String(query).trim().length === 0) {
        // quando query vazia, retornar todos os itens
        return await itemService.getAllItems();
      }
      const response = await authApi.get<Item[] | { data: Item[] }>(`/api/v1/items/Search`, {
        headers: { Authorization: getAuthToken() },
        params: { q: query }
      });
      const respData = response.data;
      if (Array.isArray(respData)) return respData as Item[];
      if (respData && typeof respData === 'object' && 'data' in respData && Array.isArray((respData as { data: Item[] }).data)) {
        return (respData as { data: Item[] }).data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao buscar itens por texto', err);
      return [];
    }
  }
  ,
  async getAllItems(): Promise<Item[]> {
    try {
      const response = await authApi.get<Item[] | { data: Item[] }>(`/api/v1/items/GetAllItems`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data;
      if (Array.isArray(respData)) return respData as Item[];
      if (respData && typeof respData === 'object' && 'data' in respData && Array.isArray((respData as { data: Item[] }).data)) {
        return (respData as { data: Item[] }).data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao buscar todos os itens', err);
      return [];
    }
  }
};

export const empreendimentoService = {
  async getAllEmpreendimentos(): Promise<Empreendimento[]> {
    const response = await authApi.get<Empreendimento[] | { data: Empreendimento[] }>(
      "/api/v1/empreendimento/GetAllEmpreendimentos",
      { headers: { Authorization: getAuthToken() }, timeout: 60000 } 
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
  // Atualizar status do empreendimento (id:string, status:number)
  async updateStatus(id: string | number, status: number): Promise<void> {
    try {
      // Usar PATCH seguindo o padrão de outros endpoints de atualização neste projeto
      await authApi.patch(
        "/api/v1/empreendimento/UpdateEmpreendimentoStatus",
        { id: String(id), status },
        { headers: { Authorization: getAuthToken() } }
      );
    } catch (err) {
      console.error(`Erro ao atualizar status do empreendimento ${id}:`, err);
      // repassa o erro para o chamador lidar
      throw err;
    }
  },
  // Atualizar dados básicos do empreendimento (nome, descricao, localizacao, padrao)
  async updateEmpreendimento(data: Partial<Empreendimento> & { id: string | number }): Promise<void> {
    try {
      // Endpoint assumido: UpdateEmpreendimento (PATCH)
      await authApi.patch(
        "/api/v1/empreendimento/UpdateEmpreendimento",
        data,
        { headers: { Authorization: getAuthToken() } }
      );
    } catch (err) {
      console.error(`Erro ao atualizar empreendimento ${data.id}:`, err);
      throw err;
    }
  },
  
  // Atualizar empreendimento completo com tópicos, ambientes e itens
  async updateEmpreendimentoCompleto(payload: {
    id: string;
    nome?: string;
    descricao?: string;
    localizacao?: string;
    tamanhoArea?: number;
    padrao?: number;
    empreendimentoTopicos?: Array<{
      topicoId: number;
      posicao: number;
      topicoAmbientes?: Array<{
        ambienteId: number;
        area?: number;
        posicao: number;
        ambienteItens?: Array<{
          itemId: number;
        }>;
      }>;
      topicoMateriais?: Array<{
        materialId: number;
      }>;
    }>;
  }): Promise<void> {
    try {
      await authApi.put(
        "/api/v1/empreendimento/UpdateEmpreendimento",
        payload,
        { headers: { Authorization: getAuthToken() } }
      );
    } catch (err) {
      console.error(`Erro ao atualizar empreendimento completo ${payload.id}:`, err);
      throw err;
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
  ,
  // Buscar todos os ambientes
  async getAllAmbientes(): Promise<Array<{ id?: number; nome?: string; topico?: { id?: number; nome?: string } }>> {
    try {
      const response = await authApi.get<unknown>(`/api/v1/ambiente/GetAllAmbientes`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data as unknown;
      const arr: unknown[] = Array.isArray(respData)
        ? respData
        : (respData && typeof respData === 'object' && 'data' in (respData as Record<string, unknown>) && Array.isArray(((respData as Record<string, unknown>)['data'])) ? ((respData as Record<string, unknown>)['data'] as unknown[]) : []);
      return arr.map((raw) => {
        const anyRaw = raw as Record<string, unknown>;
        const id = anyRaw['id'] ?? undefined;
  const nome = anyRaw['nome'] ?? anyRaw['name'] ?? undefined;
        const topRaw = anyRaw['topico'] ?? anyRaw['topicoId'] ?? undefined;
        let topObj: { id?: number; nome?: string } | undefined = undefined;
        if (topRaw && typeof topRaw === 'object') {
          const t = topRaw as Record<string, unknown>;
          const tid = t['id'] ?? t['topicoId'] ?? undefined;
          const tnome = t['nome'] ?? t['name'] ?? undefined;
          topObj = { id: tid ? Number(tid) : undefined, nome: tnome ? String(tnome) : undefined };
        }
        return { id: id ? Number(id) : undefined, nome: nome ? String(nome) : undefined, topico: topObj };
      });
    } catch (err) {
      console.error('Erro ao buscar todos os ambientes', err);
      return [];
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
  ,
  // Buscar todos os tópicos
  async getAllTopicos(): Promise<Topico[]> {
    try {
      const response = await authApi.get<{ data: Topico[] } | Topico[]>(`/api/v1/topico/GetAllTopicos`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data;
      if (Array.isArray(respData)) return respData as Topico[];
      if (respData && typeof respData === 'object' && 'data' in respData && Array.isArray((respData as { data: Topico[] }).data)) {
        return (respData as { data: Topico[] }).data;
      }
      return [];
    } catch (err) {
      console.error('Erro ao buscar todos os tópicos', err);
      return [];
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
      const response = await authApi.get(`/api/v1/marca-material/GetAllMarcasByMaterialId/${id}`, {
        headers: { Authorization: getAuthToken() },
        validateStatus: () => true,
      });
      if (response.status !== 200) {
        console.debug(`marcaMaterialService: status ${response.status} ao buscar marcas para material ${id}`);
        return null;
      }
      const respData = response.data;
      if (!respData) return null;
      const contentType = response.headers && (response.headers['content-type'] || response.headers['Content-Type']);
      if (typeof respData === 'string' && contentType && !contentType.includes('application/json')) {
        console.debug(`marcaMaterialService: resposta não-JSON (content-type=${contentType}) para material ${id}`);
        return null;
      }
      if (typeof respData === 'object' && 'data' in respData && respData.data) {
          const inner = (respData as Record<string, unknown>)['data'];
          const result: MarcaMaterialResult = {};
          if (inner && typeof inner === 'object') {
            const innerObj = inner as Record<string, unknown>;
            if (Array.isArray(innerObj['marcas'])) {
              result.marcas = (innerObj['marcas'] as unknown[]).map(String);
            }
            const matVal = innerObj['material'] ?? innerObj['materialName'];
            if (typeof matVal === 'string') {
              result.material = matVal;
            } else if (matVal && typeof matVal === 'object') {
              const matObj = matVal as Record<string, unknown>;
              const candidate = matObj['nome'] ?? matObj['name'] ?? matObj['materialName'];
              if (typeof candidate === 'string') result.material = candidate;
            }
          }
          return result;
      }
      if (Array.isArray(respData)) return { marcas: respData as string[] };
      return null;
    } catch (err) {
      console.error(`Erro ao buscar marcas do material ${id}:`, err);
      return null;
    }
  }
};

export const materialService = {
  async getMaterialById(id: number | string): Promise<Material | null> {
    if (!id || (typeof id === 'number' && id <= 0)) {
      return null;
    }
    
    try {
      const response = await authApi.get<Material | { data: Material }>(`/api/v1/material/GetMaterialById/${id}`, {
        headers: { Authorization: getAuthToken() }
      });
      
      if (response.status === 404) {
        return null;
      }
      
      const respData = response.data;
      if (!respData) return null;
      const raw = 'data' in respData ? (respData as { data: unknown }).data : respData;
      if (!raw) return null;
      if (typeof raw === 'object' && !Array.isArray(raw)) {
        const anyRaw = raw as Record<string, unknown>;
        const nid = anyRaw['id'] ?? anyRaw['materialId'] ?? anyRaw['MaterialId'] ?? (anyRaw['material'] && typeof anyRaw['material'] === 'object' ? (anyRaw['material'] as Record<string, unknown>)['id'] : undefined) ?? anyRaw['ID'];
        let nomeRaw = anyRaw['nome'] ?? anyRaw['name'] ?? anyRaw['materialName'] ?? anyRaw['materialNome'] ?? anyRaw['description'] ?? anyRaw['descricao'] ?? anyRaw['material'];
        if (nomeRaw && typeof nomeRaw === 'object') {
          const nested = nomeRaw as Record<string, unknown>;
          nomeRaw = nested['nome'] ?? nested['name'] ?? nested['materialName'] ?? nested['descricao'] ?? nested['description'];
        }
        const nome = nomeRaw;
        const desc = anyRaw['descricao'] ?? anyRaw['description'] ?? undefined;
        return { id: nid ? Number(nid) : undefined, nome: nome ? String(nome) : undefined, descricao: desc ? String(desc) : undefined } as Material;
      }
      return null;
    } catch {
      return null;
    }
  },

  async searchMaterials(query: string): Promise<Material[]> {
    try {
      if (!query || String(query).trim().length === 0) {
        return await materialService.getAllMateriais();
      }
            const response = await authApi.get<unknown>(`/api/v1/material/Search`, {
        headers: { Authorization: getAuthToken() },
        params: { q: query }
      });
      const respData = response.data as unknown;
      const arr: unknown[] = Array.isArray(respData)
        ? respData
        : (respData && typeof respData === 'object' && 'data' in (respData as Record<string, unknown>) && Array.isArray(((respData as Record<string, unknown>)['data'])) ? ((respData as Record<string, unknown>)['data'] as unknown[]) : []);
      return arr.map((raw) => {
        const anyRaw = raw as Record<string, unknown>;
        const nid = anyRaw['id'] ?? anyRaw['materialId'] ?? anyRaw['MaterialId'] ?? (anyRaw['material'] && typeof anyRaw['material'] === 'object' ? (anyRaw['material'] as Record<string, unknown>)['id'] : undefined) ?? anyRaw['ID'];
        let nomeRaw = anyRaw['nome'] ?? anyRaw['name'] ?? anyRaw['materialName'] ?? anyRaw['materialNome'] ?? anyRaw['description'] ?? anyRaw['descricao'] ?? anyRaw['material'];
        if (nomeRaw && typeof nomeRaw === 'object') {
          const nested = nomeRaw as Record<string, unknown>;
          nomeRaw = nested['nome'] ?? nested['name'] ?? nested['materialName'] ?? nested['descricao'] ?? nested['description'];
        }
        const nome = nomeRaw;
        const desc = anyRaw['descricao'] ?? anyRaw['description'] ?? undefined;
        return { id: nid ? Number(nid) : undefined, nome: nome ? String(nome) : undefined, descricao: desc ? String(desc) : undefined } as Material;
      });
    } catch (err) {
      console.error('Erro ao buscar materiais por texto', err);
      return [];
    }
  },

  async getAllMateriais(): Promise<Material[]> {
    try {
      const response = await authApi.get<unknown>(`/api/v1/material/GetAllMateriais`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data as unknown;
      const arr: unknown[] = Array.isArray(respData)
        ? respData
        : (respData && typeof respData === 'object' && 'data' in (respData as Record<string, unknown>) && Array.isArray(((respData as Record<string, unknown>)['data']))
            ? ((respData as Record<string, unknown>)['data'] as unknown[])
            : []);
      return arr.map((raw) => {
        const anyRaw = raw as Record<string, unknown>;
        const nid = anyRaw['id'] ?? anyRaw['materialId'] ?? anyRaw['MaterialId'] ?? undefined;
        const nome = anyRaw['nome'] ?? anyRaw['name'] ?? anyRaw['descricao'] ?? anyRaw['description'] ?? undefined;
        const desc = anyRaw['descricao'] ?? anyRaw['description'] ?? undefined;
        return { id: nid ? Number(nid) : undefined, nome: nome ? String(nome) : undefined, descricao: desc ? String(desc) : undefined } as Material;
      });
    } catch (err) {
      console.error('Erro ao buscar todos os materiais (GetAllMateriais)', err);
      return [];
    }
  },

  async getAllMaterials(): Promise<Material[]> {
    try {
      const response = await authApi.get<unknown>(`/api/v1/marca-material/GetAllMarcaMateriais`, {
        headers: { Authorization: getAuthToken() }
      });
      const respData = response.data as unknown;
      const arr: unknown[] = Array.isArray(respData)
        ? respData
        : (respData && typeof respData === 'object' && 'data' in (respData as Record<string, unknown>) && Array.isArray(((respData as Record<string, unknown>)['data'])) ? ((respData as Record<string, unknown>)['data'] as unknown[]) : []);
      const map = new Map<number, Material>();
      arr.forEach((raw) => {
        const anyRaw = raw as Record<string, unknown>;
        const materialField = anyRaw['material'];
        if (materialField && typeof materialField === 'object') {
          const mat = materialField as Record<string, unknown>;
          const mid = mat['id'] ?? mat['materialId'] ?? mat['MaterialId'] ?? undefined;
          const mname = mat['nome'] ?? mat['name'] ?? mat['descricao'] ?? mat['description'] ?? undefined;
          const mdesc = mat['descricao'] ?? mat['description'] ?? undefined;
          const idNum = mid ? Number(mid) : undefined;
          if (idNum) {
            if (!map.has(idNum)) {
              map.set(idNum, { id: idNum, nome: mname ? String(mname) : undefined, descricao: mdesc ? String(mdesc) : undefined });
            }
          }
        } else {
          const nid = anyRaw['materialId'] ?? anyRaw['id'] ?? anyRaw['MaterialId'] ?? undefined;
          const nome = anyRaw['nome'] ?? anyRaw['name'] ?? anyRaw['description'] ?? anyRaw['descricao'] ?? undefined;
          const desc = anyRaw['descricao'] ?? anyRaw['description'] ?? undefined;
          const idNum = nid ? Number(nid) : undefined;
          if (idNum && !map.has(idNum)) {
            map.set(idNum, { id: idNum, nome: nome ? String(nome) : undefined, descricao: desc ? String(desc) : undefined });
          }
        }
      });
      return Array.from(map.values());
    } catch (err) {
      console.error('Erro ao buscar todos os materiais', err);
      return [];
    }
  }
};