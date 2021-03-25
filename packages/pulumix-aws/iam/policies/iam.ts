import { CustomResourceOptions, Input } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as documents from "./documents";

export interface AssumeRoleArgs {
  roleArn: Input<string>;
  accountName?: Input<string>;
}

export function assumeRole(
  roleName: string,
  args: AssumeRoleArgs,
  opts?: CustomResourceOptions
): aws.iam.Policy {
  const accountSuffix = args.accountName
    ? ` in the ${args.accountName} account`
    : "";
  const description = `Allows access to assume the ${roleName} role${accountSuffix}.`;
  return new aws.iam.Policy(
    `Assume${args.accountName ?? ""}${roleName}`,
    {
      description: description,
      policy: documents.iam.assumeRole(args.roleArn),
    },
    opts
  );
}

export type EnforceMFAArgs = documents.iam.EnforceMFAArgs;

// This policy is from https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws_my-sec-creds-self-manage.html.
export function enforceMFA(
  args: EnforceMFAArgs,
  opts?: CustomResourceOptions
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

export function fullAccess(opts?: CustomResourceOptions): aws.iam.Policy {
  return new aws.iam.Policy(
    "FullIAMAccess",
    {
      description: "Allows full access to IAM.",
      policy: documents.iam.fullAccess(),
    },
    opts
  );
}
