import { Input, output, Output, Resource } from "@pulumi/pulumi";
import { hasKey, Key } from "./record";
import { extractUnwrapped, wrappedOutput } from "./unwrap";

export function propertyOrElse<A, B, C extends { [P in K]: B }, K extends Key>(
  alternatives: A | C,
  key: K
): A | B {
  return hasKey(alternatives, key) ? alternatives[key] : alternatives;
}

// TODO: Are all these types for alternatives necessary?
export function inputPropertyOrElse<
  A,
  B extends { [P in K]: Input<A> },
  K extends Key
>(alternatives: Input<A> | B | Input<A | B>, key: K): Output<A> {
  return output(alternatives).apply<A>((unwrapped) => {
    // I don't know why the type inference fails so badly here.
    const extracted = extractUnwrapped<A | B>(unwrapped);
    const propOrA = propertyOrElse<A, Input<A>, B, K>(extracted, key);
    return wrappedOutput(propOrA);
  });
}

// export function inputOrProperties<
//   A,
//   B extends { [P in K]:   Input<A> },
//   K extends Key
// >(
//   alternatives:   Input<(  Input<A> |   Input<B>)[]>,
//   key: K
// ):   Input<  Input<A>[]> {
//   return pulumi
//     .output(alternatives)
//     .apply((unwrapped:   Unwrap<  Input<A | B>[]>) => {
//       // The types get a bit lost in Unwrap.
//       // See https://stackoverflow.com/questions/67146967/why-does-typescript-infer-unknown-with-a-recursive-type.
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const aOrBs: (  Input<A> |   Input<B>)[] = unwrapped as any;
//       return aOrBs.map((aOrB) => inputPropertyOrElse<A, B, K>(aOrB, key));
//     });
// }

export interface ResourceNameProperty {
  resourceName: string;
}

export type ResourceName = string | ResourceNameProperty | Resource;

export function resourceName(resourceName: ResourceName): string {
  if (typeof resourceName === "string") {
    return resourceName;
  } else if ("resourceName" in resourceName) {
    return resourceName.resourceName;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resource = resourceName as any;
    if ("__name" in resource) {
      return resource.__name;
    } else {
      throw "BUG: Resource __name is undefined.";
    }
  }
}

export interface NameProperty {
  name: Input<string>;
}

export type NamedResource = NameProperty & Resource;

export type Name = NameProperty | Input<string>;

export function nameProperty(name: Name): Input<string> {
  return inputPropertyOrElse(name, "name");
}

export type ResourceNames = string | ResourceNameProperties | NamedResource;

export type ResourceNameProperties = ResourceNameProperty & NameProperty;

export function resourceNames(
  resourceNames: ResourceNames
): ResourceNameProperties {
  return {
    resourceName: resourceName(resourceNames),
    name: nameProperty(resourceNames),
  };
}
