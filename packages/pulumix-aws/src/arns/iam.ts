// https://docs.aws.amazon.com/service-authorization/latest/reference/list_awsidentityandaccessmanagementiam.html#awsidentityandaccessmanagementiam-resources-for-iam-policies

import { Output } from "@pulumi/pulumi";
import { ARN } from "~/src";

import {
  parseARNWithTypedNestedSubResource,
  parseARNWithTypedSubResource,
  interpolateARN,
  interpolateARNWithSubResource,
  interpolateSubResource,
  WithPart,
} from "~/src/arns";
import { Inputs } from "@bottech/pulumix";

type Parts = {
  partition?: string;
  accountId: string;
};

type SubResourceParts<Part extends string> = WithPart<Parts, Part>;

type SubResourceArgs<Part extends string> = Inputs<SubResourceParts<Part>>;

const service = "iam";

// TODO: This should ideally be a function that takes a partition.
export const ownMFAARN = "arn:aws:iam::*:mfa/${aws:username}";

// TODO: This should ideally be a function that takes a partition.
export const ownUserARN = "arn:aws:iam::*:user/${aws:username}";

export function interpolateAccessReportARN(
  args: SubResourceArgs<"entityPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "access-report",
    args.entityPath,
  );
}

export function parseAccessReportARN(
  arn: ARN,
): Output<SubResourceParts<"entityPath">> {
  return parseARNWithTypedSubResource(arn, "access-report", "entityPath");
}

export function interpolateAssumedRoleARN(
  args: SubResourceArgs<"roleName" | "roleSessionName">,
): Output<string> {
  const resource = interpolateSubResource(
    "assumed-role",
    args.roleName,
    args.roleSessionName,
  );
  return interpolateARN({ ...args, service, resource });
}

export function parseAssumedRoleARN(
  arn: ARN,
): Output<SubResourceParts<"roleName" | "roleSessionName">> {
  return parseARNWithTypedNestedSubResource(
    arn,
    "assumed-role",
    "roleName",
    "roleSessionName",
  );
}

export function interpolateFederatedUserARN(
  args: SubResourceArgs<"userName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "federated-user",
    args.userName,
  );
}

export function parseFederatedUserARN(
  arn: ARN,
): Output<SubResourceParts<"userName">> {
  return parseARNWithTypedSubResource(arn, "federated-user", "userName");
}

export function interpolateGroupARN(
  args: SubResourceArgs<"groupNameWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "group",
    args.groupNameWithPath,
  );
}

export function parseGroupARN(
  arn: ARN,
): Output<SubResourceParts<"groupNameWithPath">> {
  return parseARNWithTypedSubResource(arn, "group", "groupNameWithPath");
}

export function interpolateInstanceProfileARN(
  args: SubResourceArgs<"instanceProfileNameWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "instance-profile",
    args.instanceProfileNameWithPath,
  );
}

export function parseInstanceProfileARN(
  arn: ARN,
): Output<SubResourceParts<"instanceProfileNameWithPath">> {
  return parseARNWithTypedSubResource(
    arn,
    "instance-profile",
    "instanceProfileNameWithPath",
  );
}

export function interpolateMFAARN(
  args: SubResourceArgs<"mfaTokenIdWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "mfa",
    args.mfaTokenIdWithPath,
  );
}

export function parseMFAARN(
  arn: ARN,
): Output<SubResourceParts<"mfaTokenIdWithPath">> {
  return parseARNWithTypedSubResource(arn, "mfa", "mfaTokenIdWithPath");
}

export function interpolateOIDCProviderARN(
  args: SubResourceArgs<"oidcProviderName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "oidc-provider",
    args.oidcProviderName,
  );
}

export function parseOIDCProviderARN(
  arn: ARN,
): Output<SubResourceParts<"oidcProviderName">> {
  return parseARNWithTypedSubResource(arn, "oidc-provider", "oidcProviderName");
}

export function interpolatePolicyARN(
  args: SubResourceArgs<"policyNameWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "policy",
    args.policyNameWithPath,
  );
}

export function parsePolicyARN(
  arn: ARN,
): Output<SubResourceParts<"policyNameWithPath">> {
  return parseARNWithTypedSubResource(arn, "policy", "policyNameWithPath");
}

export function interpolateRoleARN(
  args: SubResourceArgs<"roleNameWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "role",
    args.roleNameWithPath,
  );
}

export function parseRoleARN(
  arn: ARN,
): Output<SubResourceParts<"roleNameWithPath">> {
  return parseARNWithTypedSubResource(arn, "role", "roleNameWithPath");
}

export function interpolateSAMLProviderARN(
  args: SubResourceArgs<"samlProviderName">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "saml-provider",
    args.samlProviderName,
  );
}

export function parseSAMLProviderARN(
  arn: ARN,
): Output<SubResourceParts<"samlProviderName">> {
  return parseARNWithTypedSubResource(arn, "saml-provider", "samlProviderName");
}

export function interpolateServerCertificateARN(
  args: SubResourceArgs<"certificateNameWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "service-certificate",
    args.certificateNameWithPath,
  );
}

export function parseServerCertificateARN(
  arn: ARN,
): Output<SubResourceParts<"certificateNameWithPath">> {
  return parseARNWithTypedSubResource(
    arn,
    "service-certificate",
    "certificateNameWithPath",
  );
}

export function interpolateSMSMFAARN(
  args: SubResourceArgs<"mfaTokenIdWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "sms-mfa",
    args.mfaTokenIdWithPath,
  );
}

export function parseSMSMFAARN(
  arn: ARN,
): Output<SubResourceParts<"mfaTokenIdWithPath">> {
  return parseARNWithTypedSubResource(arn, "sms-mfa", "mfaTokenIdWithPath");
}

export function interpolateUserARN(
  args: SubResourceArgs<"userNameWithPath">,
): Output<string> {
  return interpolateARNWithSubResource(
    { ...args, service },
    "user",
    args.userNameWithPath,
  );
}

export function parseUserARN(
  arn: ARN,
): Output<SubResourceParts<"userNameWithPath">> {
  return parseARNWithTypedSubResource(arn, "user", "userNameWithPath");
}
