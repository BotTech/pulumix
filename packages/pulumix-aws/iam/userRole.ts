import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Input, output } from "@pulumi/pulumi";
import { arns, ARNs, tags } from "..";
import * as policies from "./policies";

export interface UserRoleArgs {
  accountId: Input<string>;
  description: Input<string>;
  policyArns?: ARNs;
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

    // TODO: Check names.

    if (args.policyArns !== undefined) {
      arns(args.policyArns).apply((arns) =>
        arns.map(
          (arn, i) =>
            new aws.iam.RolePolicyAttachment(
              `${name}${i}`,
              {
                role: this.role.name,
                policyArn: arn,
              },
              childOpts
            )
        )
      );
    }

    if (args.groupNames !== undefined) {
      output(args.groupNames).apply((groupNames) =>
        groupNames.map(
          (groupName, i) =>
            new aws.iam.GroupPolicyAttachment(
              `${name}${i}`,
              {
                group: groupName,
                policyArn: this.assumeRolePolicy.arn,
              },
              childOpts
            )
        )
      );
    }
  }
}
