import SelecionaAmbiente from "./SelecionaAmbiente/page";
import SelecioneItemAmbiente from "./SelecionaItemAmbiente/page";

export default function AddedItemsInDocument() {
  return (
    <div className="mt-5">
      <h3 className="mb-3 font-bold">Adicionar Itens</h3>
      <SelecionaAmbiente />
      <SelecioneItemAmbiente />
      <div className="flex mt-3 w-[50%] gap-5">
        <button className="bg-[#0f582a] p-1 w-full text-white  rounded-lg cursor-pointer hover:bg-[#0d4923]">
          Adicionar Item
        </button>
      </div>
    </div>
  );
}
