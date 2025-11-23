import axios from "axios";

// Tipos para as respostas da API
export interface LoginResponse {
  data: {
    accessToken: string;
  };
}

export interface UserInfo {
  data: {
    requiredActions: string[];
  };
}

export interface UpdatePasswordResponse {
  success: boolean;
  message?: string;
}

export interface UpdatePasswordPayload {
  username: string;
  currentPassword: string;
  newPassword: string;
}

export interface AuthenticatePayload {
  username: string;
  password: string;
}

// Interface para API de tópicos
export interface Topico {
  id: number;
  nome: string;
}

export interface Item {
  id: number;
  nome: string;
  descricao: string;
}

export interface Marca {
  id: number;
  nome: string;
}


export interface Empreendimento {
  id: number;
  nome: string;
  descricao: string;
  localizacao: string;
  tamanhoArea: number;
  padrao: string;
  status: string;
  versao: number;
}

export interface GetAllTopicResponse {
  data: Topico[];
}

export interface GetAllItemResponse {
  data: Item[];
}

// Interface dos subitems do tópico ambientes
export type SubTopic = Topico;

export interface GetAllSubTopicProps {
  data: SubTopic[];
}

export interface GetAllItemProps {
  data: Item[];
}

export interface GetAllMarcaProps {
  data: Marca[];
}

export interface GetAllEmpreendimentoProps {
  data: Empreendimento[];
}

export interface GenerateDocumentoPayload {
  id: string;
  version: number;
}

export interface GenerateDocumentoResponse {
  data: string;
  validationResult: {
    isValid: boolean;
    errors: string[];
    ruleSetsExecuted?: string[] | null;
  };
}

// Interface para atualização completa do empreendimento
export interface UpdateEmpreendimentoPayload {
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
}

// Configuração da API principal
export const api = axios.create({
  baseURL: "https://jotanunesservice.onrender.com",
  timeout: 60000,
});

// API para endpoints de autenticação (sempre produção)
export const authApi = axios.create({
  baseURL: "https://jotanunesservice.onrender.com",
  timeout: 60000,
});

// Serviços de Autenticação
export const authService = {
  // Função para autenticar usuário
  async authenticate(payload: AuthenticatePayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      "/api/v1/authentication/Authenticate",
      payload
    );
    return response.data;
  },

  // Função para buscar usuário por username
  async getUserByUsername(username: string): Promise<UserInfo> {
    try {
      const response = await authApi.get<UserInfo>(
        `/api/v1/authentication/GetUserByUsername/${username}`
      );
      return response.data;
    } catch {
      // Retorna um mock para permitir que o modal abra mesmo com erro
      return {
        data: {
          requiredActions: ["UPDATE_PASSWORD"],
        },
      };
    }
  },

  // Função para atualizar senha
  async updatePassword(
    payload: UpdatePasswordPayload
  ): Promise<UpdatePasswordResponse> {
    const response = await authApi.patch(
      "/api/v1/authentication/UpdatePassword",
      payload
    );
    return response.data;
  },
};

// Interceptors para tratamento global de erros (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error);
    return Promise.reject(error);
  }
);

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na Auth API:", error);
    return Promise.reject(error);
  }
);



// Configurações da API Tópicos
export const topicoService = {
  async getAllTopic(): Promise<Topico[]> {
    const response = await axios.get<GetAllTopicResponse>(
      "https://jotanunesservice.onrender.com/api/v1/topico/GetAllTopicos"
    );
    return response.data.data;
  },
};

// Configuração da API de Items
export const subTopicosAmbienteService = {
  async getAllAmbiente(): Promise<SubTopic[]> {
    const response = await axios.get<GetAllSubTopicProps>(
      "https://jotanunesservice.onrender.com/api/v1/ambiente/GetAllAmbientes"
    );

    return response.data.data;
  },
};

export const itemService = {
  async getAllItem(): Promise<Item[]> {
    const response = await axios.get<GetAllItemProps>(
      "https://jotanunesservice.onrender.com/api/v1/items/GetAllItems"
    );

    return response.data.data;
  },
};

export const marcaService = {
  async getAllMarca(): Promise<Marca[]> {
    const response = await axios.get<GetAllMarcaProps>(
      "https://jotanunesservice.onrender.com/api/v1/marca/GetAllMarcas"
    );

    return response.data.data;
  },
};

export const empreendimentoService = {
  async getAllEmpreendimento(): Promise<Empreendimento[]> {
    const response = await axios.get<GetAllEmpreendimentoProps>(
      "https://jotanunesservice.onrender.com/api/v1/empreendimento/GetAllEmpreendimentos"
    );

    return response.data.data;
  },
};

// Configuração da API do Documento
export const DocumentoService = {
  async generateDocumento(payload: GenerateDocumentoPayload): Promise<GenerateDocumentoResponse> {
    const response = await axios.post<GenerateDocumentoResponse>(
      "https://jotanunesservice.onrender.com/api/v1/empreendimento/GenerateDocumentoEmpreendimento",
      payload
    );
    return response.data;
  },

  async getDocumentoById(documentId: string): Promise<Empreendimento | null> {
    try {
      const response = await axios.get(
        `https://jotanunesservice.onrender.com/api/v1/empreendimento/GetEmpreendimentoById/${documentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar informações do documento:", error);
    }

    return null;
  },
};

