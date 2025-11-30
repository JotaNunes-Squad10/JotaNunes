"use client";

import React, { useRef, useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import ActionBar from "./ActionBar/page";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { DocumentoService, UpdateEmpreendimento } from "@/lib/api1";

interface FormEmpreendimentoProps {
  empreendimento: UpdateEmpreendimento;
  updateEmpreendimento: (
    field: keyof UpdateEmpreendimento,
    value: UpdateEmpreendimento[keyof UpdateEmpreendimento]
  ) => void;
  status: string;
  idDocumento: string;
}

/**
 * 🔥 Normaliza o payload antes de enviar ao backend
 * (corrige exatamente o erro reportado no log)
 */
function normalizePayload(doc: UpdateEmpreendimento): UpdateEmpreendimento {
  return {
    id: doc.id,
    nome: doc.nome ?? "",
    descricao: doc.descricao ?? "",
    localizacao: doc.localizacao ?? "",
    tamanhoArea: Number(doc.tamanhoArea) || 0,
    padrao: Number(doc.padrao) || 1,
    empreendimentoTopicos: (doc.empreendimentoTopicos || []).map((t, idx) => ({
      topicoId: Number(t.topicoId),
      posicao: t.posicao ?? idx + 1,

      topicoAmbientes: (t.topicoAmbientes || []).map((a, aidx) => ({
        ambienteId: Number(a.ambienteId),
        area: a.area ?? 0,
        posicao: a.posicao ?? aidx + 1,
        ambienteItens: (a.ambienteItens || []).map((i) => ({
          itemId: Number(i.itemId),
        })),
      })),

      topicoMateriais: (t.topicoMateriais || []).map((m) => ({
        materialId: Number(m.materialId),
        versoes: m.versoes ?? [],
      })),
    })),
  };
}

export default function FormEmpreendimento({
  empreendimento,
  updateEmpreendimento,
  status,
  idDocumento,
}: FormEmpreendimentoProps) {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      const payload = normalizePayload(empreendimento);

      await DocumentoService.updateEmpreendimento(payload);

      toast.current?.show({
        severity: "success",
        summary: "Sucesso",
        detail: "Informações do empreendimento salvas com sucesso!",
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail:
          "Erro ao salvar o empreendimento. Verifique os campos obrigatórios ou tente mais tarde.",
        life: 3000,
      });
      console.error("Falha ao salvar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toast ref={toast} position="top-right" />
      <ActionBar statusEmpreendimento={status} idDocumento={idDocumento} />

      <Card className="border border-gray-300 p-4 w-full ">
        {/* Campo Empreendimento */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4">
          <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
            Empreendimento:
          </label>
          <InputText
            value={empreendimento.nome}
            onChange={(e) => updateEmpreendimento("nome", e.target.value)}
            placeholder="Digite o nome do empreendimento"
            className="flex-1"
          />
        </div>

        {/* Campo Localização */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4">
          <label className="sm:w-40 font-semibold text-gray-700 mb-2 sm:mb-0">
            Localização:
          </label>
          <InputText
            value={empreendimento.localizacao}
            onChange={(e) =>
              updateEmpreendimento("localizacao", e.target.value)
            }
            placeholder="Digite a localização"
            className="flex-1"
          />
        </div>

        {/* Campo Descrição */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">
            Descrição do Empreendimento:
          </label>
          <InputTextarea
            value={empreendimento.descricao}
            onChange={(e) => updateEmpreendimento("descricao", e.target.value)}
            placeholder="Digite a descrição"
            rows={4}
            autoResize
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            label="Guardar"
            icon="pi pi-check"
            className="p-button-next px-4 py-2"
            onClick={handleSave}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
}
