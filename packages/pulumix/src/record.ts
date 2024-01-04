// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { Input } from "@pulumi/pulumi";

export function hasKey<Key extends PropertyKey>(
  value: unknown,
  key: Key,
): value is { [P in Key]: unknown } {
  return value !== null && typeof value === "object" && key in value;
}

export function isKey<Value, Key extends keyof Value>(
  value: Value,
  key: Key,
): key is Key;
export function isKey<Value, Key extends PropertyKey>(
  value: Value,
  key: Key,
): key is Key & never;
export function isKey<Value, Key extends PropertyKey>(value: Value, key: Key) {
  return value !== null && typeof value === "object" && key in value;
}

// Workaround for https://github.com/microsoft/TypeScript/issues/13948.
export function kv<K extends PropertyKey, V>(
  k: K,
  v: V,
): { [P in K]: { [Q in P]: V } }[K] {
  return { [k]: v } as any;
}

export function kv2<K1 extends PropertyKey, V1, K2 extends PropertyKey, V2>(
  k1: K1,
  v1: V1,
  k2: K2,
  v2: V2,
): { [P in K1]: { [Q in P]: V1 } }[K1] & { [P in K2]: { [Q in P]: V2 } }[K2] {
  return { [k1]: v1, [k2]: v2 } as any;
}

export function mapKeys<A, B extends PropertyKey>(
  record: A,
  f: (key: keyof A, value: A[keyof A]) => B,
): Record<B, A[keyof A]> {
  const result = {} as Record<B, A[keyof A]>;
  for (const key in record) {
    const value = record[key];
    result[f(key, value)] = value;
  }
  return result;
}

export function mapKeysToLowerCase<A extends string, B>(
  record: Record<A, B>,
): Record<string, B> {
  return mapKeys(record, (s) => s.toLowerCase());
}

export type MappedValues<A, B> = {
  [Key in keyof A]: B;
};

export function mapValues<A, B>(
  record: A,
  f: (value: A[keyof A], key: keyof A) => B,
): MappedValues<A, B> {
  const result = {} as MappedValues<A, B>;
  for (const key in record) {
    result[key] = f(record[key], key);
  }
  return result;
}

export function mapRecord<A, B extends PropertyKey, C>(
  record: A,
  f: (key: keyof A, value: A[keyof A]) => [B, C],
): Record<B, C> {
  const result = {} as Record<B, C>;
  for (const key in record) {
    const value = record[key];
    const keyValueResult = f(key, value);
    result[keyValueResult[0]] = keyValueResult[1];
  }
  return result;
}

export type Inputs<A> = {
  [K in keyof A]: Input<A[K]>;
};
