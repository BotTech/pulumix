import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as documents from "./documents";
import {
  bucketName,
  CreateBucketArgs,
} from "@src/iam/policies/documents/statements/s3";

export function fullAccess(
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    "S3FullAccess",
    {
      description: "Allows full access to S3.",
      policy: documents.s3.fullAccess(),
    },
    opts
  );
}

export function createBucket(
  name: string,
  args: CreateBucketArgs,
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    name,
    {
      description: pulumi.interpolate`Allows access to create the bucket ${bucketName(
        args
      )}`,
      policy: documents.s3.createBucket(args),
    },
    opts
  );
}
