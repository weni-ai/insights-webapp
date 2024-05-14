export function pxToVh(px) {
  const vh = window.innerHeight;
  const pxAsVh = (px / vh) * 100;
  return pxAsVh;
}
