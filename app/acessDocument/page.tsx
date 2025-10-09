"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AcessDocument() {
  const router = useRouter();

  const documentos = [
    {
      id: 1,
      titulo: "Torre PC - Mais Viver",
      descricao: "Lorem ipsum dolor sit amet.",
    },
    { id: 2, titulo: "Vida Bela", descricao: "Empreendimento em Farolândia." },
  ];

  const handleCreateNew = () => {
    router.push("/empreendimentoTeste/0");
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Recentes</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="border rounded-md p-4 shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              <Link href={`/empreendimentoTeste/${doc.id}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600 text-2xl">📄</span>
                  <h2 className="font-semibold">{doc.titulo}</h2>
                </div>
                <p className="text-gray-600 mt-2 text-sm">{doc.descricao}</p>
              </Link>
            </div>
          ))}
        </div>

        <div className="border rounded-md p-6 bg-white shadow-md">
          <h3 className="font-semibold text-lg mb-2">Ações Rápidas</h3>
          <div className="border rounded-md p-4 text-center">
            <h4 className="font-semibold mb-2">Criar Documento</h4>
            <p className="text-sm text-gray-600 mb-4">
              Inicie um novo documento em branco
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              + Começar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
