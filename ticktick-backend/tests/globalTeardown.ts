import fs from "fs";
import { TEST_DB_FILE, applyTestEnv } from "./utils/testEnv";

async function unlinkWithRetry(filePath: string, attempts = 5, delayMs = 100) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    } catch (err: any) {
      if (err?.code !== "EBUSY" && err?.code !== "EPERM") throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export default async function globalTeardown() {
  applyTestEnv();

  // 先关闭 WebSocket 连接
  const { WsHub } = await import("../src/ws/hub");
  await WsHub.shutdown();

  // 等待一小段时间确保 WebSocket 连接完全关闭
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 关闭数据库连接
  const { db } = await import("../src/db/knex");
  await db.destroy();

  // 等待数据库连接完全关闭
  await new Promise((resolve) => setTimeout(resolve, 100));

  // 删除测试数据库文件
  await unlinkWithRetry(TEST_DB_FILE);

  // 强制垃圾回收（如果可用）
  if (global.gc) {
    global.gc();
  }
}
