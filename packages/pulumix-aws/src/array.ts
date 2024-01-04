export function oneOrMany<A>(a: A | A[]): A[] {
  return Array.isArray(a) ? a : [a];
}
