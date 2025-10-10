import { menuData } from "../getTopicos/getTopicos";
import SelecionaAmbiente from "./SelecionaAmbiente/page";
import SelecioneItemAmbiente from "./SelecionaItemAmbiente/page";

export default function AddedItemsInDocument() {
  return (
    <div className="mt-5">
      <h3>Adicionar Itens</h3>
      <SelecionaAmbiente />
      <SelecioneItemAmbiente />
    </div>
  );
}
