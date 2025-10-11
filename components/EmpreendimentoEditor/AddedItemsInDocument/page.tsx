import SelecionaAmbiente from "./SelecionaAmbiente/page";
import SelecioneItemAmbiente from "./SelecionaItemAmbiente/page";

export default function AddedItemsInDocument() {
  return (
    <div className="mt-5">
      <h3 className="mb-3">Adicionar Itens</h3>
      <SelecionaAmbiente />
      <SelecioneItemAmbiente />
    </div>
  );
}
