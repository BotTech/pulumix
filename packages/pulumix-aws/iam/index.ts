import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
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

export interface PolicyArgs {
  name: pulumi.Input<string>;
  arn: pulumi.Input<string>;
}

export function attachGroupPolicies(
  groupName: pulumi.Input<string>,
  policies: PolicyArgs[],
  opts?: pulumi.ComponentResourceOptions
): aws.iam.GroupPolicyAttachment[] {
  return policies.map((policy) => {
    return new aws.iam.GroupPolicyAttachment(
      `${groupName}${policy.name}`,
      {
        group: groupName,
        policyArn: policy.arn,
      },
      opts
    );
  });
}
