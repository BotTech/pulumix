import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as documents from "./documents";

export function fullAccess(
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    "KMSFullAccess",
    {
      description: "Allows full access to KMS.",
      policy: documents.kms.fullAccess(),
    },
    opts
  );
}
