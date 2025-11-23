import { test, expect } from "@playwright/test";

const DOCUMENT_ID = "019a64e3-af19-7363-a18a-a768b87df341";
const URL = `http://localhost:3000/empreendimento/${DOCUMENT_ID}`;

test("Acessar o tópico MARCAS via Dropdown", async ({ page }) => {
  await page.goto(URL, { waitUntil: "networkidle" });

  // Abre a sidebar se necessário
  const abrirSidebar = page.locator("button[aria-label='Abrir sidebar']");
  if (await abrirSidebar.isVisible()) {
    await abrirSidebar.click();
  }

  // 1️⃣ Este é o dropdown dos AMBIENTES (o primeiro do AddedItemsInDocument)
  const dropdownAmbientes = page.locator(
    ".p-dropdown:has(.p-dropdown-label:text('Selecione Ambiente'))"
  );

  await dropdownAmbientes.waitFor({ state: "visible" });

  // Abrir o dropdown
  await dropdownAmbientes.click();

  // Selecionar MARCAS
  const itemMarcas = page.locator(".p-dropdown-item >> text=/MARCAS/i");
  await itemMarcas.waitFor();
  await itemMarcas.click();

  // Aguarda render
  await page.waitForTimeout(300);

  // Verificar seleção
  await expect(dropdownAmbientes.locator(".p-dropdown-label")).toContainText(
    /marcas/i
  );
});
