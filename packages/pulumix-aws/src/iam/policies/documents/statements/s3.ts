import * as aws from "@pulumi/aws";
import * as statements from "./statements";
import { AccessPatternArgs, allowResourceActions } from "./statements";
import { Input } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";

type BucketArgs = {
  bucket: Input<string>;
};

type BucketPrefixArgs = {
  bucketPrefix: Input<string>;
};

export type CreateBucketArgs = (BucketArgs | BucketPrefixArgs) &
  AccessPatternArgs;

export function bucketName(args: CreateBucketArgs): Input<string> {
  return "bucket" in args
    ? args.bucket
    : pulumi.interpolate`${args.bucketPrefix}*`;
}

class S3AccessPatterns extends statements.AccessPatterns {
  constructor() {
    super("S3", "s3");
  }

  createBucket(args: CreateBucketArgs): aws.iam.PolicyStatement {
    return allowResourceActions({
      Sid: "CreateBucketAccess",
      Action: ["s3:CreateBucket", "s3:PutBucketTagging"],
      Resource: bucketName(args),
      mfaPresent: args.mfaPresent,
    });
  }
}

export const { readOnlyAccess, fullAccess, createBucket } =
  new S3AccessPatterns();
