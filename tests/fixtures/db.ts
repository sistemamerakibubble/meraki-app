import type { Page } from '@playwright/test';
import { TEST_USER_EMAILS, TEST_USER_PASSWORDS } from './users';
import type { Role } from '@/types/domain';
import { routes } from '@/lib/constants/routes';

export async function signIn(page: Page, role: Role): Promise<void> {
  await page.goto(routes.login);
  await page.getByLabel(/e-mail/i).fill(TEST_USER_EMAILS[role]);
  await page.getByLabel(/senha/i).fill(TEST_USER_PASSWORDS[role]);
  await page.getByRole('button', { name: /entrar no sistema/i }).click();
  await page.waitForURL(`**${routes.dashboard}`);
}
