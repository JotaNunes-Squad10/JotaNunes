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
  id?: number;
  nome: string;
  descricao: string;
}

export interface Marca {
  id: number;
  nome: string;
}

export interface MarcaMateriais {
  id: number;
  marca: {
    id: number;
    nome: string;
  };
  material: {
    id: number;
    nome: string;
  };
}

interface MarcaMateriaisGet {
  data: MarcaMateriais[];
}

export interface CreateMarca {
  nome: string;
  materialIds: number[];
}

export interface CreateMarcaResponse {
  data: {
    id: number;
    nome: string;
  };
  validationResult: {
    isValid: boolean;
    errors: string[];
    ruleSetsExecuted: string[] | null;
  };
}

export interface CreateMaterialPayload {
  nome: string;
  marcaIds: number[];
}

export interface GetAllMarcasByMaterialId {
  materialId: number;
  material: string;
  marcas: string[];
}

export interface GetAllTopicResponse {
  data: Topico[];
}

export interface CreateTopicPayload {
  nome: string;
}

export interface DeleteTopicPayload {
  id: number;
}

export interface DeleteTopicResponse {
  data: {
    id: number;
    nome: string;
  };
  validationResult: {
    isValid: boolean;
    errors: string[];
    ruleSetsExecuted: string | null;
  };
}

export interface GetAllItemResponse {
  data: Item[];
}

export interface GetItemById {
  data: Item;
}

// Interface dos subitems do tópico ambientes
export type SubTopic = {
  id: number;
  nome: string;
  topico: Topico;
};

export interface GetAllSubTopicProps {
  data: SubTopic[];
}

export interface GetAllItemProps {
  data: Item[];
}

export interface GetAllMarcaProps {
  data: Marca[];
}

// Interfaces do endpoint Ambiente
export interface CreateAmbientePayload {
  nome: string;
  topicoId: number;
}

export interface CreateDocumentoPayload {
  nome: string;
  descricao: string;
  tamanhoArea: number;
  localizacao: string;
  padrao: number;
  empreendimentoTopicos: EmpreendimentosTopicos[];
}

export interface DocumentoPayloadResponse {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  padrao: string;
  status: string;
  versao: number;
  usuarioAlteracao: string | null;
  dataHoraAlteracao: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  ruleSetsExecuted: string[] | null;
}

export interface CreateEmpreendimentoResponse {
  data: DocumentoPayloadResponse;
  validationResult: ValidationResult;
}

// Interface do GetTopicId
export interface GetDocumentoById {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  padrao: string;
  status: string;
  versao: number;
  tamanhoArea: number;
  usuarioAlteracao: string;
  dataHoraAlteracao: string;
  empreendimentos: Empreendimento[];
  empreendimentoTopicos: EmpreendimentosTopicos[];
}

export interface Empreendimento {
  id: number;
  nome: string;
  descricao: string;
  localizacao: string;
  padrao: string;
  versao: number;
}

export interface EmpreendimentosTopicos {
  topicoId: number;
  posicao: number;
  versoes: number[];
  topicoAmbientes: TopicoAmbiente[];
  ambienteItens: AmbienteItens[];
}

export interface TopicoAmbiente {
  ambienteId: number;
  posicao: number;
  versoes: number[];
  ambienteItens: AmbienteItens[];
}

export interface AmbienteItens {
  itemId: number;
  versoes: number[];
}

export interface TopicoMaterial {
  materialId: number;
  versoes: number[];
}

export interface EmprendimentoTopico {
  topicoId: number;
  posicao: number;
  topicoAmbientes: {
    ambienteId: number;
    area: number;
    posicao: number;
    ambienteItens: { itemId: number }[]; // ✅ array normal
  }[];
  topicoMateriais: { materialId: number; versoes?: number[] }[] | null; // ✅ permite null
}

// Interface do Payload PUT
export interface UpdateEmpreendimento {
  id: string;
  nome: string;
  descricao: string;
  localizacao: string;
  tamanhoArea: number;
  padrao: number;
  empreendimentoTopicos: EmprendimentoTopico[];
}

export interface UpdateEmpreendimentoResponse {
  data: {
    data: DocumentoPayloadResponse;
    validationResult: ValidationResult;
  };
}

export interface UpdateEmpreendimentoStatusResponse {
  data: {
    data: DocumentoPayloadResponse;
    validationResult: ValidationResult;
  };
}

// Configuração da API principal
export const api = axios.create({
  baseURL: "https://jotanunesservice.onrender.com",
  timeout: 10000,
});

// API para endpoints de autenticação (sempre produção)
export const authApi = axios.create({
  baseURL: "https://jotanunesservice.onrender.com",
  timeout: 10000,
});

