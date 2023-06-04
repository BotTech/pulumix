import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { kms, s3 } from ".";
import { AWSIdentifiedResourceNames, id } from "@src/types";
import * as documents from "./documents";
import * as iam from "./iam";

export function fullAccess(
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    "OrganizationsFullAccess",
    {
      description: "Allows full access to AWS Organizations.",
      policy: documents.organizations.fullAccess(),
    },
    opts
  );
}

export function assumeOrganizationAccountAccessRole(
  account: AWSIdentifiedResourceNames | AWSIdentifiedResourceNames[],
  opts?: pulumi.ComponentResourceOptions
): aws.iam.Policy {
  if (Array.isArray(account)) {
    const roles = account.map((acc) => {
      const accountId = id(acc);
      return pulumi.interpolate`arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`;
    });
    return iam.assumeRole(
      {
        name: "OrganizationAccountAccessRole",
        roles: roles,
      },
      opts
    );
  } else {
    const accountId = id(account);
    return iam.assumeRole(
      {
        role: {
          resourceName: "OrganizationAccountAccessRole",
          arn: pulumi.interpolate`arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
        },
        accountName: account,
      },
      opts
    );
  }
}

export function administratorPolicies(
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy[] {
  return [
    fullAccess(opts),
    iam.fullAccess(opts),
    kms.fullAccess(opts),
    s3.fullAccess(opts),
  ];
}
