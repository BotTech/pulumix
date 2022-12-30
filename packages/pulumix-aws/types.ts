import { Tags } from "@pulumi/aws";
import {
  getProject,
  getStack,
  Input,
  Output,
  output,
  all,
  Resource,
} from "@pulumi/pulumi";
import {
  inputPropertyOrElse,
  resourceName,
  ResourceNameProperty,
} from "@bottech/pulumix";

export interface ARNProperty {
  arn: Input<string>;
}

export type AWSNamedResource = ARNProperty & Resource;

// TODO: Make more things accept an input.
export type ARN = Input<string | ARNProperty>;

export function arn(arn: ARN): Output<string> {
  return inputPropertyOrElse<string, ARNProperty, "arn">(arn, "arn");
}

export type ARNs = Input<ARN | ARN[]>;

export function arns(arns: ARNs): Output<string[]> {
  return output(arns).apply((arns) => {
    if (Array.isArray(arns)) {
      return all(arns.map(arn));
    } else {
      return arn(arns).apply((arn) => [arn]);
    }
  });
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
  id: Input<string>;
}

export type AWSIdentifiedResource = IdProperty & Resource;

export type Id = Input<string | IdProperty>;

export function id(id: Id): Input<string> {
  return inputPropertyOrElse<string, IdProperty, "id">(id, "id");
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
  tags?: Input<Tags>;
}

export function tags(): Record<string, Input<string>> {
  return {
    "pulumi:Project": getProject(),
    "pulumi:Stack": getStack(),
  };
}

export function tagged<A extends Tagged>(a: A): A {
  const newTags = { ...a.tags, ...tags() };
  return { ...a, tags: newTags };
}
