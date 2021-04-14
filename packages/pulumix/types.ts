import * as pulumi from "@pulumi/pulumi";

export type Key = string | number | symbol;

export function hasKey<K extends Key>(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  val: any,
  key: K
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): val is { [P in K]: any } {
  return key in val;
}

export function inputOrProperty<
  A,
  B extends { [P in K]: pulumi.Input<A> },
  K extends Key
>(alternatives: pulumi.Input<A> | B, key: K): pulumi.Input<A> {
  if (hasKey(alternatives, key)) {
    return alternatives[key];
  } else {
    return alternatives;
  }
}

export interface ResourceNameProperty {
  resourceName: string;
}

export type ResourceName = string | ResourceNameProperty | pulumi.Resource;

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
  name: pulumi.Input<string>;
}

export type NamedResource = NameProperty & pulumi.Resource;

export type Name = NameProperty | pulumi.Input<string>;

export function nameProperty(name: Name): pulumi.Input<string> {
  return inputOrProperty(name, "name");
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
