import { test, expect } from '@playwright/test';

test.describe('Admin Roles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('should create new role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('text=新建');
    await page.fill('input[name="name"]', 'TestRole');
    await page.fill('input[name="casbinRole"]', 'testrole');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should edit existing role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('button:has-text("编辑")');
    await page.fill('input[name="name"]', 'UpdatedRole');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should delete role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('button:has-text("删除")');
    await page.click('text=确定');
    await page.waitForSelector('text=操作成功', { timeout: 3000 });
  });

  test('should assign permissions to role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('text=权限配置');
    await expect(page.locator('text=权限配置')).toBeVisible();
    await page.check('text=保存').click();
  });

  test('should assign APIs to role', async ({ page }) => {
    await page.goto('/admin/roles');
    await page.click('text=API配置');
    await expect(page.locator('text=API配置')).toBeVisible();
  });
});
