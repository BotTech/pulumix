import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { ARN, AWSResourceNames, awsResourceNames } from "../../types";
import * as documents from "./documents";
import { resourceName, ResourceName } from "@bottech/pulumix";

export type AssumeRoleArgs = AssumeSingleRoleArgs | AssumeMultipleRolesArgs;

export interface AssumeSingleRoleArgs {
  role: AWSResourceNames;
  accountName?: ResourceName;
}

function isAssumeSingleRoleArgs(
  args: AssumeRoleArgs
): args is AssumeSingleRoleArgs {
  return "role" in args;
}

export interface AssumeMultipleRolesArgs {
  name: string;
  roles: pulumi.Input<ARN[]>;
  accountName?: ResourceName;
}

export function assumeRole(
  args: AssumeRoleArgs,
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  const accountName = resourceName(args.accountName ?? "");
  const accountSuffix = accountName ? ` in the ${accountName} account` : "";
  if (isAssumeSingleRoleArgs(args)) {
    const roleNames = awsResourceNames(args.role);
    const description = `Allows access to assume the ${roleNames.resourceName} role${accountSuffix}.`;
    return new aws.iam.Policy(
      `AssumeRole${accountName}${roleNames.resourceName}`,
      {
        description: description,
        policy: documents.iam.assumeRole(roleNames.arn),
      },
      opts
    );
  } else {
    const description = `Allows access to assume the ${args.name} roles${accountSuffix}.`;
    return new aws.iam.Policy(
      `AssumeRoles${accountName}${args.name}`,
      {
        description: description,
        policy: documents.iam.assumeRole(args.roles),
      },
      opts
    );
  }
}

export type EnforceMFAArgs = documents.iam.EnforceMFAArgs;

// TODO: This shouldn't be called enforceMFA as it is actually allowing actions not just enforcing MFA.
// This policy is from https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws_my-sec-creds-self-manage.html.
export function enforceMFA(
  args: EnforceMFAArgs,
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    "EnforceMFA",
    {
      description:
        "Allows users to manage their own passwords and MFA devices but nothing else unless they authenticate with MFA.",
      policy: documents.iam.enforceMFA(args),
    },
    opts
  );
}

export function fullAccess(
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    "IAMFullAccess",
    {
      description: "Allows full access to IAM.",
      policy: documents.iam.fullAccess(),
    },
    opts
  );
}
