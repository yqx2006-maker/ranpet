// 一键部署：构建前端产物并启动生产模式服务（Express 同时托管 dist 与 /api）
import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const build = spawnSync(npm, ['run', 'build'], { stdio: 'inherit', shell: true });

if (build.status !== 0) {
  console.error('[deploy] 构建失败，已停止部署');
  process.exit(build.status ?? 1);
}

process.env.NODE_ENV = 'production';
process.env.SERVE_STATIC = 'true';

console.log('[deploy] 构建完成，启动生产服务…');
await import('../server/index.mjs');
