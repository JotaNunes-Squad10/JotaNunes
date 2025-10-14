"use client";

import React, { useState, useEffect } from "react";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import AdicionarNovoItem from "./AdicionarNovoItem/page";
import { Item, itemService, Marca, marcaService } from "@/lib/api";

interface Props {
  itemAmbienteSelecionado: any;
}

interface AmbienteOption {
  name: string;
  code: string;
  descricao: string;
}


export default function AdicionarItensDocumento(
  { itemAmbienteSelecionado }: Props
  ) {
  const [itensAmbiente, setItensAmbiente] = useState<AmbienteOption[]>([]);
  const [selectedAmbientes, setSelectedAmbientes] = useState<AmbienteOption[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchItens = async () => {
    try {
      setLoading(true);
      setSelectedAmbientes([]); // limpa seleção anterior
      let data: any[] = [];

      console.log("itemAmbienteSelecionado:", itemAmbienteSelecionado);
      
      if (itemAmbienteSelecionado === "Descrição Marcas") {
        data = await marcaService.getAllMarca();
      } else {
        data = await itemService.getAllItem();
      }

      const itensFormatados = data.map((item) => ({
        name: item.nome,
        code: String(item.id),
        descricao: item.descricao,
      }));

      setItensAmbiente(itensFormatados);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchItens();
}, [itemAmbienteSelecionado]);

  return (
    <div className="flex gap-3 items-end w-full">
      <div className="card flex justify-center w-[50%]">
        <MultiSelect
          value={selectedAmbientes}
          onChange={(e: MultiSelectChangeEvent) => setSelectedAmbientes(e.value)}
          options={itensAmbiente}
          optionLabel="name"
          placeholder={
            loading
              ? "Carregando itens..."
              : "Selecione um ou mais Itens de Ambiente"
          }
          className="w-full"
          style={{ minWidth: "350px" }}
          display="chip"
          showClear={selectedAmbientes.length > 0}
          disabled={loading}
        />
      </div>
      <AdicionarNovoItem />
    </div>
  );
}











// import React, { useState } from "react";
// // Trocamos o Dropdown pelo MultiSelect
// import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
// import AdicionarNovoItem from "./AdicionarNovoItem/page";

// // 1. DADOS MOCKADOS (Simulando os itens selecionáveis)
// interface Ambiente {
//   name: string;
//   code: string;
// }

// const mockItensAmbiente: Ambiente[] = [
//   { name: "Sala de Estar/Jantar", code: "UP-7" },
//   { name: "Área Técnica", code: "UP-1" },
//   { name: "Academia", code: "AC-1" },
//   { name: "Brinquedoteca", code: "AC-4" },
//   { name: "Descrição Marcas", code: "MA-1" },
//   { name: "Piscina", code: "AC-5" },
//   { name: "Garagem", code: "AC-6" },
//   { name: "Acabamento Externo", code: "MA-2" },
//   { name: "Acabamento Interno", code: "MA-3" },
//   { name: "Ar Condicionado", code: "MA-4" },
// ];

// export default function AdicionarItensDocumento() {
//   // O estado agora armazena um ARRAY de objetos, pois é MultiSelect
//   const [selectedAmbientes, setSelectedAmbientes] = useState<Ambiente[]>([]);

//   // Inicializa o estado com alguns itens para simular o visual da imagem
//   // useEffect(() => {
//   //   setSelectedAmbientes([mockItensAmbiente[7], mockItensAmbiente[8], mockItensAmbiente[9]]);
//   // }, []);

//   return (
//     <div className="flex gap-3 items-end w-full">
//       {/* Container do MultiSelect, ocupando 50% ou o necessário */}
//       <div className="card flex justify-center w-[50%]">
//         <MultiSelect
//           value={selectedAmbientes} // Passa o array de itens selecionados
//           onChange={(e: MultiSelectChangeEvent) =>
//             setSelectedAmbientes(e.value)
//           } // Atualiza o array
//           options={mockItensAmbiente} // Usa os dados mockados
//           optionLabel="name"
//           placeholder="Selecione um ou mais Itens de Ambiente"
//           className="w-full"
//           // Classes para estilização parecida com a imagem (PrimeReact já faz a maior parte)
//           style={{ minWidth: "350px" }}
//           display="chip" // Mostra os itens selecionados como chips/tags
//           showClear={selectedAmbientes.length > 0} // Permite limpar todos os itens
//         />
//       </div>
//       <AdicionarNovoItem />
//     </div>
//   );
// }
