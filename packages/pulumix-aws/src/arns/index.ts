import * as pulumi from "@pulumi/pulumi";
import { all, Input, output, Output, Resource } from "@pulumi/pulumi";
import { Inputs, kv, kv2, propertyOrSelf } from "@bottech/pulumix";

import * as iam from "./iam";
import * as s3 from "./s3";
import { splitFirst } from "~/src/string";
import { oneOrMany } from "~/src/array";

export { iam, s3 };

// https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html

export interface ARNProperty {
  arn: Input<string>;
}

// TODO: Rename ResourceWithARN
export type AWSNamedResource = ARNProperty & Resource;

export type ARN = Input<string | ARNProperty>;

export function arn(arn: ARN): Output<string> {
  return output(arn).apply((x) => propertyOrSelf(x, "arn"));
}

export type ARNs = Input<ARN | ARN[]>;

// TODO: Rename this. arns.arns is awkward.
export function arns(arns: ARNs): Output<string[]> {
  return output(arns).apply((arns) => {
    if (Array.isArray(arns)) {
      return all(arns.map(arn));
    } else {
      return arn(arns).apply((arn) => [arn]);
    }
  });
}

export type ARNParts = {
  arn: string;
  partition: string;
  service: string;
  region: string;
  accountId: string;
  resource: string;
};

export type WithPart<A, Part extends PropertyKey> = A & { [P in Part]: string };

export type WithParts<A, Part extends PropertyKey> = A & {
  [P in Part]: string[];
};

export type ARNArgs = Inputs<{
  partition?: string;
  service: string;
  region?: string;
  accountId?: string;
  resource: string;
}>;

const SUB_RESOURCE_SEPARATOR = "/";
const QUALIFIED_RESOURCE_SEPARATOR = ":";

export function interpolateARN(args: ARNArgs): Output<string> {
  return pulumi.interpolate`arn:${args.partition ?? "aws"}:${args.service}:${
    args.region ?? ""
  }:${args.accountId ?? ""}:${args.resource}`;
}

function interpolateNestedResource(
  resourceType: Input<string>,
  separator: string,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  const id = subResourceIds.reduce((previous, current) => {
    return pulumi.interpolate`${previous}${separator}${current}`;
  }, resourceId);
  return pulumi.interpolate`${resourceType}${separator}${id}`;
}

export function interpolateSubResource(
  resourceType: Input<string>,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  return interpolateNestedResource(
    resourceType,
    SUB_RESOURCE_SEPARATOR,
    resourceId,
    ...subResourceIds,
  );
}

export function interpolateARNWithSubResource(
  args: Omit<ARNArgs, "resource">,
  resourceType: Input<string>,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  return interpolateARN({
    ...args,
    resource: interpolateSubResource(
      resourceType,
      resourceId,
      ...subResourceIds,
    ),
  });
}

export function interpolateQualifiedResource(
  resourceType: Input<string>,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  return interpolateNestedResource(
    resourceType,
    QUALIFIED_RESOURCE_SEPARATOR,
    resourceId,
    ...subResourceIds,
  );
}

export function interpolateARNWithQualifiedResource(
  args: Omit<ARNArgs, "resource">,
  resourceType: Input<string>,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  return interpolateARN({
    ...args,
    resource: interpolateQualifiedResource(
      resourceType,
      resourceId,
      ...subResourceIds,
    ),
  });
}

// TODO: These extract functions should check the service name.

// TODO: Rename arn and name these args arn instead.
export function extractARNParts(arnWithAccountId: ARN): Output<ARNParts> {
  return arn(arnWithAccountId).apply((arn) => {
    const [, partition, service, region, accountId, ...resources] = arn.split(
      QUALIFIED_RESOURCE_SEPARATOR,
    );
    const resource = resources.join(QUALIFIED_RESOURCE_SEPARATOR) ?? "";
    return {
      arn,
      partition: partition ?? "",
      service: service ?? "",
      region: region ?? "",
      accountId: accountId ?? "",
      resource,
    };
  });
}

