import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as statements from "./statements";

export function assumeRole(roleArn: Input<string>): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [statements.iam.assumeRole(roleArn)],
  };
}

export interface EnforceMFAArgs {
  allowListUsers?: boolean;
  allowChangePassword?: boolean;
}

export function enforceMFA(args: EnforceMFAArgs): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      statements.iam.allowViewAccountInfo(args.allowListUsers),
      statements.iam.allowManageOwnPasswords(args.allowChangePassword),
      statements.iam.allowManageOwnAccessKeys(),
      statements.iam.allowManageOwnSigningCertificates(),
      statements.iam.allowManageOwnSSHPublicKeys(),
      statements.iam.allowManageOwnGitCredentials(),
      statements.iam.allowManageOwnVirtualMFADevice(),
      statements.iam.allowManageOwnUserMFA(),
      statements.iam.denyAllExceptManageOwnWithoutMFA(args.allowListUsers),
    ],
  };
}

export function fullAccess(
  args?: statements.AccessPatternArgs
): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [statements.iam.fullAccess(args)],
  };
}

// Inline documents.

function serviceAssumeRole(service: Input<string>): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      statements.iam.inline.assumeRole({
        Service: service,
      }),
    ],
  };
}

function accountAssumeRole(accountId: Input<string>): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      statements.iam.inline.assumeRole({
        AWS: pulumi.interpolate`arn:aws:iam::${accountId}:root`,
      }),
    ],
  };
}

export const inline = {
  serviceAssumeRole: serviceAssumeRole,
  accountAssumeRole: accountAssumeRole,
};
