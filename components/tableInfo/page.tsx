import { X } from "lucide-react";
import DescricaoPage from "../descricao/page";
import DropBoxSubSelect from "../sections/DropBoxSubSelect";

interface Items {
  name: string;
  code: string;
}

interface CustomTableProps {
  data: Items[];
}

export default function CustomTable({ data }: CustomTableProps) {
  if (data.length === 0) {
    return <p className="text-gray-500">Nenhum item selecionado</p>;
  }

  const optionsDescripton: string[] = DescricaoPage.map((item) => item.nome);

  return (
    <div className="w-full overflow-x-auto mt-5">
      <table className="table-auto w-full max-w-4xl border-collapse">
        <thead>
          <tr className="bg-gray-100 text-sm">
            <th className="text-left px-2 py-2 font-semibold text-black w-1/4 min-w-[200px]">
              Item
            </th>
            <th className="text-left px-2 py-2 font-semibold text-black w-3/5 min-w-[400px]">
              Descrição
            </th>
            <th className="px-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.code} className="border-t border-gray-300 text-sm">
              <td className="px-2 py-2 text-gray-700 w-1/4 min-w-[200px]">
                {item.name}
              </td>
              <td className="px-2 py-2 text-gray-700 w-3/5 min-w-[400px]">
                <DropBoxSubSelect
                  options={optionsDescripton}
                  className="mb-2 w-[100%]"
                />
              </td>
              <td className="px-2 py-2 text-red-500 cursor-pointer w-10">
                <X
                  size={18}
                  className="hover:bg-red-200 hover:bg-opacity-30 rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
