import Header from "@/components/gerenciamentoUser/headerUser/page";
import BasicDemo from "./SideBar/page";
import CustomSidebarComponent from "./SideBar/page";
import ActionBar from "./FormEditPage/ActionBar/page";
import FormEmpreendimento from "./FormEditPage/page";

interface EmpreendimentoEditorProps {
  documentId?: number;
}

export default function EmpreendimentoEditor({
  documentId,
}: EmpreendimentoEditorProps) {
  return (
    <div className="min-h-screen">
      <div>
        <Header />
      </div>

      <CustomSidebarComponent />

      <div className="flex justify-center">
        <div>
          <FormEmpreendimento />
        </div>
      </div>
    </div>
  );
}
