import { resourceNames, ResourceNames } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { AWSResourceNames, awsResourceNames } from "base/types";
import * as policies from "./policies";

export * from "./user";
export * from "./user-role";
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

export interface AttachGroupPoliciesArgs {
  group: ResourceNames;
  policies: AWSResourceNames[];
}

export function attachGroupPolicies(
  args: AttachGroupPoliciesArgs,
  opts?: pulumi.ComponentResourceOptions
): aws.iam.GroupPolicyAttachment[] {
  const groupNames = resourceNames(args.group);
  return args.policies.map((policy) => {
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
