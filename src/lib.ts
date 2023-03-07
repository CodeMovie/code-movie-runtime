export function unique<T>(input: T[]): T[] {
  return Array.from(new Set(input));
}

export function toFiniteInt(value: unknown): number {
  const asInt = Math.round(Number(value));
  if (Number.isFinite(asInt) && !Number.isNaN(asInt)) {
    return asInt;
  }
  return 0;
}

export function toPositiveFiniteInt(value: unknown): number {
  return Math.abs(toFiniteInt(value));
}

export function parseKeyframesAttributeValue(value: unknown): number[] {
  if (value) {
    return String(value)
      .split(/\s+/)
      .map(toPositiveFiniteInt)
      .sort((a, b) => a - b);
  }
  return [];
}
