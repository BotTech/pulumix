import { forEachInput, tags } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi";
import * as policies from "./policies";

export interface UserRoleArgs {
  accountId: Input<string>;
  description: Input<string>;
  policyArns?: Input<Input<string>[]>;
  groupNames?: Input<Input<string>[]>;
}

export class UserRole extends pulumi.ComponentResource {
  role: aws.iam.Role;
  assumeRolePolicy: aws.iam.Policy;

  constructor(
    name: string,
    args: UserRoleArgs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super("pulumix-aws:iam:UserRole", name, {}, opts);

    const childOpts = { ...opts, parent: this };

    this.role = new aws.iam.Role(
      name,
      {
        description: args.description,
        path: "/user/",
        name: name,
        assumeRolePolicy: policies.documents.iam.inline.accountAssumeRole(
          args.accountId
        ),
        tags: tags(),
      },
      childOpts
    );

    this.assumeRolePolicy = policies.iam.assumeRole(
      { role: this.role },
      childOpts
    );

    forEachInput<string>(
      args.policyArns,
      (policyArn, i) =>
        new aws.iam.RolePolicyAttachment(
          `${name}${i}`,
          {
            role: this.role.name,
            policyArn: policyArn,
          },
          childOpts
        )
    );

    forEachInput<string>(
      args.groupNames,
      (groupName, i) =>
        new aws.iam.GroupPolicyAttachment(
          `${name}${i}`,
          {
            group: groupName,
            policyArn: this.assumeRolePolicy.arn,
          },
          childOpts
        )
    );

    this.registerOutputs();
  }
}
