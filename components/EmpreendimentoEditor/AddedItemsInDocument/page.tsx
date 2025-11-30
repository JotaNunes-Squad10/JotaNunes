import SelecionaAmbiente from "./SelecionaAmbiente/page";
import SelecioneItemAmbiente from "./SelecionaItemAmbiente/page";
import AdicionarItensDocumento from "./AdicionarItensDocumento/page";
import { UpdateEmpreendimento } from "@/lib/api1";
import { useEffect } from "react";

interface Props {
  ambienteSelecionado: string;
  setAmbienteSelecionado: (value: string) => void;

  itemAmbienteSelecionado: string;
  setItemAmbienteSelecionado: (value: string) => void;

  empreendimento: UpdateEmpreendimento;

  itensDocumento: number[];

  itemMarcaMateriais: { id: number; nome: string }[];

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

  useEffect(() => {
    if (isMarcas) {
      setItemAmbienteSelecionado("");
    }
  }, [ambienteSelecionado, isMarcas, setItemAmbienteSelecionado]);

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
          if (!isMarcas) {
            onAddItems(ids, topicoId, ambienteId);
            return;
          }

          onAddMateriais(ids, TOPICO_MARCAS);
        }}
      />
    </div>
  );
}
