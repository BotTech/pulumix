// https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazons3.html#amazons3-resources-for-iam-policies

import { Input } from "@pulumi/pulumi";

import {
  ARNServiceArgs,
  ARNServiceArgsNoRegion,
  ARNServiceArgsNoRegionOrAccountId,
  interpolateARN,
  interpolateResourceType,
} from "~/src";

export function accessPoint(
  args: ARNServiceArgs & { accessPointName: Input<string> },
) {
  const resource = interpolateResourceType("accesspoint", args.accessPointName);
  return interpolateARN({ ...args, service: "s3", resource });
}

export function bucket(
  args: ARNServiceArgsNoRegionOrAccountId & { bucketName: Input<string> },
) {
  return interpolateARN({ ...args, service: "s3", resource: args.bucketName });
}

export function object(
  args: ARNServiceArgsNoRegionOrAccountId & {
    bucketName: Input<string>;
    objectName: Input<string>;
  },
) {
  const resource = interpolateResourceType(args.bucketName, args.objectName);
  return interpolateARN({ ...args, service: "s3", resource });
}

export function job(args: ARNServiceArgs & { jobId: Input<string> }) {
  const resource = interpolateResourceType("job", args.jobId);
  return interpolateARN({ ...args, service: "s3", resource });
}

export function storageLensConfiguration(
  args: ARNServiceArgs & { configId: Input<string> },
) {
  const resource = interpolateResourceType("storage-lens", args.configId);
  return interpolateARN({ ...args, service: "s3", resource });
}

export function objectLambdaAccessPoint(
  args: ARNServiceArgs & { accessPointName: Input<string> },
) {
  const resource = interpolateResourceType("accesspoint", args.accessPointName);
  return interpolateARN({ ...args, service: "s3-object-lambda", resource });
}

export function multiRegionAccessPoint(
  args: ARNServiceArgsNoRegion & { accessPointAlias: Input<string> },
) {
  const resource = interpolateResourceType(
    "accesspoint",
    args.accessPointAlias,
  );
  return interpolateARN({ ...args, service: "s3", resource });
}

export function multiRegionAccessPointRequestARN(
  args: ARNServiceArgsNoRegion & {
    operation: Input<string>;
    token: Input<string>;
  },
) {
  const resource = interpolateResourceType(
    "async-request",
    "mrap",
    args.operation,
    args.token,
  );
  return interpolateARN({
    ...args,
    service: "s3",
    region: "us-west-2",
    resource,
  });
}
