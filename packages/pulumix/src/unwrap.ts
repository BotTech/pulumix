import { Input, output, Output, Unwrap } from "@pulumi/pulumi";

export function extractUnwrapped<A>(a: Unwrap<A>): A {
  // The type for Unwrap is not correct because it uses a structural subtype for Array
  // which doesn't capture all the types in the same way as a conditional type would.
  // This could be fixed in TypeScript 4 but Pulumi still uses TypeScript 3.
  // See https://stackoverflow.com/questions/67146967/why-does-typescript-infer-unknown-with-a-recursive-type.
  return a as A;
}

export function wrappedOutput<A>(a: Input<A>): Output<A> {
  return output(a).apply(extractUnwrapped);
}
