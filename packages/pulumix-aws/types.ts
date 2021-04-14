import {
  inputOrProperty,
  resourceName,
  ResourceNameProperty
} from "@bottech/pulumix";
import { Tags } from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface ARNProperty {
  arn: pulumi.Input<string>;
}

export type AWSNamedResource = ARNProperty & pulumi.Resource;

export type ARN = pulumi.Input<string> | ARNProperty;

export function arn(arn: ARN): pulumi.Input<string> {
  return inputOrProperty(arn, "arn");
}

export type AWSResourceNames = AWSResourceNameProperties | AWSNamedResource;

export type AWSResourceNameProperties = ResourceNameProperty & ARNProperty;

export function awsResourceNames(
  resourceNames: AWSResourceNames
): AWSResourceNameProperties {
  return {
    resourceName: resourceName(resourceNames),
    arn: arn(resourceNames),
  };
}

export interface IdProperty {
  id: pulumi.Input<string>;
}

export type AWSIdentifiedResource = IdProperty & pulumi.Resource;

export type Id = pulumi.Input<string> | IdProperty;

export function id(id: Id): pulumi.Input<string> {
  return inputOrProperty(id, "id");
}

export type AWSIdentifiedResourceNames =
  | AWSIdentifiedResourceNameProperties
  | AWSIdentifiedResource;

export type AWSIdentifiedResourceNameProperties = ResourceNameProperty &
  IdProperty;

export function awsIdentifiedResourceNames(
  resourceNames: AWSIdentifiedResourceNames
): AWSIdentifiedResourceNameProperties {
  return {
    resourceName: resourceName(resourceNames),
    id: id(resourceNames),
  };
}

export interface Tagged {
  tags?: pulumi.Input<Tags>;
}

export function tags(): Record<string, pulumi.Input<string>> {
  return {
    "pulumi:Project": pulumi.getProject(),
    "pulumi:Stack": pulumi.getStack(),
  };
}

export function tagged<A extends Tagged>(a: A): A {
  const newTags = { ...a.tags, ...tags() };
  return { ...a, tags: newTags };
}
