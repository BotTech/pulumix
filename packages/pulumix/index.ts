export * from "./array";
export * from "./properties";
export * from "./record";
export * from "./stack";
export * from "./union";
export * from "./unwrap";

// export function forEachInput<A>(
//   inputs: pulumi.Input<pulumi.Input<A>[]> | undefined,
//   f: (value: pulumi.Unwrap<A>, index: number, array: pulumi.Unwrap<A>[]) => void
// ): pulumi.Output<void> {
//   const x: pulumi.Output<pulumi.Unwrap<pulumi.Input<A>[] | undefined>> =
//     pulumi.output(inputs);
//   return x.apply((as) => {
//     if (as) {
//       const x: pulumi.UnwrappedArray<pulumi.Input<A>> = as;
//       const y: Array<pulumi.Unwrap<pulumi.Input<A>>> = as;
//       y.forEach(f);
//     }
//   });
// }
