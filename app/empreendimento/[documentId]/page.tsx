"use client";

import EmpreendimentoEditor from "@/components/EmpreendimentoEditor/page";
import { useParams } from "next/navigation";
import Popup from '@/components/popup/page';

export default function Empreendimento() {
  const params = useParams<{ documentId: string }>();
  const documentId = String(params?.documentId);
  return (
    <div>
      <EmpreendimentoEditor documentId={documentId} />
      <Popup />
    </div>
  );
}
