import { test, expect, login, TEST_CREDENTIALS } from '../fixtures/test-fixtures';

test.describe('Admin Config Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.admin.username, TEST_CREDENTIALS.admin.password);
    await page.goto('/admin/config');
  });

  test('should display config page', async ({ page }) => {
    await expect(page.locator('.ant-card, .ant-pro-card, .ant-form')).toBeVisible();
  });

  test('should display save button', async ({ page }) => {
    await expect(page.locator('button:has-text("Save"), button:has-text("保存"), button:has-text("Submit")')).toBeVisible();
  });

  test('should require admin access', async ({ page }) => {
    await page.context().clearCookies();
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
    await page.goto('/admin/config');
    await expect(page).not.toHaveURL('/admin/config');
  });
});
