// https://docs.aws.amazon.com/service-authorization/latest/reference/list_awsidentityandaccessmanagementiam.html#awsidentityandaccessmanagementiam-resources-for-iam-policies

import { Input, Output } from "@pulumi/pulumi";
import { ARN } from "~/src";

import {
  ARNPartsNoRegion,
  ARNServiceArgsNoRegion,
  extractARNPartsWithResourceType,
  extractARNPartsWithSubResourceTypes,
  interpolateARN,
  interpolateResourceType,
} from "~/src/arns";

// TODO: This should ideally be a function that takes a partition.
export const ownMFA = "arn:aws:iam::*:mfa/${aws:username}";

// TODO: This should ideally be a function that takes a partition.
export const ownUser = "arn:aws:iam::*:user/${aws:username}";

export function accessReport(
  args: ARNServiceArgsNoRegion & { entityPath: Input<string> },
) {
  const resource = interpolateResourceType("access-report", args.entityPath);
  return interpolateARN({ ...args, service: "iam", resource });
}

export function extractAccessReport(
  arn: ARN,
): Output<ARNPartsNoRegion & { entityPath: string }> {
  return extractARNPartsWithResourceType(arn, "access-report", "entityPath");
}

export function assumedRole(
  args: ARNServiceArgsNoRegion & {
    roleName: Input<string>;
    roleSessionName: Input<string>;
  },
) {
  const resource = interpolateResourceType(
    "assumed-role",
    args.roleName,
    args.roleSessionName,
  );
  return interpolateARN({ ...args, service: "iam", resource });
}

export function extractAssumedRole(arn: ARN): Output<
  ARNPartsNoRegion & {
    roleName: string;
    roleSessionName: string;
  }
> {
  return extractARNPartsWithSubResourceTypes(arn, "assumed-role", "role").apply(
    (parts) => {
      return {
        ...parts,
        roleName: parts.role[0] ?? "",
        roleSessionName: parts.role[1] ?? "",
      };
    },
  );
}

export function federatedUser(
  args: ARNServiceArgsNoRegion & { userName: Input<string> },
) {
  const resource = interpolateResourceType("federated-user", args.userName);
  return interpolateARN({ ...args, service: "iam", resource });
}

export function extractFederatedUser(
  arn: ARN,
): Output<ARNPartsNoRegion & { userName: string }> {
  return extractARNPartsWithResourceType(arn, "federated-user", "userName");
}

export function group(
  args: ARNServiceArgsNoRegion & { groupNameWithPath: Input<string> },
) {
  const resource = interpolateResourceType("group", args.groupNameWithPath);
  return interpolateARN({ ...args, service: "iam", resource });
}

export function extractGroup(
  arn: ARN,
): Output<ARNPartsNoRegion & { groupNameWithPath: string }> {
  return extractARNPartsWithResourceType(arn, "group", "groupNameWithPath");
}

export function instanceProfile(
  args: ARNServiceArgsNoRegion & { instanceProfileNameWithPath: Input<string> },
) {
  const resource = interpolateResourceType(
    "instance-profile",
    args.instanceProfileNameWithPath,
  );
  return interpolateARN({ ...args, service: "iam", resource });
}

export function mfa(
  args: ARNServiceArgsNoRegion & { mfaTokenIdWithPath: Input<string> },
) {
  const resource = interpolateResourceType("mfa", args.mfaTokenIdWithPath);
  return interpolateARN({ ...args, service: "iam", resource });
}

export function oidcProvider(
  args: ARNServiceArgsNoRegion & { oidcProviderName: Input<string> },
) {
  const resource = interpolateResourceType(
    "oidc-provider",
    args.oidcProviderName,
  );
  return interpolateARN({ ...args, service: "iam", resource });
}

export function policy(
  args: ARNServiceArgsNoRegion & { policyNameWithPath: Input<string> },
) {
  const resource = interpolateResourceType("policy", args.policyNameWithPath);
  return interpolateARN({ ...args, service: "iam", resource });
}

export function role(
  args: ARNServiceArgsNoRegion & { roleNameWithPath: Input<string> },
) {
  const resource = interpolateResourceType("role", args.roleNameWithPath);
  return interpolateARN({ ...args, service: "iam", resource });
}

export function samlProvider(
  args: ARNServiceArgsNoRegion & { samlProviderName: Input<string> },
) {
  const resource = interpolateResourceType(
    "saml-provider",
    args.samlProviderName,
  );
  return interpolateARN({ ...args, service: "iam", resource });
}

export function serverCertificate(
  args: ARNServiceArgsNoRegion & { certificateNameWithPath: Input<string> },
) {
  const resource = interpolateResourceType(
    "service-certificate",
    args.certificateNameWithPath,
  );
  return interpolateARN({ ...args, service: "iam", resource });
}

export function smsMfa(
  args: ARNServiceArgsNoRegion & { mfaTokenIdWithPath: Input<string> },
) {
  const resource = interpolateResourceType("sms-mfa", args.mfaTokenIdWithPath);
  return interpolateARN({ ...args, service: "iam", resource });
}

export function user(
  args: ARNServiceArgsNoRegion & { userNameWithPath: Input<string> },
) {
  const resource = interpolateResourceType("user", args.userNameWithPath);
  return interpolateARN({ ...args, service: "iam", resource });
}
