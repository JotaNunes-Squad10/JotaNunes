import { X } from "lucide-react";
import ItemPage from "../item/page";
import DescricaoPage from "../descricao/page";
import DropBoxSubSelect from "../sections/DropBoxSubSelect";

export default function CustomTable() {
  //   const items = [
  //     { item: "Piso", descricao: "Porcelanato" },
  //     {
  //       item: "Parede",
  //       descricao:
  //         "Pintura PVA látex branco sobre gesso ou massa de regulariação PVA",
  //     },
  //     {
  //       item: "Teto",
  //       descricao:
  //         "Pintura PVA látex branco sobre gesso ou massa de egularização PVA",
  //     },
  //     { item: "Filete", descricao: "Mármore L=3,5cm" },
  //     { item: "Cordão de Box", descricao: "Mármore" },
  //     {
  //       item: "Bancada",
  //       descricao: "Em mármore ou granito com cuba em louça cor branca",
  //     },
  //     {
  //       item: "Porta",
  //       descricao: "Porta semi-ôca comum pintura c/ esmalte sintético",
  //     },
  //     { item: "Peitoril", descricao: "Metálico" },
  //     { item: "Ferragem", descricao: "Acabamento cromado" },
  //     { item: "Esquadria", descricao: "Alumínio pintado de branco" },
  //     { item: "Vidro", descricao: "Pontilhado Incolor" },
  //     {
  //       item: "Metal Sanitário",
  //       descricao:
  //         "Torneira para Lavatório, registro de gaveta e registro de pressão com acabamento cromado",
  //     },
  //     {
  //       item: "Louças",
  //       descricao: "Vaso Sanitário com Caixa Acoplada em louça cor branca",
  //     },
  //     {
  //       item: "Inst. Elétrica",
  //       descricao:
  //         "Pontos de luz no teto, tomada de corrente e interruptor da Prime, Alumbra, Cemar ou Fame na cor branco",
  //     },
  //   ];

  const optionsItem: string[] = ItemPage.map((item) => item.nome);
  const optionsDescripton: string[] = DescricaoPage.map((item) => item.nome);

  return (
    <div className="overflow-x-auto w-full max-w-7xl">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left px-4 py-2 font-semibold text-black">
              Item
            </th>
            <th className="text-left px-4 py-2 font-semibold text-black">
              Descrição
            </th>
            <th className="px-2"></th> {/* coluna do ícone */}
          </tr>
        </thead>
        <tbody>
          {/* {items.map((row, index) => (
            <tr key={index} className="border-t border-gray-300">
              <td className="px-4 py-2 align-top text-gray-400">{row.item}</td>
              <td className="px-4 py-2 align-top text-gray-400">
                {row.descricao}
              </td>
              <td className="px-2 py-2 align-top text-red-500 cursor-pointer">
                <X size={16} />
              </td>
            </tr>
          ))} */}
          <tr className="border-t border-gray-300">
            <td className="px-4 py-2 align-top text-gray-400">
              <DropBoxSubSelect options={optionsItem} />{" "}
            </td>
            <td className="px-4 py-2 align-top text-gray-400">
              <DropBoxSubSelect options={optionsDescripton} />{" "}
            </td>
            <td className="px-2 py-2 align-top text-red-500 cursor-pointer">
              <X size={16} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
