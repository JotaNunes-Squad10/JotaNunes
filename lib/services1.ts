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