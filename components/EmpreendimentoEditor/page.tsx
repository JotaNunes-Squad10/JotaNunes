import Header from "@/components/gerenciamentoUser/headerUser/page";
import CustomSidebarComponent from "./SideBar/page";
import FormEmpreendimento from "./FormEditPage/page";
import AddedItemsInDocument from "./AddedItemsInDocument/page";

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
        <div className="flex flex-col">
          <div>
            <FormEmpreendimento />
          </div>
          <div>
            <AddedItemsInDocument />
          </div>
        </div>
      </div>
    </div>
  );
}
