import { test, expect, login, TEST_CREDENTIALS } from '../fixtures/test-fixtures';

test.describe('Welcome Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_CREDENTIALS.testUser.username, TEST_CREDENTIALS.testUser.password);
    await page.goto('/welcome');
  });

  test('should display welcome page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be accessible after login', async ({ page }) => {
    await expect(page).toHaveURL('/welcome');
  });
});
