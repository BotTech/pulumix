import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as documents from "./documents";

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
