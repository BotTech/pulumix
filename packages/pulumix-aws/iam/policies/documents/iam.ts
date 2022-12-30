import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi";
import { ARNs } from "../../../types";
import * as statements from "./statements";

export function assumeRole(roleArns: ARNs): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [statements.iam.assumeRole(roleArns)],
  };
}

export interface EnforceMFAChangePasswordArgs {
  allowListUsers: true;
  allowChangePasswordViaConsole?: boolean;
}

export interface EnforceMFANoChangePasswordArgs {
  allowListUsers?: false;
}

export type EnforceMFAArgs =
  | EnforceMFAChangePasswordArgs
  | EnforceMFANoChangePasswordArgs;

// TODO: This shouldn't be called enforceMFA as it is actually allowing actions not just enforcing MFA.
export function enforceMFA(args: EnforceMFAArgs): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      statements.iam.allowViewAccountInfo(args.allowListUsers),
      statements.iam.allowManageOwnPasswords(
        args.allowListUsers && args.allowChangePasswordViaConsole
      ),
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
