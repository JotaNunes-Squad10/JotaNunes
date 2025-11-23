import { test, expect } from "@playwright/test";

const DOCUMENT_ID = "019a64e3-af19-7363-a18a-a768b87df341";
const URL = `http://localhost:3000/empreendimento/${DOCUMENT_ID}`;

test("Adicionar um item no ambiente", async ({ page }) => {
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForLoadState("networkidle");

  // Abre a sidebar
  const abrirSidebar = page.locator("button[aria-label='Abrir sidebar']");
  if (await abrirSidebar.isVisible()) {
    await abrirSidebar.click();
  }

  // Container interno da sidebar
  const sidebar = page.locator("div.p-4");

  // Clicar no tópico ÁREA COMUM
  await sidebar.locator("text=ÁREA COMUM").scrollIntoViewIfNeeded();
  await sidebar.locator("text=ÁREA COMUM").click();

  // Clicar no ambiente Academia
  await sidebar.locator("text=Academia").scrollIntoViewIfNeeded();
  await sidebar.locator("text=Academia").click();

  // Espera a tabela ou o MultiSelect carregar (ajuste conforme o seu DOM)
  await page.waitForSelector("text=Adicionar Item", { timeout: 10000 });

  // Verifica se estamos na tela correta
  await expect(page.locator("text=Adicionar Item")).toBeVisible();
});
