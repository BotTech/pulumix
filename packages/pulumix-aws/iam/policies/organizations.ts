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
  name: pulumi.Input<string>;
}

export function assumeOrganizationAccountAccessRole(
  account: OrganizationAccountAccessArgs,
  opts?: pulumi.ComponentResourceOptions
): aws.iam.Policy {
  const roleName = "OrganizationAccountAccessRole";
  const roleArn = `arn:aws:iam::${account.id}:role/OrganizationAccountAccessRole`;
  return iam.assumeRole(
    roleName,
    { roleArn: roleArn, accountName: account.name },
    opts
  );
}
