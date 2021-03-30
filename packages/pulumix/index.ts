import * as pulumi from "@pulumi/pulumi";
import { Input, Output, Unwrap, UnwrapSimple } from "@pulumi/pulumi";

export interface Tagged {
  readonly tags?: Input<{ [key: string]: Input<string> }>;
}

export function tags(): Record<string, Input<string>> {
  return {
    "pulumi:Project": pulumi.getProject(),
    "pulumi:Stack": pulumi.getStack(),
  };
}

export function tagged<A extends Tagged>(a: A): A {
  const newTags = { ...a.tags, ...tags() };
  return { ...a, tags: newTags };
}

export function forEachInput<A>(
  inputs: Input<Input<A>[]> | undefined,
  f: (
    value: Unwrap<A> | UnwrapSimple<A>,
    index: number,
    array: (Unwrap<A> | UnwrapSimple<A>)[]
  ) => void
): Output<void> {
  return pulumi.output(inputs).apply((as) => as?.forEach(f));
}

export type Key = string | number | symbol;

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
  f: (key: keyof A, value: A[keyof A]) => B
): MappedValues<A, B> {
  const result = {} as MappedValues<A, B>;
  if (record) {
    for (const key in record) {
      result[key] = f(key, record[key]);
    }
  }
  return result;
}
