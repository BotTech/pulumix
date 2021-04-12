import { inputOrProperty, resourceName, ResourceNamed } from "@bottech/pulumix";
import * as pulumi from "@pulumi/pulumi";

export interface AWSNamed {
  arn: pulumi.Input<string>;
}

export type AWSNamedResource = AWSNamed & pulumi.Resource;

export type ARNAlternatives = pulumi.Input<string> | AWSNamed;

export function arn(nameAlternatives: ARNAlternatives): pulumi.Input<string> {
  return inputOrProperty(nameAlternatives, "arn");
}

export type AWSResourceNameAlternatives = AWSResourceNames | AWSNamedResource;

export type AWSResourceNames = ResourceNamed & AWSNamed;

export function awsResourceNames(
  nameAlternatives: AWSResourceNameAlternatives
): AWSResourceNames {
  return {
    resourceName: resourceName(nameAlternatives),
    arn: arn(nameAlternatives),
  };
}
