import SelecionaAmbiente from "./SelecionaAmbiente/page";
import SelecioneItemAmbiente from "./SelecionaItemAmbiente/page";
import AdicionarItensDocumento from "./AdicionarItensDocumento/page";
import { MarcaMateriais, UpdateEmpreendimento } from "@/lib/api1";
import { useEffect } from "react";

interface Props {
  ambienteSelecionado: string; // tópico selecionado
  setAmbienteSelecionado: (value: string) => void;

  itemAmbienteSelecionado: string; // ambiente selecionado
  setItemAmbienteSelecionado: (value: string) => void;

  empreendimento: UpdateEmpreendimento;

  itensDocumento: number[];

  itemMarcaMateriais: MarcaMateriais[];

  // Handlers recebidos do EmpreendimentoEditor
  onAddItems: (ids: number[], topicoId: number, ambienteId: number) => void;
  onAddMateriais: (ids: number[], topicoId: number) => void;
}

export default function AddedItemsInDocument({
  ambienteSelecionado,
  setAmbienteSelecionado,
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
  empreendimento,
  itensDocumento,
  itemMarcaMateriais,
  onAddItems,
  onAddMateriais,
}: Props) {
  const isMarcas = ambienteSelecionado.toUpperCase() === "MARCAS";
  const TOPICO_MARCAS = 3;

  // Se o usuário selecionou MARCAS, limpamos ambiente (ex: “Academia”, “Piscina”…)
  useEffect(() => {
    if (isMarcas) {
      setItemAmbienteSelecionado(""); // desabilita ambiente
    }
  }, [ambienteSelecionado]);

  return (
    <div className="mt-5">
      <h3 className="mb-3 font-bold">Adicionar Itens</h3>
      <SelecionaAmbiente
        ambienteSelecionado={ambienteSelecionado}
        setAmbienteSelecionado={setAmbienteSelecionado}
      />
      <SelecioneItemAmbiente
        itemAmbienteSelecionado={itemAmbienteSelecionado}
        setItemAmbienteSelecionado={setItemAmbienteSelecionado}
        ambienteSelecionado={ambienteSelecionado}
      />
      <h3 className="mb-3 font-bold">Itens</h3>
      <AdicionarItensDocumento
        itemAmbienteSelecionado={itemAmbienteSelecionado}
        empreendimento={empreendimento}
        itensDocumento={itensDocumento}
        itemMarcaMateriais={itemMarcaMateriais}
        ambienteSelecionado={ambienteSelecionado}
        onAddItems={(ids, topicoId, ambienteId) => {
          // AMBIENTES NORMAIS
          if (!isMarcas) {
            onAddItems(ids, topicoId, ambienteId);
            return;
          }

          // MARCAS (topico 3)
          onAddMateriais(ids, TOPICO_MARCAS);
        }}
      />
    </div>
  );
}
