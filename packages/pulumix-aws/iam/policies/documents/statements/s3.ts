import * as aws from "@pulumi/aws";
import * as statements from "./statements";
import { AccessPatternArgs, allowResourceActions } from "./statements";

type BucketArgs = Pick<aws.s3.BucketV2, "bucket">;
type BucketPrefixArgs = Pick<aws.s3.BucketV2, "bucketPrefix">;

export type CreateBucketArgs = (BucketArgs | BucketPrefixArgs) &
  AccessPatternArgs;

class S3AccessPatterns extends statements.AccessPatterns {
  constructor() {
    super("S3", "s3");
  }

  createBucket(args: CreateBucketArgs): aws.iam.PolicyStatement {
    const resource = "bucket" in args ? args.bucket : `${args.bucketPrefix}*`;
    return allowResourceActions({
      Sid: "CreateBucketAccess",
      Action: ["s3:CreateBucket", "s3:PutBucketTagging"],
      Resource: resource,
      mfaPresent: args.mfaPresent,
    });
  }
}

export const { readOnlyAccess, fullAccess, createBucket } =
  new S3AccessPatterns();
