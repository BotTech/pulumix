// https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazons3.html#amazons3-resources-for-iam-policies

import { Output } from "@pulumi/pulumi";
import {
  ARN,
  parseARNWithFixedSubResource,
  parseARNWithNestedSubResource,
  parseARNWithResource,
  parseARNWithTypedNestedSubResource,
  parseARNWithTypedSubResource,
  interpolateARN,
  interpolateARNWithSubResource,
  WithPart,
} from "~/src/arns/index";
import { Inputs } from "@bottech/pulumix";

type Parts = {
  partition?: string;
  region: string;
  accountId: string;
};

type SubResourceParts<Part extends string> = WithPart<Parts, Part>;

type SubResourceArgs<Part extends string> = Inputs<SubResourceParts<Part>>;

type GlobalParts = {
  partition?: string;
  accountId: string;
};

type GlobalSubResourceParts<Part extends string> = WithPart<GlobalParts, Part>;

type GlobalSubResourceArgs<Part extends string> = Inputs<
  GlobalSubResourceParts<Part>
>;

type UniqueParts = {
  partition?: string;
};

type UniqueSubResourceParts<Part extends string> = WithPart<UniqueParts, Part>;

type UniqueSubResourceArgs<Part extends string> = Inputs<
  UniqueSubResourceParts<Part>
>;

const service = "s3";
const objectLambdaService = "s3-object-lambda";

export function interpolateAccessPointARN(
  args: SubResourceArgs<"accessPointName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "accesspoint",
    args.accessPointName,
  );
}

export function parseAccessPointARN(
  arn: ARN,
): Output<SubResourceParts<"accessPointName">> {
  return parseARNWithTypedSubResource(arn, "accesspoint", "accessPointName");
}

export function interpolateBucketARN(
  args: UniqueSubResourceArgs<"bucketName">,
): Output<string> {
  return interpolateARN({ ...args, service, resource: args.bucketName });
}

export function parseBucketARN(
  arn: ARN,
): Output<UniqueSubResourceParts<"bucketName">> {
  return parseARNWithResource(arn, "bucketName");
}

type ObjectParts = Parts & { bucketName: string; objectName: string };

type ObjectArgs = Inputs<ObjectParts>;

export function interpolateObjectARN(args: ObjectArgs): Output<string> {
  return interpolateARNWithSubResource(
    {
      ...args,
      service,
    },
    args.bucketName,
    args.objectName,
  );
}

export function parseObjectARN(arn: ARN): Output<ObjectParts> {
  return parseARNWithNestedSubResource(arn, "bucketName", "objectName");
}

export function interpolateJobARN(
  args: SubResourceArgs<"jobId">,
): Output<string> {
  return interpolateARNWithSubResource({ ...args, service }, "job", args.jobId);
}

export function parseJobARN(arn: ARN): Output<SubResourceParts<"jobId">> {
  return parseARNWithTypedSubResource(arn, "job", "jobId");
}

export function interpolatEstorageLensConfigurationARN(
  args: SubResourceArgs<"configId">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "storage-lens",
    args.configId,
  );
}

export function parseStorageLensConfigurationARN(
  arn: ARN,
): Output<SubResourceParts<"configId">> {
  return parseARNWithTypedSubResource(arn, "storage-lens", "configId");
}

export function interpolateStorageLensGroupARN(
  args: SubResourceArgs<"groupName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "storage-lens-group",
    args.groupName,
  );
}

export function parseStorageLensGroupARN(
  arn: ARN,
): Output<SubResourceParts<"groupName">> {
  return parseARNWithTypedSubResource(arn, "storage-lens-group", "groupName");
}

export function interpolateObjectLambdaAccessPointARN(
  args: SubResourceArgs<"accessPointName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service: objectLambdaService },
    "accesspoint",
    args.accessPointName,
  );
}

export function parseObjectLambdaAccessPointARN(
  arn: ARN,
): Output<SubResourceParts<"accessPointName">> {
  return parseARNWithTypedSubResource(arn, "accesspoint", "accessPointName");
}

export function interpolateMultiRegionAccessPointARN(
  args: GlobalSubResourceArgs<"accessPointAlias">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "accesspoint",
    args.accessPointAlias,
  );
}

export function parseMultiRegionAccessPointARN(
  arn: ARN,
): Output<GlobalSubResourceParts<"accessPointAlias">> {
  return parseARNWithTypedSubResource(arn, "accesspoint", "accessPointAlias");
}

export function interpolateMultiRegionAccessPointRequestARNARN(
  args: GlobalSubResourceArgs<"operation" | "token">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service, region: "us-west-2" },
    "async-request",
    "mrap",
    args.operation,
    args.token,
  );
}

export function parseMultiRegionAccessPointRequestARNARN(
  arn: ARN,
): Output<GlobalSubResourceParts<"operation" | "token">> {
  return parseARNWithTypedNestedSubResource(
    arn,
    ["async-request", "mrap"],
    "operation",
    "token",
  );
}

export function interpolateAccessGrantsInstanceARN(
  args: SubResourceArgs<never>,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "access-grants",
    "default",
  );
}

export function parseAccessGrantsInstanceARN(
  arn: ARN,
): Output<SubResourceParts<never>> {
  return parseARNWithFixedSubResource(arn, ["access-grants", "default"]);
}

export function interpolateAccessGrantsLocationARN(
  args: SubResourceArgs<"token">,
): Output<string> {
  return interpolateARNWithSubResource(
    {
      ...args,
      service,
    },
    "access-grants",
    "default",
    "location",
    args.token,
  );
}

export function parseAccessGrantsLocationARN(
  arn: ARN,
): Output<SubResourceParts<"token">> {
  return parseARNWithTypedSubResource(
    arn,
    ["access-grants", "default", "location"],
    "token",
  );
}

export function interpolateAccessGrantARN(
  args: SubResourceArgs<"token">,
): Output<string> {
  return interpolateARNWithSubResource(
    {
      ...args,
      service,
    },
    "access-grants",
    "default",
    "grant",
    args.token,
  );
}

export function parseAccessGrantARN(
  arn: ARN,
): Output<SubResourceParts<"token">> {
  return parseARNWithTypedSubResource(
    arn,
    ["access-grants", "default", "grant"],
    "token",
  );
}
