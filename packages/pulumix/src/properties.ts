import { Input, Resource } from "@pulumi/pulumi";
import { isKey } from "./record";

export type PropertyOrSelf<
  Value,
  Key extends PropertyKey,
> = Key extends keyof Value ? Value[Key] : Value;

/**
 * If the `value` has a property with the given `key` then return the value of that property otherwise return the
 * `value`.
 */
export function propertyOrSelf<Value, Key extends PropertyKey>(
  value: Value,
  key: Key,
): Value extends unknown ? PropertyOrSelf<Value, Key> : never {
  if (isKey(value, key)) {
    return value[key];
  } else {
    // No idea how to get rid of this cast.
    return value as Value extends unknown ? PropertyOrSelf<Value, Key> : never;
  }
}

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

export type NameProperty = {
  name: Input<string>;
};

export type NamedResource = NameProperty & Resource;

export type Name = NameProperty | Input<string>;

export function nameProperty(name: Name): Input<string> {
  return propertyOrSelf(name, "name");
}

export type ResourceNames = string | ResourceNameProperties | NamedResource;

export type ResourceNameProperties = ResourceNameProperty & NameProperty;

export function resourceNames(
  resourceNames: ResourceNames,
): ResourceNameProperties {
  return {
    resourceName: resourceName(resourceNames),
    name: nameProperty(resourceNames),
  };
}
