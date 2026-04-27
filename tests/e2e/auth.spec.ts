import { test, expect } from '@playwright/test';
import { routes } from '@/lib/constants/routes';
import { TEST_USER_EMAILS, TEST_USER_PASSWORDS } from '../fixtures/users';

test.describe('auth', () => {
  test('acessar raiz sem sessão redireciona para /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(new RegExp(`${routes.login}$`));
    await expect(page.getByRole('button', { name: /entrar no sistema/i })).toBeVisible();
  });

  test('acessar /dashboard sem sessão redireciona para /login', async ({ page }) => {
    await page.goto(routes.dashboard);
    await expect(page).toHaveURL(new RegExp(`${routes.login}$`));
  });

  test('login com credenciais inválidas mostra erro', async ({ page }) => {
    await page.goto(routes.login);
    await page.getByLabel(/e-mail/i).fill('ninguem@meraki.test');
    await page.getByLabel(/senha/i).fill('senha-errada');
    await page.getByRole('button', { name: /entrar no sistema/i }).click();
    await expect(page.getByRole('alert')).toContainText(/e-mail ou senha inválidos/i);
    await expect(page).toHaveURL(new RegExp(`${routes.login}$`));
  });

  test('login válido redireciona para dashboard', async ({ page }) => {
    await page.goto(routes.login);
    await page.getByLabel(/e-mail/i).fill(TEST_USER_EMAILS.admin);
    await page.getByLabel(/senha/i).fill(TEST_USER_PASSWORDS.admin);
    await page.getByRole('button', { name: /entrar no sistema/i }).click();
    await expect(page).toHaveURL(new RegExp(`${routes.dashboard}$`));
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/olá/i);
  });

  test('link de recuperação leva para /esqueci-senha', async ({ page }) => {
    await page.goto(routes.login);
    await page.getByRole('link', { name: /esqueci minha senha/i }).click();
    await expect(page).toHaveURL(new RegExp(`${routes.forgotPassword}$`));
    await expect(page.getByRole('button', { name: /enviar link/i })).toBeVisible();
  });
});
