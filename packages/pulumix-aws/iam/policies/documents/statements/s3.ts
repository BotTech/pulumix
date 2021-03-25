import * as aws from "@pulumi/aws";
import * as conditions from "./conditions";
import * as statements from "./statements";

// These are from https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html#key-policy-default

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

function userSymmetricKeyAccessAllowActionsArgs() {
  return {
    Sid: "UserSymmetricKeyAccess",
    Action: [
      "kms:Decrypt",
      "kms:DescribeKey",
      "kms:Encrypt",
      "kms:GenerateDataKey*",
      "kms:ReEncrypt*",
    ],
  };
}

function userAsymmetricKeyEncryptionAccessAllowActionsArgs() {
  return {
    Sid: "UserAsymmetricKeyEncryptionAccess",
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
    this.inline = new KMSInlineAccessPatterns();
  }

  adminAccess(): aws.iam.PolicyStatement {
    return statements.allowActions(adminAccessAllowActionsArgs());
  }

  userSymmetricKeyAccess(): aws.iam.PolicyStatement {
    return statements.allowActions(userSymmetricKeyAccessAllowActionsArgs());
  }

  userAsymmetricKeyEncryptionAccess(): aws.iam.PolicyStatement {
    return statements.allowActions(
      userAsymmetricKeyEncryptionAccessAllowActionsArgs()
    );
  }

  userAsymmetricKeySignAndVerifyAccess(): aws.iam.PolicyStatement {
    return statements.allowActions(
      userAsymmetricKeySignAndVerifyAccessAllowActionsArgs()
    );
  }

  grantServiceAccess(): aws.iam.PolicyStatement {
    return statements.allowActions(grantServiceAccessAllowActionsArgs());
  }
}

export class KMSInlineAccessPatterns {
  grantServiceAccess(Principal: statements.Principal): aws.iam.PolicyStatement {
    return statements.inlineAllowActions({
      ...grantServiceAccessAllowActionsArgs(),
      Principal: Principal,
    });
  }
}
