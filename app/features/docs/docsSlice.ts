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
  id: 1,
  empreendimento: "Pérolas do mar",
  localizacao: "Coroa do meio",
  descricaoEmpreendimento: "Empreendimento na coroa do meio",
  observacao: "Nenhuma observação",
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
}

export const docsSlide = createSlice({
  name: "docs",
  initialState: Docs,
  reducers: {
    loadDocument: (state, action: PayloadAction<LoadDocumentPayload>) => {
      state.id = action.payload.id;
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
  },
});

export const { loadDocument, addMaterials, setInitialTopics } =
  docsSlide.actions;
export default docsSlide.reducer;
