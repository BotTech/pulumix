// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Key = keyof any;

export function hasKey<K extends Key>(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  val: any,
  key: K
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): val is { [P in K]: any } {
  return key in val;
}

export function mapKeys<A, B extends Key>(
  record: A,
  f: (key: keyof A, value: A[keyof A]) => B
): Record<B, A[keyof A]> {
  const result = {} as Record<B, A[keyof A]>;
  for (const key in record) {
    const value = record[key];
    result[f(key, value)] = value;
  }
  return result;
}

export function mapKeysToLowerCase<A extends string, B>(
  record: Record<A, B>
): Record<string, B> {
  return mapKeys(record, (s) => s.toLowerCase());
}

export type MappedValues<A, B> = {
  [Key in keyof A]: B;
};

export function mapValues<A, B>(
  record: A,
  f: (value: A[keyof A], key: keyof A) => B
): MappedValues<A, B> {
  const result = {} as MappedValues<A, B>;
  for (const key in record) {
    result[key] = f(record[key], key);
  }
  return result;
}

export function mapRecord<A, B extends Key, C>(
  record: A,
  f: (key: keyof A, value: A[keyof A]) => [B, C]
): Record<B, C> {
  const result = {} as Record<B, C>;
  for (const key in record) {
    const value = record[key];
    const keyValueResult = f(key, value);
    result[keyValueResult[0]] = keyValueResult[1];
  }
  return result;
}
