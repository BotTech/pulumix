import { toSet } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { principals } from ".";
import * as conditions from "./conditions";
import * as statements from "./statements";

// These should only be used inline as they are not safe to use with all resources ("Resource": "*").
// These are from https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html#key-policy-default.

function adminAccessAllowActionsArgs() {
  return {
    Sid: "AdminAccess",
    Action: [
      "kms:Create*",
      "kms:Describe*",
      "kms:Enable*",
      "kms:List*",
      "kms:Put*",
      "kms:Update*",
      "kms:Revoke*",
      "kms:Disable*",
      "kms:Get*",
      "kms:Delete*",
      "kms:TagResource",
      "kms:UntagResource",
      "kms:ScheduleKeyDeletion",
      "kms:CancelKeyDeletion",
    ],
  };
}

function userSymmetricKeyEncryptAndDecryptAccessAllowActionsArgs() {
  return {
    Sid: "UserSymmetricKeyEncryptAndDecryptAccess",
    Action: [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ],
  };
}

function userAsymmetricKeyEncryptAndDecryptAccessAllowActionsArgs() {
  return {
    Sid: "UserAsymmetricKeyEncryptAndDecryptAccess",
    Action: [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:DescribeKey",
      "kms:GetPublicKey",
    ],
  };
}

function userAsymmetricKeySignAndVerifyAccessAllowActionsArgs() {
  return {
    Sid: "UserAsymmetricKeySignAndVerifyAccess",
    Action: ["kms:DescribeKey", "kms:GetPublicKey", "kms:Sign", "kms:Verify"],
  };
}

function userKeyAccessAllowActionsArgs() {
  return {
    Sid: "UserKeyAccess",
    Action: toSet(
      userSymmetricKeyEncryptAndDecryptAccessAllowActionsArgs().Action.concat(
        userAsymmetricKeyEncryptAndDecryptAccessAllowActionsArgs().Action,
        userAsymmetricKeySignAndVerifyAccessAllowActionsArgs().Action
      )
    ),
  };
}

function grantServiceAccessAllowActionsArgs() {
  return {
    Sid: "GrantServiceAccess",
    Action: ["kms:CreateGrant", "kms:ListGrants", "kms:RevokeGrant"],
    Condition: conditions.kms.grantIsForAWSResource,
  };
}

export class KMSAccessPatterns extends statements.AccessPatterns {
  inline: KMSInlineAccessPatterns;

  constructor() {
    super("KMS", "kms");
    this.inline = new KMSInlineAccessPatterns(this.name, this.prefix);
  }
}

export class KMSInlineAccessPatterns extends statements.InlineAccessPatterns {
  grantServiceAccess(Principal: statements.Principal): aws.iam.PolicyStatement {
    return statements.inlineAllowActions({
      ...grantServiceAccessAllowActionsArgs(),
      Principal: Principal,
    });
  }

  rootAccess(accountId: pulumi.Input<string>): aws.iam.PolicyStatement {
    return this.fullAccess({
      Principal: principals.rootAccount(accountId),
    });
  }

  administratorAccess(
    administrators: pulumi.Input<string>[]
  ): aws.iam.PolicyStatement {
    return statements.inlineAllowActions({
      ...adminAccessAllowActionsArgs(),
      Principal: principals.awsPrincipals(administrators),
    });
  }

  userAccess(users: pulumi.Input<string>[]): aws.iam.PolicyStatement {
    return statements.inlineAllowActions({
      ...userKeyAccessAllowActionsArgs(),
      Principal: principals.awsPrincipals(users),
    });
  }
}
