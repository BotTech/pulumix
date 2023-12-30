import * as pulumi from "@pulumi/pulumi";
import { all, Input, output, Output, Resource } from "@pulumi/pulumi";
import { kv, propertyOrSelf } from "@bottech/pulumix";

import * as iam from "./iam";
import * as s3 from "./s3";

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

// TODO: Why is this called Index?
export type Index = Input<ARN | ARN[]>;

export function arns(arns: Index): Output<string[]> {
  return output(arns).apply((arns) => {
    if (Array.isArray(arns)) {
      return all(arns.map(arn));
    } else {
      return arn(arns).apply((arn) => [arn]);
    }
  });
}

export type ARNServiceArgs = {
  partition?: Input<string>;
  region: Input<string>;
  accountId: Input<string>;
};

export type ARNServiceArgsNoRegion = Omit<ARNServiceArgs, "region">;

export type ARNServiceArgsNoAccountId = Omit<ARNServiceArgs, "accountId">;

export type ARNServiceArgsNoRegionOrAccountId = Omit<
  ARNServiceArgsNoRegion,
  "accountId"
>;

export type ARNArgs = ARNServiceArgs & {
  service: Input<string>;
  resource: Input<string>;
};

export type ARNArgsNoRegion = Omit<ARNArgs, "region">;

export type ARNArgsNoAccountId = Omit<ARNArgs, "accountId">;

export type ARNArgsNoRegionOrAccountId = Omit<ARNArgsNoRegion, "accountId">;

export type ARNOptionalArgs = ARNArgsNoRegionOrAccountId &
  Partial<Pick<ARNArgs, "region" | "accountId">>;

export function interpolateARN(args: ARNOptionalArgs): Output<string> {
  return pulumi.interpolate`arn:${args.partition ?? "aws"}:${args.service}:${
    args.region ?? ""
  }:${args.accountId ?? ""}:${args.resource}`;
}

function interpolateResource(
  separator: string,
  resourceType: Input<string>,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  const id = subResourceIds.reduce((previous, current) => {
    return pulumi.interpolate`${previous}${separator}${current}`;
  }, resourceId);
  return pulumi.interpolate`${resourceType}${separator}${id}`;
}

export function interpolateResourceType(
  resourceType: Input<string>,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  return interpolateResource("/", resourceType, resourceId, ...subResourceIds);
}

export function interpolateQualifiedResource(
  resourceType: Input<string>,
  resourceId: Input<string>,
  ...subResourceIds: Input<string>[]
): Output<string> {
  return interpolateResource(":", resourceType, resourceId, ...subResourceIds);
}

export type ARNParts = {
  partition: string;
  service: string;
  region: string;
  accountId: string;
  resource: string;
};

export type ARNPartsNoRegion = Omit<ARNParts, "region">;

export function extractARNParts(arnWithAccountId: ARN): Output<ARNParts> {
  return arn(arnWithAccountId).apply((arn) => {
    const [, partition, service, region, accountId, ...resource] =
      arn.split(":");
    return {
      partition: partition ?? "",
      service: service ?? "",
      region: region ?? "",
      accountId: accountId ?? "",
      resource: resource.join(":") ?? "",
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

function extractResource(
  separator: string,
  resource: string,
): {
  resourceType: string;
  resourceId: string;
} {
  const [resourceType, resourceId] = resource.split(
    new RegExp(`${separator}(.*)`),
  );
  return {
    resourceType: resourceType ?? "",
    resourceId: resourceId ?? "",
  };
}

function extractSubResource(
  separator: string,
  resource: string,
): {
  resourceType: string;
  resourceId: string;
} {
  const [resourceType, resourceId] = resource.split(separator);
  return {
    resourceType: resourceType ?? "",
    resourceId: resourceId ?? "",
  };
}

function extractSubResources(
  separator: string,
  resource: string,
): {
  resourceType: string;
  resourceIds: string[];
} {
  const [resourceType, ...resourceIds] = resource.split(separator);
  return {
    resourceType: resourceType ?? "",
    resourceIds,
  };
}

export function extractResourceType(
  resource: string,
  resourceType: string,
): string {
  const extracted = extractResource("/", resource);
  return extracted.resourceType === resourceType ? extracted.resourceId : "";
}

export function extractARNPartsWithResourceType<Key extends PropertyKey>(
  arnWithAccountId: ARN,
  resourceType: string,
  key: Key,
): Output<ARNParts & { [P in Key]: string }> {
  return extractARNPartsMap(arnWithAccountId, (parts) =>
    kv(key, extractResourceType(parts.resource, resourceType)),
  );
}

export function extractSubResourceType(
  resource: string,
  resourceType: string,
): string {
  const extracted = extractSubResource("/", resource);
  return extracted.resourceType === resourceType ? extracted.resourceId : "";
}

export function extractSubResourceTypes(
  resource: string,
  resourceType: string,
): string[] {
  const extracted = extractSubResources("/", resource);
  return extracted.resourceType === resourceType ? extracted.resourceIds : [];
}

export function extractARNPartsWithSubResourceType<Key extends PropertyKey>(
  arnWithAccountId: ARN,
  resourceType: string,
  key: Key,
): Output<ARNParts & { [P in Key]: string }> {
  return extractARNPartsMap(arnWithAccountId, (parts) =>
    kv(key, extractSubResourceType(parts.resource, resourceType)),
  );
}

export function extractARNPartsWithSubResourceTypes<Key extends PropertyKey>(
  arnWithAccountId: ARN,
  resourceType: string,
  key: Key,
): Output<ARNParts & { [P in Key]: string[] }> {
  return extractARNPartsMap(arnWithAccountId, (parts) =>
    kv(key, extractSubResourceTypes(parts.resource, resourceType)),
  );
}

export function extractQualifiedResource(
  resource: string,
  resourceType: string,
): string {
  const extracted = extractResource(":", resource);
  return extracted.resourceType === resourceType ? extracted.resourceId : "";
}

export function extractARNPartsWithQualifiedResource<Key extends PropertyKey>(
  arnWithAccountId: ARN,
  resourceType: string,
  key: Key,
): Output<ARNParts & { [P in Key]: string }> {
  return extractARNPartsMap(arnWithAccountId, (parts) =>
    kv(key, extractQualifiedResource(parts.resource, resourceType)),
  );
}

export function extractQualifiedSubResource(
  resource: string,
  resourceType: string,
): string {
  const extracted = extractSubResource(":", resource);
  return extracted.resourceType === resourceType ? extracted.resourceId : "";
}

export function extractQualifiedSubResources(
  resource: string,
  resourceType: string,
): string[] {
  const extracted = extractSubResources(":", resource);
  return extracted.resourceType === resourceType ? extracted.resourceIds : [];
}

export function extractARNPartsWithQualifiedSubResource<
  Key extends PropertyKey,
>(
  arnWithAccountId: ARN,
  resourceType: string,
  key: Key,
): Output<ARNParts & { [P in Key]: string }> {
  return extractARNPartsMap(arnWithAccountId, (parts) =>
    kv(key, extractQualifiedSubResource(parts.resource, resourceType)),
  );
}

export function extractARNPartsWithQualifiedSubResources<
  Key extends PropertyKey,
>(
  arnWithAccountId: ARN,
  resourceType: string,
  key: Key,
): Output<ARNParts & { [P in Key]: string[] }> {
  return extractARNPartsMap(arnWithAccountId, (parts) =>
    kv(key, extractQualifiedSubResources(parts.resource, resourceType)),
  );
}
