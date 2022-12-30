export function toSet<A>(array: A[]): A[] {
  return array.filter((value, index, self) => self.indexOf(value) === index);
}
