import * as aws from "@pulumi/aws";
import * as statements from "./statements";
import { AccessPatternArgs, allowResourceActions } from "./statements";
import { Input } from "@pulumi/pulumi";
import * as pulumi from "@pulumi/pulumi";
import { ARN } from "~/src";
import { arn } from "~/src/arns";

type BucketArgs = {
  /**
   * Use pulumixAWS.resources.s3.bucket
   */
  bucketArn: ARN;
};

type BucketPrefixArgs = {
  bucketArnPrefix: Input<string>;
};

export type CreateBucketArgs = (BucketArgs | BucketPrefixArgs) &
  AccessPatternArgs;

export function bucketResource(args: CreateBucketArgs): Input<string> {
  return "bucketArn" in args
    ? arn(args.bucketArn)
    : pulumi.interpolate`${args.bucketArnPrefix}*`;
}

class S3AccessPatterns extends statements.AccessPatterns {
  constructor() {
    super("S3", "s3");
  }

  createBucket(args: CreateBucketArgs): aws.iam.PolicyStatement {
    return allowResourceActions({
      Sid: "CreateBucketAccess",
      Action: ["s3:CreateBucket", "s3:PutBucketTagging"],
      Resource: bucketResource(args),
      mfaPresent: args.mfaPresent,
    });
  }
}

const dest = new S3AccessPatterns();

export const readOnlyAccess: (args?: AccessPatternArgs) => aws.iam.PolicyStatement = dest.readOnlyAccess;
export const fullAccess: (args?: AccessPatternArgs) => aws.iam.PolicyStatement = dest.fullAccess;
export const createBucket: (args: CreateBucketArgs) => aws.iam.PolicyStatement = dest.createBucket;
