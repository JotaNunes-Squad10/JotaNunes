"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import axios from "axios";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface GetTopics {
  id: number;
  nome: string;
}

interface APIResponse<T> {
  data: T;
  validationResult: {
    isValid: boolean;
    errors: string[];
    ruleSetsExecuted: string | null;
  };
}

interface Topic {
  id: number;
  nome: string;
}

interface TopicDropDown {
  name: string;
  code: string;
}

interface GetAllAmbientes {
  id: number;
  nome: string;
  topico: Topic;
}

interface AmbienteCreate {
  nome: string;
  topicoId: number;
}

interface AmbienteResponse {
  id: number;
  nome: string;
  topico: null;
}

interface GetAllMarcas {
  id: number;
  nome: string;
}

interface GetAllMarteriais {
  id: number;
  nome: string;
}

interface MaterialsToDropDown {
  name: string;
  code: string;
}

interface CreateMarkResponse {
  id: number;
  nome: string;
}

interface PayloadMark {
  nome: string;
  materialIds: number[];
}

interface MarkToMultiSelect {
  name: string;
  code: string;
}

interface CreateMaterialResponse {
  id: number;
  nome: string;
}

interface PayloadMaterial {
  nome: string;
  marcaIds: number[];
}

export default function SideBarCreate() {
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleCreateTopicoDialog, setVisibleCreateTopicoDialog] =
    useState<boolean>(false);
  const [visibleCreateAmbienteDialog, setVisibleCreateAmbienteDialog] =
    useState<boolean>(false);
  const [visibleCreateMarcasDialog, setVisibleCreateMarcasDialog] =
    useState<boolean>(false);
  const [visibleCreateMateriaisDialog, setVisibleCreateMateriaisDialog] =
    useState<boolean>(false);

  const toast = useRef<Toast>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [refreshMark, setRefreshMark] = useState<boolean>(false);
  const [refreshMaterial, setRefreshMaterial] = useState<boolean>(false);

  // states manipulados pelos formulários e state
  const [saving, setSaving] = useState<boolean>(false);
  const [nomeTopico, setNomeTopico] = useState<string>("");

  const [topicos, setTopicos] = useState<Topic[]>([]);
  const [selectedTopico, setSelectedTopico] = useState<TopicDropDown | null>(
    null
  );
  const [topicosToDropDown, setTopicosToDropDown] = useState<TopicDropDown[]>(
    []
  );

  // Ambientes
  const [ambiente, setAmbiente] = useState<string>("");

  // Marcas e Materiais
  const [marcas, setMarcas] = useState<MarkToMultiSelect[]>([]);
  const [materiais, setMaterias] = useState<MaterialsToDropDown[]>([]);

  const [novaMarca, setNovaMarca] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<
    MaterialsToDropDown[] | null
  >(null);
  const [selectedMarca, setSelectedMarca] = useState<
    MarkToMultiSelect[] | null
  >(null);
  const [novoMaterial, setNovoMaterial] = useState<string>("");

  // Funções de envio
  const handleCreateNewTopic = async () => {
    try {
      const response = await axios.get(
        "https://jotanunesservice.onrender.com/api/v1/topico/GetAllTopicos"
      );
      const allTopics: GetTopics[] = response.data.data;
      const existTopic = allTopics.find(
        (t) => nomeTopico.toLocaleUpperCase() === t.nome
      );

      if (existTopic) {
        showWarn("Esse tópico não pode ser criado, ele já existe.");
        return;
      }

      const payload: { nome: string } = {
        nome: nomeTopico.toLocaleUpperCase(),
      };

      const result = await PostTopic(payload);

      if (result.validationResult.isValid) {
        showSuccess("Tópico criado com sucesso!");
        setRefresh(true);
        setVisibleCreateTopicoDialog(false);
      }
    } catch (error) {
      console.error(error);
      showError(
        "Ocorreu um erro ao criar um novo tópico. Tente novamente mais tarde."
      );
    } finally {
      setNomeTopico("");
      setSaving(false);
    }
  };

  const handleCreateNewEnviroment = async () => {
    try {
      if (selectedTopico === null) {
        showWarn("Selecione um tópico para criar o ambiente.");
        return;
      }
      const response = await axios.get(
        "https://jotanunesservice.onrender.com/api/v1/ambiente/GetAllAmbientes"
      );

      const allEnviroment: GetAllAmbientes[] = response.data.data;

      const enviroment = allEnviroment.find(
        (e) => e.nome.toLocaleLowerCase() === ambiente.toLocaleLowerCase()
      );

      if (enviroment) {
        showWarn(
          "O ambiente não pode ser criado. Ele já existe dentro de um tópico."
        );
        return;
      }

      const payload: { nome: string; topicoId: number } = {
        nome: ambiente,
        topicoId: Number(selectedTopico.code),
      };

      const result = await PostAmbiente(payload);

      if (result.validationResult.isValid) {
        showSuccess("Ambiente criado com sucesso!");
        setVisibleCreateAmbienteDialog(false);
        return;
      }
    } catch (error) {
      console.error(error);
      showError("Houve um erro ao criar um novo ambiente");
    } finally {
      setSaving(false);
      setAmbiente("");
      setSelectedTopico(null);
    }
  };

  const handleCreateNewMark = async () => {
    if (!selectedMaterial) {
      showWarn("Selecione um material.");
      return;
    }

    const allMark = await GetAllMarcas();
    const existMark = allMark.find(
      (m) => m.nome.toLocaleLowerCase() === novaMarca.toLocaleLowerCase()
    );

    if (existMark) {
      showError("Essa marca já existe.");
      return;
    }

    const materialIdsMapped = selectedMaterial.map((m) => Number(m.code));

    const payload: PayloadMark = {
      nome: novaMarca,
      materialIds: materialIdsMapped,
    };

    try {
      const result = await PostMarca(payload);
      if (result.validationResult.isValid) {
        showSuccess("Nova Marca Criada com sucesso!");
        setVisibleCreateMarcasDialog(false);
        setRefreshMark(true);
        return;
      }
    } catch (error) {
      console.error("Houve um erro ao criar uma nova marca", error);
      showError("Houve um erro ao criar uma nova marca");
    }
  };

  const handleCreateNewMaterial = async () => {
    try {
      if (!selectedMarca) {
        showWarn("Selecione pelo menos uma marca.");
        return;
      }

      const allMateriais = await GetAllMateriais();

      const existMaterial = allMateriais.find(
        (m) => m.nome.toLocaleLowerCase() === novoMaterial.toLocaleLowerCase()
      );

      if (existMaterial) {
        showError("Esse material já existe.");
        return;
      }

      const marcaMapped = selectedMarca.map((m) => Number(m.code));

      const payload: PayloadMaterial = {
        nome: novoMaterial,
        marcaIds: marcaMapped,
      };

      const result = await PostMateriais(payload);

      if (result.validationResult.isValid) {
        showSuccess("Material criado com sucesso!");
        setVisibleCreateMateriaisDialog(false);
        setRefreshMaterial(true);
        return;
      }
    } catch (error) {
      console.error("Houve um erro ao criar o material", error);
      showError("Houve um erro ao criar o material");
      return;
    } finally {
      setSelectedMarca(null);
      setNovoMaterial("");
      setSaving(false);
      setRefreshMaterial(false);
    }
  };

  // Funçõe de requisição
  const PostTopic = async (payload: {
    nome: string;
  }): Promise<APIResponse<Topic>> => {
    const response = await axios.post(
      "https://jotanunesservice.onrender.com/api/v1/topico/CreateTopico",
      payload
    );

    return response.data;
  };

  const GetAllTopic = async (): Promise<GetTopics[]> => {
    const response = await axios.get(
      "https://jotanunesservice.onrender.com/api/v1/topico/GetAllTopicos"
    );
    return response.data.data;
  };

  const PostAmbiente = async (
    payload: AmbienteCreate
  ): Promise<APIResponse<AmbienteResponse>> => {
    const response = await axios.post(
      "https://jotanunesservice.onrender.com/api/v1/ambiente/CreateAmbiente",
      payload
    );
    return response.data;
  };

  const GetAllMarcas = async (): Promise<GetAllMarcas[]> => {
    const response = await axios.get(
      "https://jotanunesservice.onrender.com/api/v1/marca/GetAllMarcas"
    );
    return response.data.data;
  };

  const PostMarca = async (
    payload: PayloadMark
  ): Promise<APIResponse<CreateMarkResponse>> => {
    const response = await axios.post(
      "https://jotanunesservice.onrender.com/api/v1/marca/CreateMarca",
      payload
    );

    return response.data;
  };

  const GetAllMateriais = async (): Promise<GetAllMarteriais[]> => {
    const response = await axios.get(
      "https://jotanunesservice.onrender.com/api/v1/material/GetAllMateriais"
    );
    return response.data.data;
  };

  const PostMateriais = async (
    payload: PayloadMaterial
  ): Promise<APIResponse<CreateMaterialResponse>> => {
    const response = await axios.post(
      "https://jotanunesservice.onrender.com/api/v1/material/CreateMaterial",
      payload
    );

    return response.data;
  };

  // Funções auxiliares
  const showSuccess = (message: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: `${message}`,
      life: 3000,
    });
  };

  const showWarn = (message: string) => {
    toast.current?.show({
      severity: "warn",
      summary: "Warning",
      detail: `${message}`,
      life: 3000,
    });
  };

  const showError = (message: string) => {
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: `${message}`,
      life: 3000,
    });
  };

  // useEffects
  // Todos os tópicos
  useEffect(() => {
    const callGetAllTopics = async () => {
      const allTopic = await GetAllTopic();
      setTopicos(allTopic);
    };

    callGetAllTopics();
  }, [refresh]);

  // Topicos para dropdown
  useEffect(() => {
    const mapedDropDown: TopicDropDown[] = topicos.map((t) => ({
      name: t.nome,
      code: String(t.id),
    }));

    setTopicosToDropDown(mapedDropDown);
  }, [topicos]);

  // Materias
  useEffect(() => {
    const calGetAllMateriais = async () => {
      const response = await GetAllMateriais();
      const dropDownMappedMateriais: MaterialsToDropDown[] = response.map(
        (m) => ({
          name: m.nome,
          code: String(m.id),
        })
      );

      setMaterias(dropDownMappedMateriais);
    };

    calGetAllMateriais();
  }, [refreshMaterial]);

  useEffect(() => {
    const callGetAllMarcas = async () => {
      const response = await GetAllMarcas();

      const mappedMarks: MarkToMultiSelect[] = response.map((m) => ({
        name: m.nome,
        code: String(m.id),
      }));

      setMarcas(mappedMarks);
    };

    callGetAllMarcas();
  }, [refreshMark]);

  return (
    <div className="card flex justify-content-center">
      <Toast ref={toast} />
      <Sidebar
        visible={visible}
        onHide={() => {
          setVisible(false);
          setVisibleCreateTopicoDialog(false);
          setVisibleCreateAmbienteDialog(false);
          setVisibleCreateMarcasDialog(false);
        }}
        className="w-full md:w-20rem lg:w-30rem"
      >
        <div className="flex flex-col space-y-2">
          {/* Início - Dialog Criar tópico */}

          <div className="card flex justify-content-center">
            <button
              type="button"
              onClick={() => setVisibleCreateTopicoDialog(true)}
              className="
              flex items-center justify-center
              w-full py-4 px-2
              text-blue-600 font-semibold
              bg-white transition duration-150
              border-2 border border-blue-500
              rounded-xl
              hover:bg-red-50/70 hover:border-red-500 hover:text-red-600
              cursor-pointer"
            >
              <i className="pi pi-plus mr-3 text-lg" />
              Criar novo tópico
            </button>

            <Dialog
              header="Criar novo tópico"
              visible={visibleCreateTopicoDialog}
              style={{ width: "50vw" }}
              breakpoints={{ "960px": "75vw", "640px": "90vw" }}
              onHide={() => {
                if (!visible) return;
                setVisibleCreateTopicoDialog(false);
                setNomeTopico("");
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaving(true);
                  handleCreateNewTopic();
                }}
              >
                <div className="flex flex-col">
                  <label className="mb-4">Digite o nome do tópico</label>

                  <input
                    type="text"
                    placeholder="Nome do tópico"
                    className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none"
                    required
                    value={nomeTopico}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                      setNomeTopico(ev.target.value)
                    }
                    disabled={saving}
                  />

                  <button
                    type="submit"
                    className="cursor-pointer bg-green-700 p-3 text-white rounded-lg hover:opacity-95"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Enviar"}
                  </button>
                </div>
              </form>
            </Dialog>
          </div>

          {/* Início - Dialog Criar Ambiente */}

          <div className="card flex justify-content-center">
            <button
              type="button"
              onClick={() => setVisibleCreateAmbienteDialog(true)}
              className="
            flex items-center justify-center
            w-full py-4 px-2
            text-blue-600 font-semibold
            bg-white transition duration-150
            border-2 border border-blue-500
            rounded-xl
            hover:bg-red-50/70 hover:border-red-500 hover:text-red-600
            cursor-pointer
            "
            >
              <i className="pi pi-plus mr-3 text-lg" />
              Criar novo ambiente
            </button>

            <Dialog
              header="Criar novo Ambiente"
              visible={visibleCreateAmbienteDialog}
              style={{ width: "50vw" }}
              breakpoints={{ "960px": "75vw", "640px": "90vw" }}
              onHide={() => {
                if (!visible) return;
                setVisibleCreateAmbienteDialog(false);
                setAmbiente("");
                setSelectedTopico(null);
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaving(true);
                  handleCreateNewEnviroment();
                }}
              >
                <div className="flex flex-col">
                  <label className="mb-4">Digite o nome do ambiente</label>

                  <Dropdown
                    value={selectedTopico}
                    onChange={(e: DropdownChangeEvent) =>
                      setSelectedTopico(e.value)
                    }
                    options={topicosToDropDown}
                    optionLabel="name"
                    placeholder="Selecione o tópico"
                    className="w-full md:w-14rem"
                  />

                  <input
                    type="text"
                    placeholder="Nome do Ambiente"
                    className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none mt-5"
                    required
                    value={ambiente}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                      setAmbiente(ev.target.value)
                    }
                    disabled={saving}
                  />

                  <button
                    type="submit"
                    className="cursor-pointer bg-green-700 p-3 text-white rounded-lg hover:opacity-95"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Enviar"}
                  </button>
                </div>
              </form>
            </Dialog>
          </div>

          {/* Início - Dialog Cria Marcas */}

          <div className="card flex justify-content-center">
            <button
              type="button"
              onClick={() => setVisibleCreateMarcasDialog(true)}
              className="
            flex items-center justify-center
            w-full py-4 px-2
            text-blue-600 font-semibold
            bg-white transition duration-150
            border-2 border border-blue-500
            rounded-xl
            hover:bg-red-50/70 hover:border-red-500 hover:text-red-600
            cursor-pointer
            "
            >
              <i className="pi pi-plus mr-3 text-lg" />
              Criar nova marca
            </button>
            <Dialog
              header="Crie uma nova marca"
              visible={visibleCreateMarcasDialog}
              style={{ width: "50vw" }}
              breakpoints={{ "960px": "75vw", "640px": "90vw" }}
              onHide={() => {
                if (!visible) return;
                setVisibleCreateMarcasDialog(false);
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaving(true);
                  handleCreateNewMark();
                  setSelectedMaterial(null);
                  setNovaMarca("");
                  setSaving(false);
                }}
              >
                <div className="flex flex-col">
                  <MultiSelect
                    value={selectedMaterial}
                    onChange={(e: MultiSelectChangeEvent) =>
                      setSelectedMaterial(e.value)
                    }
                    options={materiais}
                    optionLabel="name"
                    filter
                    filterDelay={400}
                    placeholder="Selecione os materiais"
                    maxSelectedLabels={3}
                    className="w-full md:w-20rem"
                  />

                  <label className="mt-4">Digite o nome da marca</label>

                  <input
                    type="text"
                    placeholder="Nome do material"
                    className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none mt-5"
                    required
                    value={novaMarca}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                      setNovaMarca(ev.target.value)
                    }
                    disabled={saving}
                  />

                  <button
                    type="submit"
                    className="cursor-pointer bg-green-700 p-3 text-white rounded-lg hover:opacity-95"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Enviar"}
                  </button>
                </div>
              </form>
            </Dialog>
          </div>

          {/* Início - Dialog Cria Materiais */}
          <div className="card flex justify-content-center">
            <button
              type="button"
              onClick={() => setVisibleCreateMateriaisDialog(true)}
              className="
            flex items-center justify-center
            w-full py-4 px-2
            text-blue-600 font-semibold
            bg-white transition duration-150
            border-2 border border-blue-500
            rounded-xl
            hover:bg-red-50/70 hover:border-red-500 hover:text-red-600
            cursor-pointer
            "
            >
              <i className="pi pi-plus mr-3 text-lg" />
              Criar novo material
            </button>
            <Dialog
              header="Crie um novo material"
              visible={visibleCreateMateriaisDialog}
              style={{ width: "50vw" }}
              breakpoints={{ "960px": "75vw", "640px": "90vw" }}
              onHide={() => {
                if (!visible) return;
                setVisibleCreateMateriaisDialog(false);
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaving(true);
                  handleCreateNewMaterial();
                }}
              >
                <div className="flex flex-col">
                  <MultiSelect
                    value={selectedMarca}
                    onChange={(e: MultiSelectChangeEvent) =>
                      setSelectedMarca(e.value)
                    }
                    options={marcas}
                    optionLabel="name"
                    filter
                    filterDelay={400}
                    placeholder="Selecione as marcas"
                    maxSelectedLabels={3}
                    className="w-full md:w-20rem"
                  />

                  <label className="mt-4">Digite o nome do material</label>
                  <input
                    type="text"
                    placeholder="Nome do material"
                    className="p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none mt-5"
                    required
                    value={novoMaterial}
                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                      setNovoMaterial(ev.target.value)
                    }
                    disabled={saving}
                  />

                  <button
                    type="submit"
                    className="cursor-pointer bg-green-700 p-3 text-white rounded-lg hover:opacity-95"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Enviar"}
                  </button>
                </div>
              </form>
            </Dialog>
          </div>
        </div>
      </Sidebar>
      <Button
        icon="pi pi-bars"
        onClick={() => setVisible(true)}
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "4px",
          marginLeft: "10vw", // 10% da largura da tela
        }}
      />
    </div>
  );
}
