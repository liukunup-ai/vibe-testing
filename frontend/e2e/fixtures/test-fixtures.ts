import { test as base, Page, expect } from '@playwright/test';

export const TEST_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: '123456',
  },
  testUser: {
    username: 'admin',
    password: '123456',
    email: 'admin@example.com',
    fullName: 'Admin User',
  },
};

type TestFixtures = {
  authenticatedPage: Page;
  adminPage: Page;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await login(page, TEST_CREDENTIALS.admin.username, TEST_CREDENTIALS.admin.password);
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await login(page, TEST_CREDENTIALS.admin.username, TEST_CREDENTIALS.admin.password);
    await use(page);
  },
});

export async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder(/Username/i).fill(username);
  await page.getByPlaceholder(/Password/i).fill(password);
  await page.getByRole('button', { name: /Login/i }).click();
  await page.waitForURL(/\/(welcome|admin|profile|item|\/)$/, { timeout: 20000 });
}

export async function logout(page: Page): Promise<void> {
  await page.locator('.ant-dropdown-trigger, [class*="avatar"]').first().click();
  await page.getByText(/Logout|Sign out|退出/i).click();
  await page.waitForURL('/login', { timeout: 10000 });
}

export async function expectMessage(page: Page, text: string | RegExp, type: 'success' | 'error' | 'warning' | 'info' = 'success'): Promise<void> {
  const message = page.locator(`.ant-message-${type}`);
  await expect(message).toBeVisible({ timeout: 5000 });
  if (typeof text === 'string') {
    await expect(message).toContainText(text);
  }
}

export async function waitForModal(page: Page): Promise<void> {
  await page.waitForSelector('.ant-modal-content', { timeout: 5000 });
}

export async function closeModal(page: Page): Promise<void> {
  await page.click('.ant-modal-close');
  await page.waitForSelector('.ant-modal-content', { state: 'hidden' });
}

export function randomString(length = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

export function uniqueEmail(): string {
  return `test-${randomString(8)}@example.com`;
}

export function uniqueUsername(): string {
  return `testuser_${randomString(8)}`;
}

export async function waitForTable(page: Page, tableSelector = '.ant-pro-table'): Promise<void> {
  await page.waitForSelector(`${tableSelector} .ant-spin-spinning`, { state: 'hidden', timeout: 10000 }).catch(() => {});
  await page.waitForSelector(`${tableSelector} .ant-table-tbody tr`, { timeout: 10000 }).catch(() => {});
}

export { expect };
