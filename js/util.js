export function caminho(src) {
  return src.split('/').map(encodeURIComponent).join('/');
}
