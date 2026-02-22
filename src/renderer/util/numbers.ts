
export function clamp(value: number, min: number, max: number): number {
  // return Math.min(Math.max(value, min), max);
  if(value <= min)
    return min;
  else if(value >= max)
    return max;
  else
    return value;
}
