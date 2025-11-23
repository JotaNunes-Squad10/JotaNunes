import { test, expect } from "@playwright/test";

const DOCUMENT_ID = "019aadc9-498d-74f6-9df2-ef0a1186f587";
const URL = `http://localhost:3000/empreendimento/${DOCUMENT_ID}`;

test("Adicionar uma marca existente ao documento", async ({ page }) => {
  await page.goto(URL, { waitUntil: "networkidle" });

  // 1. Abre a sidebar se estiver fechada
  const abrirSidebar = page.locator("button[aria-label='Abrir sidebar']");
  if (await abrirSidebar.isVisible()) {
    await abrirSidebar.click();
  }

  // 2. Seleciona o dropdown de tópicos (Selecione Ambiente)
  const dropdownAmbientes = page.locator(
    ".p-dropdown:has(.p-dropdown-label:text('Selecione Ambiente'))"
  );

  await dropdownAmbientes.waitFor({ state: "visible" });
  await dropdownAmbientes.click();

  // 3. Seleciona MARCAS
  const itemMarcas = page.locator(".p-dropdown-item >> text=MARCAS");
  await itemMarcas.waitFor({ state: "visible" });
  await itemMarcas.click();

  // Aguarda re-renderização do PrimeReact
  await page.waitForTimeout(700);

  // 4. Verifica que MARCAS foi selecionado
  const dropdownAtualizado = page
    .locator(".p-dropdown:has(.p-dropdown-label)")
    .first();

  await expect(dropdownAtualizado.locator(".p-dropdown-label")).toContainText(
    /marcas/i
  );

  // -------------------------------------------------------------
  // 5. ABRIR O MULTISELECT → necessário para o painel ser criado
  // -------------------------------------------------------------
  const multiSelect = page.locator(".p-multiselect");
  await multiSelect.waitFor({ state: "visible" });
  await multiSelect.click(); // sem isso, os itens NÃO existem no DOM

  // -------------------------------------------------------------
  // 6. AGUARDA OS ITENS DE MARCAS CARREGAREM NO DOM
  // -------------------------------------------------------------
  const listaMarcas = page.locator(
    ".p-multiselect-items-wrapper ul.p-multiselect-items li"
  );

  await expect(listaMarcas.first()).toBeVisible({ timeout: 15000 });

  // Captura a primeira marca
  const primeiraMarca = listaMarcas.first();
  const nomeMarca = (await primeiraMarca.innerText()).trim();

  // Seleciona a marca
  await primeiraMarca.click();

  // -------------------------------------------------------------
  // 7. Clicar em "Adicionar Item"
  // -------------------------------------------------------------
  const botaoAdicionar = page.locator("button:has-text('Adicionar Item')");
  await botaoAdicionar.waitFor({ state: "visible" });
  await botaoAdicionar.click();

  // Espera atualização da tabela
  await page.waitForTimeout(800);

  // -------------------------------------------------------------
  // 8. Verifica que a marca foi adicionada corretamente
  // -------------------------------------------------------------
  const tabela = page.locator("table tbody");
  await tabela.waitFor({ state: "visible" });

  const primeiraLinhaTabela = tabela.locator("tr").first();
  await expect(primeiraLinhaTabela).toContainText(nomeMarca);
});
