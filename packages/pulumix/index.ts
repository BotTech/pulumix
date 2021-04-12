import * as pulumi from "@pulumi/pulumi";
import { Key } from "./types";
export * from "./types";

export function forEachInput<A>(
  inputs: pulumi.Input<pulumi.Input<A>[]> | undefined,
  f: (
    value: pulumi.Unwrap<A> | pulumi.UnwrapSimple<A>,
    index: number,
    array: (pulumi.Unwrap<A> | pulumi.UnwrapSimple<A>)[]
  ) => void
): pulumi.Output<void> {
  return pulumi.output(inputs).apply((as) => as?.forEach(f));
}

export function mapKeys<A, B extends Key>(
  record: A | null | undefined,
  f: (key: keyof A, value: A[keyof A]) => B
): Record<B, A[keyof A]> {
  const result = {} as Record<B, A[keyof A]>;
  if (record) {
    for (const key in record) {
      const value = record[key];
      result[f(key, value)] = value;
    }
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
  record: A | null | undefined,
  f: (value: A[keyof A], key: keyof A) => B
): MappedValues<A, B> {
  const result = {} as MappedValues<A, B>;
  if (record) {
    for (const key in record) {
      result[key] = f(record[key], key);
    }
  }
  return result;
}

export function mapRecord<A, B extends Key, C>(
  record: A | null | undefined,
  f: (key: keyof A, value: A[keyof A]) => [B, C]
): Record<B, C> {
  const result = {} as Record<B, C>;
  if (record) {
    for (const key in record) {
      const value = record[key];
      const keyValueResult = f(key, value);
      result[keyValueResult[0]] = keyValueResult[1];
    }
  }
  return result;
}

export function mapPromise<A, B>(
  promise: Promise<A>,
  f: (value: A) => B
): Promise<B> {
  return new Promise((resolve, reject) =>
    promise.then((a) => resolve(f(a))).catch((e) => reject(e))
  );
}
