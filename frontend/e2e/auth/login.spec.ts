import { test, expect, login, TEST_CREDENTIALS } from '../fixtures/test-fixtures';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('textbox').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder(/Username/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Login/i })).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /Login/i }).click();
    await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.getByPlaceholder(/Username/i).fill(TEST_CREDENTIALS.admin.username);
    await page.getByPlaceholder(/Password/i).fill(TEST_CREDENTIALS.admin.password);
    await page.getByRole('button', { name: /Login/i }).click();
    
    await page.waitForURL(/\/(welcome|admin|profile|item|\/)$/, { timeout: 20000 });
    await expect(page).not.toHaveURL('/login');
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByText(/Register now/i).click();
    await expect(page).toHaveURL(/register/);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByText(/Forgot Password/i).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/Password/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    const eyeIcon = page.locator('[class*="eye"]').first();
    if (await eyeIcon.isVisible()) {
      await eyeIcon.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should display site title and logo', async ({ page }) => {
    await expect(page.locator('img[alt="logo"]')).toBeVisible();
    await expect(page.locator('.ant-pro-form-login-header')).toBeVisible();
  });
});
