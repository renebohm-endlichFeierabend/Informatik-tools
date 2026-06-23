/** Winkel in Grad → Bogenmaß. */
export function radian(grad: number): number {
  return (grad * Math.PI) / 180;
}

/** Lineare Interpolation: bewegt `a` um höchstens `geschw` Richtung `b`. */
export function naeheran(a: number, b: number, geschw: number): number {
  const d = b - a;
  if (Math.abs(d) <= geschw) return b;
  return a + Math.sign(d) * geschw;
}

/** Kürzeste Winkeldifferenz in Grad (-180..180). */
export function winkelDiff(von: number, zu: number): number {
  let d = ((zu - von + 540) % 360) - 180;
  return d;
}
