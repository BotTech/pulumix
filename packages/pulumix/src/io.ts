import { Output, OutputInstance } from "@pulumi/pulumi";

export type MaybeOutput<In, Out> = In extends ComplexInput<unknown>
  ? Output<Out>
  : Out;

export type ComplexInput<A> = Promise<A> | OutputInstance<A>;

export type SimpleInput<A> = A extends ComplexInput<unknown> ? never : A;
