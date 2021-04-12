import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as documents from "./documents";
import * as iam from "./iam";

export function fullAccess(
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    "FullOrganizationsAccess",
    {
      description: "Allows full access to AWS Organizations.",
      policy: documents.organizations.fullAccess(),
    },
    opts
  );
}

export interface OrganizationAccountAccessArgs {
  id: pulumi.Input<string>;
  name: string;
}

export function assumeOrganizationAccountAccessRole(
  account: OrganizationAccountAccessArgs,
  opts?: pulumi.ComponentResourceOptions
): aws.iam.Policy {
  return iam.assumeRole(
    {
      role: {
        resourceName: "OrganizationAccountAccessRole",
        arn: pulumi.interpolate`arn:aws:iam::${account.id}:role/OrganizationAccountAccessRole`,
      },
      accountName: account.name,
    },
    opts
  );
}
