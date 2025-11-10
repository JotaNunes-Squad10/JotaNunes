import SelecionaAmbiente from "./SelecionaAmbiente/page";
import SelecioneItemAmbiente from "./SelecionaItemAmbiente/page";
import AdicionarItensDocumento from "./AdicionarItensDocumento/page";
import { UpdateEmpreendimento } from "@/lib/api";

interface Props {
  ambienteSelecionado: any;
  setAmbienteSelecionado: (value: any) => void;
  itemAmbienteSelecionado: string;
  setItemAmbienteSelecionado: (value: any) => void;
  empreendimento: UpdateEmpreendimento;
  itensDocumento: number[];
  onAddItems: (ids: number[], topicoId: number, ambienteId: number) => void;
}

export default function AddedItemsInDocument({
  ambienteSelecionado,
  setAmbienteSelecionado,
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
  empreendimento,
  itensDocumento,
  onAddItems,
}: Props) {
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
        itensDocumento={itensDocumento}
        empreendimento={empreendimento}
        onAddItems={onAddItems}
      />
    </div>
  );
}
