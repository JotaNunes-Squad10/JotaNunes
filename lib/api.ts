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

// Configuração da API principal
export const api = axios.create({
  baseURL: "https://jotanunesservice.onrender.com",
  // aumentar timeout global para 30s para evitar erros em requisições lentas
  timeout: 30000,
});

// API para endpoints de autenticação (sempre produção)
export const authApi = axios.create({
  baseURL: "https://jotanunesservice.onrender.com",
  // aumentar timeout global para 30s
  timeout: 30000,
});

// Serviços de Autenticação
export const authService = {
  // Função para autenticar usuário
  async authenticate(payload: AuthenticatePayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/api/v1/authentication/Authenticate", payload);
    return response.data;
  },

  // Função para buscar usuário por username
  async getUserByUsername(username: string): Promise<UserInfo> {
    try {
      const response = await authApi.get<UserInfo>(`/api/v1/authentication/GetUserByUsername/${username}`);
      return response.data;
    } catch {
      // Retorna um mock para permitir que o modal abra mesmo com erro
      return {
        data: {
          requiredActions: ["UPDATE_PASSWORD"]
        }
      };
    }
  },

  // Função para atualizar senha
  async updatePassword(payload: UpdatePasswordPayload): Promise<UpdatePasswordResponse> {
    const response = await authApi.patch("/api/v1/authentication/UpdatePassword", payload);
    return response.data;
  }
};

// Interceptors para tratamento global de erros (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na Auth API:', error);
    return Promise.reject(error);
  }
);