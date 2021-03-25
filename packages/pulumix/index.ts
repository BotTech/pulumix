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

type Key = string | number | symbol;

export function mapKeys<A extends Key, B>(
  record: Record<string, B>,
  f: (s: string) => A
): Record<A, B> {
  return Object.keys(record).reduce((acc, key) => {
    acc[f(key)] = record[key];
    return acc;
  }, {} as Record<A, B>);
}

export function mapKeysToLowerCase<A>(
  record: Record<string, A>
): Record<string, A> {
  return mapKeys(record, (s) => s.toLowerCase());
}
