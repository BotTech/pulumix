// https://docs.aws.amazon.com/service-authorization/latest/reference/list_awsidentityandaccessmanagementiam.html#awsidentityandaccessmanagementiam-resources-for-iam-policies

import { Output } from "@pulumi/pulumi";
import { ARN } from "~/src";

import {
  extractARNPartsWithResourceType,
  extractARNPartsWithSubResourceTypes,
  interpolateARN,
  interpolateARNWithResourceType,
  interpolateResourceType,
  WithPart,
} from "~/src/arns";
import { Inputs } from "@bottech/pulumix";

type Parts = {
  partition: string;
  accountId: string;
};

type SubResourceParts<Part extends string> = WithPart<Parts, Part>;

type SubResourceArgs<Part extends string> = Inputs<SubResourceParts<Part>>;

const service = "iam";

// TODO: This should ideally be a function that takes a partition.
export const ownMFA = "arn:aws:iam::*:mfa/${aws:username}";

// TODO: This should ideally be a function that takes a partition.
export const ownUser = "arn:aws:iam::*:user/${aws:username}";

export function accessReport(
  args: SubResourceArgs<"entityPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "access-report",
    args.entityPath,
  );
}

export function extractAccessReport(
  arn: ARN,
): Output<SubResourceParts<"entityPath">> {
  return extractARNPartsWithResourceType(arn, "access-report", "entityPath");
}

export function assumedRole(
  args: SubResourceArgs<"roleName" | "roleSessionName">,
): Output<string> {
  const resource = interpolateResourceType(
    "assumed-role",
    args.roleName,
    args.roleSessionName,
  );
  return interpolateARN({ ...args, service, resource });
}

export function extractAssumedRole(
  arn: ARN,
): Output<SubResourceParts<"roleName" | "roleSessionName">> {
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
  args: SubResourceArgs<"userName">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "federated-user",
    args.userName,
  );
}

export function extractFederatedUser(
  arn: ARN,
): Output<SubResourceParts<"userName">> {
  return extractARNPartsWithResourceType(arn, "federated-user", "userName");
}

export function group(
  args: SubResourceArgs<"groupNameWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "group",
    args.groupNameWithPath,
  );
}

export function extractGroup(
  arn: ARN,
): Output<SubResourceParts<"groupNameWithPath">> {
  return extractARNPartsWithResourceType(arn, "group", "groupNameWithPath");
}

export function instanceProfile(
  args: SubResourceArgs<"instanceProfileNameWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "instance-profile",
    args.instanceProfileNameWithPath,
  );
}

export function extractInstanceProfile(
  arn: ARN,
): Output<SubResourceParts<"instanceProfileNameWithPath">> {
  return extractARNPartsWithResourceType(
    arn,
    "instance-profile",
    "instanceProfileNameWithPath",
  );
}

export function mfa(
  args: SubResourceArgs<"mfaTokenIdWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "mfa",
    args.mfaTokenIdWithPath,
  );
}

export function extractMfa(
  arn: ARN,
): Output<SubResourceParts<"mfaTokenIdWithPath">> {
  return extractARNPartsWithResourceType(arn, "mfa", "mfaTokenIdWithPath");
}

export function oidcProvider(
  args: SubResourceArgs<"oidcProviderName">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "oidc-provider",
    args.oidcProviderName,
  );
}

export function extractOidcProvider(
  arn: ARN,
): Output<SubResourceParts<"oidcProviderName">> {
  return extractARNPartsWithResourceType(
    arn,
    "oidc-provider",
    "oidcProviderName",
  );
}

export function policy(
  args: SubResourceArgs<"policyNameWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "policy",
    args.policyNameWithPath,
  );
}

export function extractPolicy(
  arn: ARN,
): Output<SubResourceParts<"policyNameWithPath">> {
  return extractARNPartsWithResourceType(arn, "policy", "policyNameWithPath");
}

export function role(
  args: SubResourceArgs<"roleNameWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "role",
    args.roleNameWithPath,
  );
}

export function extractRole(
  arn: ARN,
): Output<SubResourceParts<"roleNameWithPath">> {
  return extractARNPartsWithResourceType(arn, "role", "roleNameWithPath");
}

export function samlProvider(
  args: SubResourceArgs<"samlProviderName">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "saml-provider",
    args.samlProviderName,
  );
}

export function extractSamlProvider(
  arn: ARN,
): Output<SubResourceParts<"samlProviderName">> {
  return extractARNPartsWithResourceType(
    arn,
    "saml-provider",
    "samlProviderName",
  );
}

export function serverCertificate(
  args: SubResourceArgs<"certificateNameWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "service-certificate",
    args.certificateNameWithPath,
  );
}

export function extractServerCertificate(
  arn: ARN,
): Output<SubResourceParts<"certificateNameWithPath">> {
  return extractARNPartsWithResourceType(
    arn,
    "service-certificate",
    "certificateNameWithPath",
  );
}

export function smsMfa(
  args: SubResourceArgs<"mfaTokenIdWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "sms-mfa",
    args.mfaTokenIdWithPath,
  );
}

export function extractSmsMfa(
  arn: ARN,
): Output<SubResourceParts<"mfaTokenIdWithPath">> {
  return extractARNPartsWithResourceType(arn, "sms-mfa", "mfaTokenIdWithPath");
}

export function user(
  args: SubResourceArgs<"userNameWithPath">,
): Output<string> {
  return interpolateARNWithResourceType(
    { ...args, service },
    "user",
    args.userNameWithPath,
  );
}

export function extractUser(
  arn: ARN,
): Output<SubResourceParts<"userNameWithPath">> {
  return extractARNPartsWithResourceType(arn, "user", "userNameWithPath");
}