// Serviços de Autenticação
export const authService = {
  // Função para autenticar usuário
  async authenticate(
    payload: AuthenticatePayload
  ): Promise<AuthenticatePayload> {
    const response = await api.post<AuthenticatePayload>(
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

  async createTopic(payload: CreateTopicPayload): Promise<string> {
    const response = await api.post<string>(
      "https://jotanunesservice.onrender.com/api/v1/topico/CreateTopico",
      payload
    );
    return response.data;
  },

  async deleteTopic(payload: DeleteTopicPayload): Promise<DeleteTopicResponse> {
    const response = await axios.delete<DeleteTopicResponse>(
      `https://jotanunesservice.onrender.com/api/v1/topico/DeleteTopico/${payload.id}`
    );
    return response.data;
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

  async getItemById(id: number): Promise<Item> {
    const response = await axios.get<GetItemById>(
      `https://jotanunesservice.onrender.com/api/v1/items/GetItemById/${id}`
    );

    return response.data.data;
  },

  async updateItem(payload: { id: number; nome: string; descricao: string }) {
    const response = await axios.patch(
      "https://jotanunesservice.onrender.com/api/v1/items/UpdateItem",
      payload
    );
    return response.data;
  },
};

export const marcaService = {
  async getAllMarca(): Promise<Marca[]> {
    const response = await axios.get<GetAllMarcaProps>(
      "https://jotanunesservice.onrender.com/api/v1/marca/GetAllMarcas"
    );

    return response.data.data;
  },

  async getAllMarcaMateriais(): Promise<MarcaMateriais[]> {
    const response = await axios.get<MarcaMateriaisGet>(
      "https://jotanunesservice.onrender.com/api/v1/marca-material/GetAllMarcaMateriais"
    );

    return response.data.data;
  },

  async createMarca(payload: CreateMarca): Promise<CreateMarcaResponse> {
    const response = await axios.post<CreateMarcaResponse>(
      "https://jotanunesservice.onrender.com/api/v1/marca/CreateMarca",
      payload
    );

    return response.data;
  },
};

export const MarcaMaterial = {
  async getAllMarcasByMaterialId(
    materialId: number
  ): Promise<GetAllMarcasByMaterialId> {
    try {
      const response = await axios.get(
        `https://jotanunesservice.onrender.com/api/v1/marca-material/GetAllMarcasByMaterialId/${materialId}`
      );

      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar marcas pelo id do matérial", error);
      throw error;
    }
  },
};

// Materiais marcas
export const MaterialService = {
  async getAllMateriais(): Promise<Marca[]> {
    const response = await axios.get(
      "https://jotanunesservice.onrender.com/api/v1/material/GetAllMateriais"
    );
    return response.data.data;
  },

  async createMaterial(payload: CreateMaterialPayload) {
    const response = await axios.post(
      "https://jotanunesservice.onrender.com/api/v1/material/CreateMaterial",
      payload
    );
    return response.data;
  },

  async updateMaterial(payload: { id: number; nome: string; marcaId: number }) {
    const response = await axios.patch(
      "https://jotanunesservice.onrender.com/api/v1/material/UpdateMaterial",
      payload
    );
    return response.data;
  },
};

export const AmbienteService = {
  // A possibilidade de não estar funcionando
  async createAmbiente(
    payload: CreateAmbientePayload
  ): Promise<{ id: number; nome: string; topicoId: number }> {
    const response = await axios.post(
      "https://jotanunesservice.onrender.com/api/v1/ambiente/CreateAmbiente",
      payload
    );

    return response.data;
  },
};

export const ItemsServie = {
  async createItem(payload: Item): Promise<Item> {
    const response = await axios.post<Item>(
      "https://jotanunesservice.onrender.com/api/v1/items/CreateItem",
      payload
    );

    return response.data;
  },
};

// Configuração da API do Documento
export const DocumentoService = {
  async createDocumento(
    payload: CreateDocumentoPayload
  ): Promise<CreateEmpreendimentoResponse> {
    const response = await axios.post<CreateEmpreendimentoResponse>(
      "https://jotanunesservice.onrender.com/api/v1/empreendimento/CreateEmpreendimento",
      payload
    );

    return response.data;
  },

  async getDocumentoById(
    documentId: string
  ): Promise<GetDocumentoById | undefined> {
    try {
      const response = await axios.get<{
        data: GetDocumentoById;
      }>(
        `https://jotanunesservice.onrender.com/api/v1/empreendimento/GetEmpreendimentoById/${documentId}`
      );

      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar informações do documento:", error);
      return undefined;
    }
  },

  async updateEmpreendimento(
    payload: UpdateEmpreendimento
  ): Promise<UpdateEmpreendimentoResponse> {
    try {
      const response = await axios.put<UpdateEmpreendimentoResponse>(
        "https://jotanunesservice.onrender.com/api/v1/empreendimento/UpdateEmpreendimento",
        payload
      );

      return response.data;
    } catch (error) {
      console.error("Houve um erro ao tentar modificar o documento", error);
      throw error;
    }
  },

  async updateEmpreendimentoStatus(
    idDocumento: string,
    status: number
  ): Promise<UpdateEmpreendimentoStatusResponse> {
    const payload = {
      id: idDocumento,
      status: status,
    };

    try {
      const response = await axios.patch<UpdateEmpreendimentoStatusResponse>(
        "https://jotanunesservice.onrender.com/api/v1/empreendimento/UpdateEmpreendimentoStatus",
        payload
      );

      return response.data;
    } catch (error) {
      console.error("Houve um erro ao atualizar o status do documento", error);
      throw error;
    }
  },
};
