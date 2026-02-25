import { test, expect, uniqueEmail, expectMessage } from '../fixtures/test-fixtures';

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('should display forgot password form', async ({ page }) => {
    await expect(page.getByPlaceholder(/Email|邮箱/i)).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Send"), button:has-text("发送")')).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.click('button[type="submit"], button:has-text("Send"), button:has-text("发送"), button:has-text("Submit")');
    await expect(page.locator('.ant-form-item-explain-error')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByPlaceholder(/Email|邮箱/i).fill('invalid-email');
    await page.click('button[type="submit"], button:has-text("Send"), button:has-text("发送"), button:has-text("Submit")');
    
    await expect(page.locator('.ant-form-item-explain-error')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login, text=登录, text=立即登录, text=Back to login');
    await expect(page).toHaveURL(/login/);
  });

  test('should show success message for valid email', async ({ page }) => {
    await page.getByPlaceholder(/Email|邮箱/i).fill('testuser@example.com');
    await page.click('button[type="submit"], button:has-text("Send"), button:has-text("发送"), button:has-text("Submit")');
    
    await expect(page.locator('.ant-alert-success, .ant-message-success')).toBeVisible({ timeout: 15000 });
  });
});
