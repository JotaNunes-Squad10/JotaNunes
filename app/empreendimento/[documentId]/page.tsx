"use client";

import EmpreendimentoEditor from "@/components/EmpreendimentoEditor/page";
import { useParams } from "next/navigation";

export default function Empreendimento() {
  const params = useParams<{ documentId: string }>();
  const documentId = Number(params?.documentId);
  return (
    <div>
      <EmpreendimentoEditor documentId={documentId} />
    </div>
  );
}