export function extractARNPartsMap<A>(
  arnWithAccountId: ARN,
  f: (parts: ARNParts) => A,
): Output<ARNParts & A> {
  return extractARNParts(arnWithAccountId).apply((parts) => {
    return {
      ...parts,
      ...f(parts),
    };
  });
}

export function extractAccountId(arn: ARN): Output<string> {
  return extractARNParts(arn).accountId;
}

/**
 * Example format: `arn:${Partition}:s3:::${BucketName}`
 */
export function extractARNPartsWithResource<ResourceKey extends PropertyKey>(
  arnWithAccountId: ARN,
  resourceKey: ResourceKey,
): Output<WithPart<ARNParts, ResourceKey>> {
  return extractARNPartsMap(arnWithAccountId, (parts) => {
    return {
      ...parts,
      ...kv(resourceKey, parts.resource),
    };
  });
}

/**
 * Example format: `arn:${Partition}:s3:::${BucketName}/${ObjectName}`
 */
function extractARNPartsWithNestedResource<
  ParentResourceKey extends PropertyKey,
  SubResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  separator: string,
  parentResourceKey: ParentResourceKey,
  subResourceKey: SubResourceKey,
): Output<WithPart<ARNParts, ParentResourceKey | SubResourceKey>> {
  return extractARNPartsMap(arnWithAccountId, (parts) => {
    const [parentResourceId, subResourceId] = splitFirst(
      parts.resource,
      separator,
    );
    return kv2(
      parentResourceKey,
      parentResourceId,
      subResourceKey,
      subResourceId,
    );
  });
}

export function extractARNPartsWithNestedSubResource<
  ParentResourceKey extends PropertyKey,
  SubResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  parentResourceKey: ParentResourceKey,
  subResourceKey: SubResourceKey,
): Output<WithPart<ARNParts, ParentResourceKey | SubResourceKey>> {
  return extractARNPartsWithNestedResource(
    arnWithAccountId,
    SUB_RESOURCE_SEPARATOR,
    parentResourceKey,
    subResourceKey,
  );
}

export function extractARNPartsWithNestedQualifiedResource<
  ParentResourceKey extends PropertyKey,
  SubResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  parentResourceKey: ParentResourceKey,
  subResourceKey: SubResourceKey,
): Output<WithPart<ARNParts, ParentResourceKey | SubResourceKey>> {
  return extractARNPartsWithNestedResource(
    arnWithAccountId,
    QUALIFIED_RESOURCE_SEPARATOR,
    parentResourceKey,
    subResourceKey,
  );
}

function checkResourceTypes(
  resourceParts: string[],
  resourceTypes: string[],
  arn: string,
) {
  for (let i = 0; i < resourceTypes.length; i++) {
    const expected = resourceTypes[i];
    if (i < resourceParts.length) {
      const actual = resourceParts[i];
      if (actual !== expected) {
        throw `Expected resource-type '${expected}' but found '${actual}' in ARN '${arn}'.`;
      }
    } else {
      throw `Expected resource-type '${expected}' but found no more types in ARN '${arn}'.`;
    }
  }
}

/**
 * Example format: `arn:${Partition}:s3:${Region}:${Account}:access-grants/default
 */
function extractARNPartsWithFixedResource(
  arnWithAccountId: ARN,
  resourceType: string | string[],
  separator: string,
): Output<ARNParts> {
  return extractARNParts(arnWithAccountId).apply((parts) => {
    const resourceParts = parts.resource.split(separator);
    const resourceTypes = oneOrMany(resourceType);
    checkResourceTypes(resourceParts, resourceTypes, parts.arn);
    return parts;
  });
}

export function extractARNPartsWithFixedSubResource(
  arnWithAccountId: ARN,
  resourceType: string | string[],
): Output<ARNParts> {
  return extractARNPartsWithFixedResource(
    arnWithAccountId,
    resourceType,
    SUB_RESOURCE_SEPARATOR,
  );
}

