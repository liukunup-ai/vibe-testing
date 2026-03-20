import { test, expect } from '@playwright/test';

test.describe('Admin APIs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('should create new API', async ({ page }) => {
    await page.goto('/admin/apis');
    await page.click('text=新建');
    await page.fill('input[name="name"]', 'Test API');
    await page.fill('input[name="path"]', '/api/test');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should edit existing API', async ({ page }) => {
    await page.goto('/admin/apis');
    await page.click('button:has-text("编辑")');
    await page.fill('input[name="name"]', 'Updated API');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should delete API', async ({ page }) => {
    await page.goto('/admin/apis');
    await page.click('button:has-text("删除")');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should search APIs by name', async ({ page }) => {
    await page.goto('/admin/apis');
    await page.fill('input[placeholder*="搜索"]', 'test');
    await page.press('Enter');
    await page.waitForTimeout(1000);
    await expect(page.locator('.ant-table-row').first()).toBeVisible();
  });
});
