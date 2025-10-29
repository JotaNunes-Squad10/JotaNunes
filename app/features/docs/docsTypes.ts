export type Material = {
  id: string | number;
  nome: string;
  descricao: string | "";
};

export type Topico = {
  title: string;
  items: ItemsTopico[];
};

export type ItemsTopico = {
  id: number;
  nome: string;
  materiais: Material[];
};

export type Documento = {
  id: number;
  empreendimento: string;
  localizacao: string;
  descricaoEmpreendimento: string;
  observacao: string;
  topicos: Topico[];
};

export interface Categories {
  title: string;
  items: string[];
}
