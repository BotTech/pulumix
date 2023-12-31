// https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazons3.html#amazons3-resources-for-iam-policies

import { Output } from "@pulumi/pulumi";
import {
  interpolateARN,
  interpolateARNWithResourceType,
  interpolateResourceType,
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
  return interpolateARNWithResourceType(
    { ...args, service },
    "accesspoint",
    args.accessPointName,
  );
}

export function bucket(
  args: UniqueSubResourceArgs<"bucketName">,
): Output<string> {
  return interpolateARN({ ...args, service, resource: args.bucketName });
}

type ObjectParts = Parts & { bucketName: string; objectName: string };

type ObjectArgs = Inputs<ObjectParts>;

export function object(args: ObjectArgs) {
  return interpolateARNWithResourceType(
    {
      ...args,
      service,
    },
    args.bucketName,
    args.objectName,
  );
}

export function job(args: SubResourceArgs<"jobId">): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "job",
    args.jobId,
  );
}

export function storageLensConfiguration(
  args: SubResourceArgs<"configId">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "storage-lens",
    args.configId,
  );
}

export function storageLensGroup(
  args: SubResourceArgs<"groupName">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "storage-lens-group",
    args.groupName,
  );
}

export function objectLambdaAccessPoint(
  args: SubResourceArgs<"accessPointName">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service: objectLambdaService },
    "accesspoint",
    args.accessPointName,
  );
}

export function multiRegionAccessPoint(
  args: GlobalSubResourceArgs<"accessPointAlias">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "accesspoint",
    args.accessPointAlias,
  );
}

export function multiRegionAccessPointRequestARN(
  args: GlobalSubResourceArgs<"operation" | "token">,
) {
  const resource = interpolateResourceType(
    "async-request",
    "mrap",
    args.operation,
    args.token,
  );
  return interpolateARN({
    ...args,
    service,
    region: "us-west-2",
    resource,
  });
}

export function accessGrantsInstance(
  args: SubResourceArgs<never>,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "access-grants",
    "default",
  );
}

export function accessGrantsLocation(
  args: SubResourceArgs<"token">,
): Output<string> {
  const resource = interpolateResourceType(
    "access-grants",
    "default",
    "location",
    args.token,
  );
  return interpolateARN({
    ...args,
    service,
    resource,
  });
}

export function accessGrant(args: SubResourceArgs<"token">): Output<string> {
  const resource = interpolateResourceType(
    "access-grants",
    "default",
    "grant",
    args.token,
  );
  return interpolateARN({
    ...args,
    service,
    resource,
  });
}
