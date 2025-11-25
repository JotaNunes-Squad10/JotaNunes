import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { CreateMarca, marcaService, MaterialService } from "@/lib/api1";

interface Props {
  onReload: () => void;
}

interface MaterialMarca {
  name: string;
  code: string;
}

export default function AdicionarNovaMarca({ onReload }: Props) {
  const [visible, setVisible] = useState<boolean>(false);
  const [nomeMarca, setNomeMarca] = useState<string>("");
  const [materialIds, setMaterialIds] = useState<MaterialMarca[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [marcaMateriais, setMarcaMateriais] = useState<MaterialMarca[]>([]);
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Marca criado com sucesso!",
      life: 3000,
    });
  };

  const showError = () => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: "Erro ao criar marca.",
      life: 3000,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload: CreateMarca = {
        nome: nomeMarca,
        materialIds: materialIds.map((m) => Number(m.code)),
      };
      console.log(payload);
      const marcaCriada = await marcaService.createMarca(payload);
      showSuccess();
      console.log("Marca criada com sucesso:", marcaCriada);
    } catch (error) {
      console.error("Erro ao criar nova marca:", error);
      showError();
    } finally {
      setLoading(false);
      setVisible(false);
      showSuccess();
      onReload();
    }
  };

  useEffect(() => {
    const getMarcaMateriais = async () => {
      try {
        const response = await MaterialService.getAllMateriais();
        const materialMarca: MaterialMarca[] = response.map((m) => ({
          name: m.nome,
          code: String(m.id),
        }));
        setMarcaMateriais(materialMarca);
      } catch (error) {
        console.error("Erro ao buscar Material Marcas", error);
      }
    };
    getMarcaMateriais();
  }, []);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />
      <button
        onClick={() => setVisible(true)}
        className="px-4 py-3 border border-gray-300 rounded-lg text-[#0f582a] cursor-pointer hover:bg-gray-100"
      >
        <i className="pi pi-plus"></i>
      </button>

      <Dialog
        header="Nova Marca"
        visible={visible}
        modal={false}
        style={{ width: "50vw" }}
        breakpoints={{ "960px": "75vw", "640px": "90vw" }}
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
      >
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="flex flex-col">
              <label className="mb-4">Digite o nome da marca</label>
              <input
                type="text"
                placeholder="Nome do item"
                className="p-2 border border-gray-300 rounded-lg mb-4"
                required
                onChange={(e) => setNomeMarca(e.target.value)}
              />
              <label className="mb-4">Digite a descrição do item</label>
              <MultiSelect
                value={materialIds}
                onChange={(e: MultiSelectChangeEvent) =>
                  setMaterialIds(e.value)
                }
                options={marcaMateriais}
                optionLabel="name"
                placeholder={
                  loading ? "Carregando itens..." : "Selecione um ou mais itens"
                }
                className="w-full md:w-14rem mb-4"
                display="chip"
                disabled={loading}
                filter
              />
              <button
                type="submit"
                className="cursor-pointer bg-[#0f582a] p-3 text-white rounded-lg hover:opacity-95"
                onClick={handleSubmit}
              >
                Enviar
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
