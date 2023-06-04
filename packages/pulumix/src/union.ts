import { Output } from "@pulumi/pulumi";

export function splitOutput<A, B>(a: Output<A | B>): Output<A> | Output<B> {
  // Although this is not strictly safe there is no runtime difference between these types.
  return a as Output<A> | Output<B>;
}