export function extractARNPartsWithFixedQualifiedResource(
  arnWithAccountId: ARN,
  resourceType: string | string[],
): Output<ARNParts> {
  return extractARNPartsWithFixedResource(
    arnWithAccountId,
    resourceType,
    QUALIFIED_RESOURCE_SEPARATOR,
  );
}

/**
 * Example format: `arn:${Partition}:s3:${Region}:${Account}:job/${JobId}`
 */
function extractARNPartsWithTypedResource<ResourceKey extends PropertyKey>(
  arnWithAccountId: ARN,
  resourceType: string | string[],
  separator: string,
  resourceKey: ResourceKey,
): Output<WithPart<ARNParts, ResourceKey>> {
  return extractARNPartsMap(arnWithAccountId, (parts) => {
    const resourceParts = parts.resource.split(separator);
    const resourceTypes = oneOrMany(resourceType);
    checkResourceTypes(resourceParts, resourceTypes, parts.arn);
    const resourceId = resourceParts
      .slice(resourceTypes.length)
      .join(separator);
    return kv(resourceKey, resourceId);
  });
}

export function extractARNPartsWithTypedSubResource<
  ResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  resourceType: string | string[],
  resourceKey: ResourceKey,
): Output<WithPart<ARNParts, ResourceKey>> {
  return extractARNPartsWithTypedResource(
    arnWithAccountId,
    resourceType,
    SUB_RESOURCE_SEPARATOR,
    resourceKey,
  );
}

export function extractARNPartsWithTypedQualifiedResource<
  ResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  resourceType: string | string[],
  resourceKey: ResourceKey,
): Output<WithPart<ARNParts, ResourceKey>> {
  return extractARNPartsWithTypedResource(
    arnWithAccountId,
    resourceType,
    QUALIFIED_RESOURCE_SEPARATOR,
    resourceKey,
  );
}

/**
 * Example format: `arn:${Partition}:lambda:${Region}:${Account}:function:${FunctionName}:${Alias}`
 */
function extractARNPartsWithTypedNestedResource<
  ParentResourceKey extends PropertyKey,
  SubResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  resourceType: string | string[],
  separator: string,
  parentResourceKey: ParentResourceKey,
  subResourceKey: SubResourceKey,
): Output<WithPart<ARNParts, ParentResourceKey | SubResourceKey>> {
  return extractARNPartsMap(arnWithAccountId, (parts) => {
    const resourceParts = parts.resource.split(separator);
    const resourceTypes = oneOrMany(resourceType);
    checkResourceTypes(resourceParts, resourceTypes, parts.arn);
    const parentResourceId = resourceParts[resourceTypes.length] ?? "";
    const subResourceId = resourceParts
      .slice(resourceTypes.length + 1)
      .join(separator);
    return kv2(
      parentResourceKey,
      parentResourceId,
      subResourceKey,
      subResourceId,
    );
  });
}

export function extractARNPartsWithTypedNestedSubResource<
  ParentResourceKey extends PropertyKey,
  SubResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  resourceType: string | string[],
  parentResourceKey: ParentResourceKey,
  subResourceKey: SubResourceKey,
): Output<WithPart<ARNParts, ParentResourceKey | SubResourceKey>> {
  return extractARNPartsWithTypedNestedResource(
    arnWithAccountId,
    resourceType,
    SUB_RESOURCE_SEPARATOR,
    parentResourceKey,
    subResourceKey,
  );
}

export function extractARNPartsWithTypedNestedQualifiedResource<
  ParentResourceKey extends PropertyKey,
  SubResourceKey extends PropertyKey,
>(
  arnWithAccountId: ARN,
  resourceType: string | string[],
  parentResourceKey: ParentResourceKey,
  subResourceKey: SubResourceKey,
): Output<WithPart<ARNParts, ParentResourceKey | SubResourceKey>> {
  return extractARNPartsWithTypedNestedResource(
    arnWithAccountId,
    resourceType,
    QUALIFIED_RESOURCE_SEPARATOR,
    parentResourceKey,
    subResourceKey,
  );
}
