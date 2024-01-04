// https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazons3.html#amazons3-resources-for-iam-policies

import { Output } from "@pulumi/pulumi";
import {
  ARN,
  extractARNPartsWithFixedSubResource,
  extractARNPartsWithNestedSubResource,
  extractARNPartsWithResource,
  extractARNPartsWithTypedNestedSubResource,
  extractARNPartsWithTypedSubResource,
  interpolateARN,
  interpolateARNWithSubResource,
  WithPart,
} from "~/src/arns/index";
import { Inputs } from "@bottech/pulumix";

type Parts = {
  partition: string;
  region: string;
  accountId: string;
};

type SubResourceParts<Part extends string> = WithPart<Parts, Part>;

type SubResourceArgs<Part extends string> = Inputs<SubResourceParts<Part>>;

type GlobalParts = {
  partition: string;
  accountId: string;
};

type GlobalSubResourceParts<Part extends string> = WithPart<GlobalParts, Part>;

type GlobalSubResourceArgs<Part extends string> = Inputs<
  GlobalSubResourceParts<Part>
>;

type UniqueParts = {
  partition: string;
};

type UniqueSubResourceParts<Part extends string> = WithPart<UniqueParts, Part>;

type UniqueSubResourceArgs<Part extends string> = Inputs<
  UniqueSubResourceParts<Part>
>;

const service = "s3";
const objectLambdaService = "s3-object-lambda";

export function accessPoint(
  args: SubResourceArgs<"accessPointName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "accesspoint",
    args.accessPointName,
  );
}

export function extractAccessPoint(
  arn: ARN,
): Output<SubResourceParts<"accessPointName">> {
  return extractARNPartsWithTypedSubResource(
    arn,
    "accesspoint",
    "accessPointName",
  );
}

export function bucket(
  args: UniqueSubResourceArgs<"bucketName">,
): Output<string> {
  return interpolateARN({ ...args, service, resource: args.bucketName });
}

export function extractBucket(
  arn: ARN,
): Output<UniqueSubResourceParts<"bucketName">> {
  return extractARNPartsWithResource(arn, "bucketName");
}

type ObjectParts = Parts & { bucketName: string; objectName: string };

type ObjectArgs = Inputs<ObjectParts>;

export function object(args: ObjectArgs) {
  return interpolateARNWithSubResource(
    {
      ...args,
      service,
    },
    args.bucketName,
    args.objectName,
  );
}

export function extractObject(arn: ARN): Output<ObjectParts> {
  return extractARNPartsWithNestedSubResource(arn, "bucketName", "objectName");
}

export function job(args: SubResourceArgs<"jobId">): Output<string> {
  return interpolateARNWithSubResource({ ...args, service }, "job", args.jobId);
}

export function extractJob(arn: ARN): Output<SubResourceParts<"jobId">> {
  return extractARNPartsWithTypedSubResource(arn, "job", "jobId");
}

export function storageLensConfiguration(
  args: SubResourceArgs<"configId">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "storage-lens",
    args.configId,
  );
}

export function extractStorageLensConfiguration(
  arn: ARN,
): Output<SubResourceParts<"configId">> {
  return extractARNPartsWithTypedSubResource(arn, "storage-lens", "configId");
}

export function storageLensGroup(
  args: SubResourceArgs<"groupName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "storage-lens-group",
    args.groupName,
  );
}

export function extractStorageLensGroup(
  arn: ARN,
): Output<SubResourceParts<"groupName">> {
  return extractARNPartsWithTypedSubResource(
    arn,
    "storage-lens-group",
    "groupName",
  );
}

export function objectLambdaAccessPoint(
  args: SubResourceArgs<"accessPointName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service: objectLambdaService },
    "accesspoint",
    args.accessPointName,
  );
}

export function extractObjectLambdaAccessPoint(
  arn: ARN,
): Output<SubResourceParts<"accessPointName">> {
  return extractARNPartsWithTypedSubResource(
    arn,
    "accesspoint",
    "accessPointName",
  );
}

export function multiRegionAccessPoint(
  args: GlobalSubResourceArgs<"accessPointAlias">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "accesspoint",
    args.accessPointAlias,
  );
}

export function extractMultiRegionAccessPoint(
  arn: ARN,
): Output<GlobalSubResourceParts<"accessPointAlias">> {
  return extractARNPartsWithTypedSubResource(
    arn,
    "accesspoint",
    "accessPointAlias",
  );
}

export function multiRegionAccessPointRequestARN(
  args: GlobalSubResourceArgs<"operation" | "token">,
) {
  return interpolateARNWithSubResource(
    { ...args, service, region: "us-west-2" },
    "async-request",
    "mrap",
    args.operation,
    args.token,
  );
}

export function extractMultiRegionAccessPointRequestARN(
  arn: ARN,
): Output<GlobalSubResourceParts<"operation" | "token">> {
  return extractARNPartsWithTypedNestedSubResource(
    arn,
    ["async-request", "mrap"],
    "operation",
    "token",
  );
}

export function accessGrantsInstance(
  args: SubResourceArgs<never>,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "access-grants",
    "default",
  );
}

export function extractAccessGrantsInstance(
  arn: ARN,
): Output<SubResourceParts<never>> {
  return extractARNPartsWithFixedSubResource(arn, ["access-grants", "default"]);
}

export function accessGrantsLocation(
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

export function extractAccessGrantsLocation(
  arn: ARN,
): Output<SubResourceParts<"token">> {
  return extractARNPartsWithTypedSubResource(
    arn,
    ["access-grants", "default", "location"],
    "token",
  );
}

export function accessGrant(args: SubResourceArgs<"token">): Output<string> {
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

export function extractAccessGrant(
  arn: ARN,
): Output<SubResourceParts<"token">> {
  return extractARNPartsWithTypedSubResource(
    arn,
    ["access-grants", "default", "grant"],
    "token",
  );
}
