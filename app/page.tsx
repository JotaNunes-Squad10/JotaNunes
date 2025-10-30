import Chatbot from "@/components/popup/page";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-center text-3xl mt-10 text-black">
        Página Principal.
      </h1>
      <Chatbot />
    </div>
  );
}
