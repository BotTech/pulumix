import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as statements from "./statements";

// Inline documents.

function accountGrantServiceAccess(
  accountId: Input<string>
): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      statements.kms.inline.grantServiceAccess({
        AWS: pulumi.interpolate`arn:aws:iam::${accountId}:root`,
      }),
    ],
  };
}

export const inline = {
  accountGrantServiceAccess: accountGrantServiceAccess,
};
