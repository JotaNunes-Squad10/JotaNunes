export default function ObserverComponent() {
  return (
    <div className="flex flex-col space-y-2 w-225">
      <label htmlFor="observacao" className="text-black font-medium">
        Observação
      </label>
      <textarea
        id="observacao"
        name="observacao"
        maxLength={300}
        className="text-black w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Digite sua observação"
      />
    </div>
  );
}
