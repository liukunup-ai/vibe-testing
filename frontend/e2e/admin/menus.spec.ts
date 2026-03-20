import { test, expect } from '@playwright/test';

test.describe('Admin Menus', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('should create new menu', async ({ page }) => {
    await page.goto('/admin/menus');
    await page.click('text=新建');
    await page.fill('input[name="title"]', 'Test Menu');
    await page.fill('input[name="name"]', '/test/menu');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should edit existing menu', async ({ page }) => {
    await page.goto('/admin/menus');
    await page.click('button:has-text("编辑")');
    await page.fill('input[name="title"]', 'Updated Menu');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should delete menu', async ({ page }) => {
    await page.goto('/admin/menus');
    await page.click('button:has-text("删除")');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should display menu tree structure', async ({ page }) => {
    await page.goto('/admin/menus');
    await expect(page.locator('.ant-table-row')).toHaveCount(5);
  });
});
