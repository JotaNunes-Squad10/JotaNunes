// utils/extractItemIdsFromDocumento.ts
import { EmpreendimentosTopicos } from "@/lib/api";

/**
 * Extrai os IDs de itens contidos em um documento.
 * Pode opcionalmente filtrar por topicoId e ambienteId.
 */
export function extractItemIdsFromDocumento(
  empreendimentoTopicos: EmpreendimentosTopicos[],
  topicoId?: number,
  ambienteId?: number
): number[] {
  if (!empreendimentoTopicos || empreendimentoTopicos.length === 0) return [];

  const itemIds = new Set<number>();

  empreendimentoTopicos.forEach((topico) => {
    // Filtra se um topico específico foi informado
    if (topicoId && topico.topicoId !== topicoId) return;

    topico.topicoAmbientes.forEach((ambiente) => {
      // Filtra se um ambiente específico foi informado
      if (ambienteId && ambiente.ambienteId !== ambienteId) return;

      ambiente.ambienteItens.forEach((item) => {
        itemIds.add(item.itemId);
      });
    });
  });

  return Array.from(itemIds);
}
