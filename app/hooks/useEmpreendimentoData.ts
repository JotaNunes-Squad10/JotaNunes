import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Item,
  Ambiente,
  ItemsTopico,
  Topico,
  Categories,
} from "@/app/features/docs/docsTypes";

// Interfaces locais para o hook
interface FetchedItem {
  id: number;
  nome: string;
}

interface FetchedAmbiente {
  id: number;
  nome: string;
}

// Mapeamento de Items para a estrutura do Dropdown/Filtro
export interface ItemOption {
  name: string;
  code: string;
}

// Adicionar uma interface para os items retornados pela API/GetAllTopicos
interface FetchedTopico {
  id: number;
  nome: string;
}

/**
 * Hook para buscar dados da API e estruturar tópicos e categorias.
 * @returns {object} Dados e funções necessários para a página.
 */
export function useEmpreendimentoData() {
  const [itemsData, setItemsData] = useState<FetchedItem[]>([]);
  const [ambientesData, setAmbientesData] = useState<FetchedAmbiente[]>([]);
  const [topicosData, setTopicosData] = useState<FetchedTopico[]>([]);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Função de recarregamento
  const refetchTopicos = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  // 1. Fetch de Itens --> Materiais
  useEffect(() => {
    axios
      .get("https://jotanunesservice.onrender.com/api/v1/items/GetAllItems")
      .then((res) => setItemsData(res.data.data))
      .catch((error) => console.error("Erro ao buscar items:", error));
  }, []);

  // 2. Fetch de Ambientes da Área Comum
  useEffect(() => {
    axios
      .get(
        "https://jotanunesservice.onrender.com/api/v1/ambiente/GetAllAmbientes"
      )
      .then((res) => setAmbientesData(res.data.data))
      .catch((error) => console.error("Erro ao buscar ambientes:", error));
  }, []);

  // 3. Fetch de Tópicos
  useEffect(() => {
    const fetchTopicos = async () => {
      try {
        const res = await axios.get(
          "https://jotanunesservice.onrender.com/api/v1/topico/GetAllTopicos"
        );
        setTopicosData(res.data.data);
      } catch (error) {
        console.error("Erro ao buscar tópicos:", error);
      }
    };
    fetchTopicos();
  }, [refetchTrigger]);

  // 4. Estruturação dos Tópicos (useMemo para evitar recálculo desnecessário)
  const Topic: Topico[] = useMemo(() => {
    if (topicosData.length === 0 || ambientesData.length === 0) return [];

    // const apiTopicoMap = new Map<string, Topico>();

    // topicosData.forEach((t) => {
    //   // Inicializa o tópico com os dados da API e uma lista vazia de items
    //   apiTopicoMap.set(t.nome, {
    //     title: t.nome,
    //     items: [],
    //   });
    // });

    // --- Definir os Itens (Componentes do Tópico) ---
    // Ambientes e definindo os itens/materiais de Univades Privativas
    const itemsUnidadesPrivativas: ItemsTopico[] = [
      { id: 1, nome: "Área Técnica", materiais: [] },
      { id: 2, nome: "Circulação", materiais: [] },
      { id: 3, nome: "Cozinha/Área de Serviço", materiais: [] },
      { id: 4, nome: "Garden", materiais: [] },
      { id: 5, nome: "Quarto e Suíte", materiais: [] },
      { id: 6, nome: "Sanitário/Lavabo", materiais: [] },
      { id: 7, nome: "Sala de Estar/Jantar", materiais: [] },
      { id: 8, nome: "Varanda", materiais: [] },
    ];

    const AmbientesItems: ItemsTopico[] = ambientesData.map((a) => ({
      id: a.id,
      nome: a.nome,
      materiais: [],
    }));

    const DescricaoMarcaItems: ItemsTopico[] = [
      { id: 1, nome: "Drescrição da Marca", materiais: [] },
    ];

    // --- Injetar os Items nos Tópicos Baseados no Título ---

    // // 1. Unidades Privativas (Assumindo que o título da API é "1. Unidades Privativas")
    // const upTitle =
    //   topicosData.find((t) => t.nome.includes("UNIDADES PRIVATIVAS"))?.nome ||
    //   "1. Unidades Privativas";
    // if (apiTopicoMap.has(upTitle)) {
    //   apiTopicoMap.get(upTitle)!.items = itemsUnidadesPrivativas;
    // }

    // // 2. Área Comum
    // const acTitle =
    //   topicosData.find((t) => t.nome.includes("ÁREA COMUM"))?.nome ||
    //   "2. Área Comum";
    // if (apiTopicoMap.has(acTitle)) {
    //   apiTopicoMap.get(acTitle)!.items = AmbientesItems;
    // }

    // // 3. Marcas
    // const marcasTitle =
    //   topicosData.find((t) => t.nome.includes("Marcas"))?.nome || "3. Marcas";
    // if (apiTopicoMap.has(marcasTitle)) {
    //   apiTopicoMap.get(marcasTitle)!.items = DescricaoMarcaItems;
    // }

    const topicsWithIems: Topico[] = topicosData.map((apiTopic) => {
      let itemsForTopic: ItemsTopico[] = [];

      // Todo: Fazer uma lógica para que os itemsForTopic seja relacionado ao seu respectivo tópico
      // 1. Tópicos conhecidos que têm itens estáticos/dinâmicos
      if (apiTopic.nome.includes("UNIDADES PRIVATIVAS")) {
        itemsForTopic = itemsUnidadesPrivativas;
      } else if (apiTopic.nome.includes("ÁREA COMUM")) {
        itemsForTopic = AmbientesItems;
      } else if (apiTopic.nome.includes("Marcas")) {
        itemsForTopic = DescricaoMarcaItems;
      }

      // Os tópicos novos não cairam em nenhuma condição, terão itemsForTopic vazio
      // Por enquanto está esse requisito

      return {
        title: apiTopic.nome,
        items: itemsForTopic,
      };
    });

    return topicsWithIems;
  }, [ambientesData, topicosData]); // Recalcula se os dados de ambientes mudarem

  // 4. Estruturação das Categorias para o Sidebar/Dropdown (useMemo)
  const categories: Categories[] = useMemo(() => {
    return Topic.map((t) => ({
      title: t.title,
      items: t.items.map((i) => i.nome),
    }));
  }, [Topic]);

  // 5. Mapeamento dos Itens disponíveis para o FilterDemo (useMemo)
  const availableItemOptions: ItemOption[] = useMemo(() => {
    return itemsData.map((item) => ({
      name: item.nome,
      code: item.nome, // Usando nome como código para o exemplo
    }));
  }, [itemsData]);

  return {
    Topic,
    categories,
    availableItemOptions,
    refetchTopicos,
    // Documento é estático no seu código, mas em um cenário real viria de uma API.
    // Por enquanto, mantemos ele como um objeto "mock" ou o movemos para onde será usado.
    // O código original não está usando 'Docs' além de defini-lo.
    // Docs: { ... }
  };
}
