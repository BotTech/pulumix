import * as pulumi from "@pulumi/pulumi";
import { all, Input, output, Output, Resource } from "@pulumi/pulumi";
import { inputPropertyOrElse } from "@bottech/pulumix";

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

export type ARNParts = {
  partition: Output<string>;
  service: Output<string>;
  region: Output<string>;
  accountId: Output<string>;
  resource: Output<string>;
};

export function extractARNParts(arnWithAccountId: ARN): Output<ARNParts> {
  return arn(arnWithAccountId).apply((arn) => {
    const parts = arn.split(":", 6).map((s) => output<string>(s));
    const empty = output("");
    return {
      partition: parts[1] ?? empty,
      service: parts[2] ?? empty,
      region: parts[3] ?? empty,
      accountId: parts[4] ?? empty,
      resource: parts[5] ?? empty,
    };
  });
}

export function extractARNAccountId(arnWithAccountId: ARN): Output<string> {
  return extractARNParts(arnWithAccountId).apply((parts) => parts.accountId);
}
