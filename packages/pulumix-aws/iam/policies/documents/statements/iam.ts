import * as aws from "@pulumi/aws";
import { arns, ARNs } from "base/index";
import * as conditions from "./conditions";
import * as resources from "./resources";
import * as statements from "./statements";

// These are from https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws_my-sec-creds-self-manage.html.

// Caution: These policies do not require MFA as they are intended to be used with denyAllExceptManageOwnWithoutMFA.
export class IAMAccessPatterns extends statements.AccessPatterns {
  inline: IAMInlineAccessPatterns;

  constructor() {
    super("IAM", "iam");
    this.inline = new IAMInlineAccessPatterns(this.name, this.prefix);
  }

  allowViewAccountInfo(allowListUsers?: boolean): aws.iam.PolicyStatement {
    const allowViewAccountInfoActions = [
      "iam:GetAccountPasswordPolicy",
      "iam:GetAccountSummary",
      "iam:ListVirtualMFADevices",
    ];
    if (allowListUsers) {
      allowViewAccountInfoActions.push("iam:ListUsers");
    }
    return statements.allowActions({
      Sid: "AllowViewAccountInfo",
      Action: allowViewAccountInfoActions,
      mfaPresent: false,
    });
  }

  allowManageOwnPasswords(
    allowChangePasswordViaConsole?: boolean
  ): aws.iam.PolicyStatement {
    const allowManageOwnPasswordsActions = [
      "iam:ChangePassword",
      "iam:GetUser",
    ];
    if (allowChangePasswordViaConsole) {
      allowManageOwnPasswordsActions.push(
        "iam:CreateLoginProfile",
        "iam:DeleteLoginProfile",
        "iam:GetLoginProfile",
        "iam:UpdateLoginProfile"
      );
    }
    return statements.allowResourceActions({
      Sid: "AllowManageOwnPasswords",
      Action: allowManageOwnPasswordsActions,
      Resource: resources.iam.ownUser,
      mfaPresent: false,
    });
  }

  allowManageOwnAccessKeys(): aws.iam.PolicyStatement {
    return statements.allowResourceActions({
      Sid: "AllowManageOwnAccessKeys",
      Action: [
        "iam:CreateAccessKey",
        "iam:DeleteAccessKey",
        "iam:ListAccessKeys",
        "iam:UpdateAccessKey",
      ],
      Resource: resources.iam.ownUser,
      mfaPresent: false,
    });
  }

  allowManageOwnSigningCertificates(): aws.iam.PolicyStatement {
    return statements.allowResourceActions({
      Sid: "AllowManageOwnSigningCertificates",
      Action: [
        "iam:DeleteSigningCertificate",
        "iam:ListSigningCertificates",
        "iam:UpdateSigningCertificate",
        "iam:UploadSigningCertificate",
      ],
      Resource: resources.iam.ownUser,
      mfaPresent: false,
    });
  }

  allowManageOwnSSHPublicKeys(): aws.iam.PolicyStatement {
    return statements.allowResourceActions({
      Sid: "AllowManageOwnSSHPublicKeys",
      Action: [
        "iam:DeleteSSHPublicKey",
        "iam:GetSSHPublicKey",
        "iam:ListSSHPublicKeys",
        "iam:UpdateSSHPublicKey",
        "iam:UploadSSHPublicKey",
      ],
      Resource: resources.iam.ownUser,
      mfaPresent: false,
    });
  }

  allowManageOwnGitCredentials(): aws.iam.PolicyStatement {
    return statements.allowResourceActions({
      Sid: "AllowManageOwnGitCredentials",
      Action: [
        "iam:CreateServiceSpecificCredential",
        "iam:DeleteServiceSpecificCredential",
        "iam:ListServiceSpecificCredentials",
        "iam:ResetServiceSpecificCredential",
        "iam:UpdateServiceSpecificCredential",
      ],
      Resource: resources.iam.ownUser,
      mfaPresent: false,
    });
  }

  allowManageOwnVirtualMFADevice(): aws.iam.PolicyStatement {
    return statements.allowResourceActions({
      Sid: "AllowManageOwnVirtualMFADevice",
      Action: ["iam:CreateVirtualMFADevice", "iam:DeleteVirtualMFADevice"],
      Resource: resources.iam.ownMFA,
      mfaPresent: false,
    });
  }

  allowManageOwnUserMFA(): aws.iam.PolicyStatement {
    return statements.allowResourceActions({
      Sid: "AllowManageOwnUserMFA",
      Action: [
        "iam:DeactivateMFADevice",
        "iam:EnableMFADevice",
        "iam:ListMFADevices",
        "iam:ResyncMFADevice",
      ],
      Resource: resources.iam.ownUser,
      mfaPresent: false,
    });
  }

  denyAllExceptManageOwnWithoutMFA(
    allowListUsers?: boolean
  ): aws.iam.PolicyStatement {
    const denyAllExceptListedWithoutMFAActions = [
      "iam:CreateVirtualMFADevice",
      "iam:EnableMFADevice",
      "iam:GetUser",
      "iam:ListMFADevices",
      "iam:ListVirtualMFADevices",
      "iam:ResyncMFADevice",
      "sts:GetSessionToken",
    ];
    if (allowListUsers) {
      denyAllExceptListedWithoutMFAActions.push("iam:ListUsers");
    }
    return statements.denyAllExceptActions({
      Sid: "DenyAllExceptManageOwnWithoutMFA",
      NotAction: denyAllExceptListedWithoutMFAActions,
      Condition: conditions.mfa.missing,
    });
  }

  assumeRole(roles: ARNs): aws.iam.PolicyStatement {
    return statements.allowResourceActions({
      Action: "sts:AssumeRole",
      Resource: arns(roles),
      // This doesn't have an MFA condition as it has to go on the role trust policy instead.
      mfaPresent: false,
    });
  }
}

export class IAMInlineAccessPatterns extends statements.InlineAccessPatterns {
  assumeRole(principal: statements.Principal): aws.iam.PolicyStatement {
    return statements.inlineAllowActions({
      Action: "sts:AssumeRole",
      Principal: principal,
    });
  }
}
