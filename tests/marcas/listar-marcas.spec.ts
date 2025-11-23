import { test, expect } from "@playwright/test";

const DOCUMENT_ID = "019a64e3-af19-7363-a18a-a768b87df341";
const URL = `http://localhost:3000/empreendimento/${DOCUMENT_ID}`;

test("Listar marcas ao selecionar o tópico MARCAS", async ({ page }) => {
  await page.goto(URL, { waitUntil: "networkidle" });

  // Abre a sidebar se necessário
  const abrirSidebar = page.locator("button[aria-label='Abrir sidebar']");
  if (await abrirSidebar.isVisible()) {
    await abrirSidebar.click();
  }

  // Dropdown de ambiente (é sempre o primeiro .p-dropdown do componente)
  const dropdownAmbientes = page.locator(".p-dropdown").first();
  await dropdownAmbientes.waitFor({ state: "visible" });
  await dropdownAmbientes.click();

  // Clicar na opção MARCAS
  const itemMarcas = page.locator(".p-dropdown-item >> text=MARCAS");
  await itemMarcas.waitFor();
  await itemMarcas.click();

  // Aguarda re-renderização da UI
  await page.waitForTimeout(700);

  // ➜ Recaptura o dropdown correto após re-render
  const dropdownAmbientesAtualizado = page.locator(".p-dropdown").first();

  await expect(
    dropdownAmbientesAtualizado.locator(".p-dropdown-label")
  ).toContainText(/marcas/i);

  // Agora valida a tabela/listagem abaixo
  const tabela = page.locator("table");
  await tabela.waitFor({ state: "visible" });

  const linhas = tabela.locator("tbody tr");
  await expect(linhas.first()).toBeVisible();
});
