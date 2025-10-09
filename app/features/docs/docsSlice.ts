import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Topico, ItemsTopico, Documento } from "./docsTypes";

// const itemsUnidadesPrivativas: ItemsTopico[] = [
//   { id: 1, nome: "Área Técnica", materiais: [] },
//   { id: 2, nome: "Circulação", materiais: [] },
//   { id: 3, nome: "Cozinha/Área de Serviço", materiais: [] },
//   { id: 4, nome: "Garden", materiais: [] },
//   { id: 5, nome: "Quarto e Suíte", materiais: [] },
//   { id: 6, nome: "Sanitário/Lavabo", materiais: [] },
//   { id: 7, nome: "Sala de Estar/Jantar", materiais: [] },
//   { id: 8, nome: "Varanda", materiais: [] },
// ];

// const Topic: Topico[] = [
//   {
//     title: "Unidades Privativas".toUpperCase(),
//     items: itemsUnidadesPrivativas,
//   },
//   {
//     title: "Área Comum".toUpperCase(),
//     items: [],
//   },
//   {
//     title: "Marcas",
//     items: [],
//   },
// ];

const Docs: Documento = {
  id: 0,
  empreendimento: "",
  localizacao: "",
  descricaoEmpreendimento: "",
  observacao: "",
  tamanhoArea: 0,
  padrao: "",
  status: "",
  versao: 0,
  topicos: [],
};

interface MaterialPayload {
  topicSelected: string;
  itemSelected: string;
  itemsAdded: {
    id: any;
    nome: any;
  }[];
}

export interface LoadDocumentPayload {
  id: number;
  nome: string;
  descricao: string;
  localizacao: string;
  tamanhoArea: number;
  padrao: string;
  status: string;
  versao: number;
}

interface RemoveMaterialPayload {
  topicSelected: string;
  itemSelected: string;
  materialCode: string;
}

export const docsSlide = createSlice({
  name: "docs",
  initialState: Docs,
  reducers: {
    loadDocument: (state, action: PayloadAction<LoadDocumentPayload>) => {
      state.id = action.payload.id;
      state.empreendimento = action.payload.nome;
      state.descricaoEmpreendimento = action.payload.descricao;
      state.localizacao = action.payload.localizacao;
      state.tamanhoArea = action.payload.tamanhoArea;
      state.padrao = action.payload.padrao;
      state.status = action.payload.status;
      state.versao = action.payload.versao;
    },

    setInitialTopics: (state, action: PayloadAction<Topico[]>) => {
      if (state.topicos.length === 0) {
        state.topicos = action.payload;
      }
    },

    addMaterials: (state, action: PayloadAction<MaterialPayload>) => {
      const { topicSelected, itemSelected, itemsAdded } = action.payload;

      const topic = state.topicos.find((t) => t.title === topicSelected);
      if (!topic) return;

      const item = topic.items.find((i) => i.nome === itemSelected);
      if (!item) return;

      itemsAdded.forEach((mat) => {
        item.materiais.push({
          id: mat.id,
          nome: mat.nome,
          descricao: "",
        });
      });
    },

    removeMaterial: (state, action: PayloadAction<RemoveMaterialPayload>) => {
      const { topicSelected, itemSelected, materialCode } = action.payload;

      const topic = state.topicos.find((t) => t.title === topicSelected);
      if (!topic) return;

      const item = topic.items.find((i) => i.nome === itemSelected);
      if (!item) return;

      item.materiais = item.materiais.filter(
        (mat) => String(mat.id) !== materialCode
      );
    },
  },
});

export const { loadDocument, addMaterials, setInitialTopics, removeMaterial } =
  docsSlide.actions;
export default docsSlide.reducer;
