// 将 public 目录下的绝对路径拼上部署基路径，兼容 GitHub Pages 等子路径部署
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
