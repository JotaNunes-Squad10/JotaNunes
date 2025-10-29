import SelecionaAmbiente from "./SelecionaAmbiente/page";
import SelecioneItemAmbiente from "./SelecionaItemAmbiente/page";
import AdicionarItensDocumento from "./AdicionarItensDocumento/page";

interface Props {
  ambienteSelecionado: any;
  setAmbienteSelecionado: (value: any) => void;
  itemAmbienteSelecionado: any;
  setItemAmbienteSelecionado: (value: any) => void;
}

export default function AddedItemsInDocument({
  ambienteSelecionado,
  setAmbienteSelecionado,
  itemAmbienteSelecionado,
  setItemAmbienteSelecionado,
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
      />
      <div className="flex mt-3 w-[50%] gap-5">
        <button className="bg-[#0f582a] p-1 w-full text-white  rounded-lg cursor-pointer hover:bg-[#0d4923]">
          Adicionar Item
        </button>
      </div>
    </div>
  );
}