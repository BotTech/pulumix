import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as statements from "./statements";

export function fullAccess(
  args?: statements.AccessPatternArgs
): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [statements.kms.fullAccess(args)],
  };
}

// Inline documents.

function accountGrantServiceAccess(
  accountId: pulumi.Input<string>
): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [
      statements.kms.inline.grantServiceAccess(
        statements.principals.rootUser(accountId)
      ),
    ],
  };
}

export interface KeyAccessArgs {
  accountId: pulumi.Input<string>;
  administrators?: pulumi.Input<string>[];
  users?: pulumi.Input<string>[];
}

function keyAccess(args: KeyAccessArgs): aws.iam.PolicyDocument {
  const statement = [statements.kms.inline.rootAccess(args.accountId)];
  if (args.users && args.users.length > 0) {
    statement.push(statements.kms.inline.userAccess(args.users));
  }
  if (args.administrators && args.administrators.length > 0) {
    statement.push(
      statements.kms.inline.administratorAccess(args.administrators)
    );
  }
  return {
    Version: "2012-10-17",
    Statement: statement,
  };
}

export const inline = {
  // TODO: Should this be here or be a part of the keyAccess?
  accountGrantServiceAccess: accountGrantServiceAccess,
  keyAccess: keyAccess,
};
