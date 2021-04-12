import { resourceNames, ResourceNamesAlternatives } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { AWSResourceNameAlternatives, awsResourceNames } from "../types";
import * as policies from "./policies";

export * from "./user";
export * from "./userRole";
export { policies };

export const DefaultPasswordLength = 20;

export function strongAccountPasswordPolicy(
  minimumPasswordLength?: pulumi.Input<number>,
  opts?: pulumi.CustomResourceOptions
): aws.iam.AccountPasswordPolicy {
  const passwordLength = minimumPasswordLength ?? DefaultPasswordLength;
  return new aws.iam.AccountPasswordPolicy(
    "Strong",
    {
      allowUsersToChangePassword: true,
      minimumPasswordLength: passwordLength,
    },
    opts
  );
}

export function attachGroupPolicies(
  group: ResourceNamesAlternatives,
  policies: AWSResourceNameAlternatives[],
  opts?: pulumi.ComponentResourceOptions
): aws.iam.GroupPolicyAttachment[] {
  const groupNames = resourceNames(group);
  return policies.map((policy) => {
    const policyNames = awsResourceNames(policy);
    return new aws.iam.GroupPolicyAttachment(
      `${groupNames.resourceName}${policyNames.resourceName}`,
      {
        group: groupNames.name,
        policyArn: policyNames.arn,
      },
      opts
    );
  });
}
