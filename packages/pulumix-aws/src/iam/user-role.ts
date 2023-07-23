import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Input, output, Output } from "@pulumi/pulumi";
import { arns, ARNs, extractARNAccountId, tags } from "~/src";
import * as policies from "./policies";

export interface UserRoleArgs {
  description: Input<string>;
  policyArns: ARNs;
  groupArns: ARNs;
}

export class UserRole extends pulumi.ComponentResource {
  role: aws.iam.Role;
  assumeRolePolicy: aws.iam.Policy;

  constructor(
    name: string,
    args: UserRoleArgs,
    opts?: pulumi.CustomResourceOptions,
  ) {
    super("pulumix-aws:iam:UserRole", name, {}, opts);

    const childOpts = { ...opts, parent: this };

    const accountIds: Output<string[]> = arns(args.groupArns).apply((arns) => {
      return output(arns.map(extractARNAccountId));
    });

    this.role = new aws.iam.Role(
      name,
      {
        description: args.description,
        path: "/user/",
        name: name,
        // TODO: Ensure that this only makes it possible for someone in the account to assume the role if they also have
        //  a policy that allows them to rather than this on its own permitting anyone in the account to assume the
        //  role.
        assumeRolePolicy:
          policies.documents.iam.inline.accountAssumeRole(accountIds),
        tags: tags(),
      },
      childOpts,
    );

    this.assumeRolePolicy = policies.iam.assumeRole(
      { role: this.role },
      childOpts,
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
              childOpts,
            ),
        ),
      );
    }

    // TODO: We need this.
    // if (args.groupNames !== undefined) {
    //   output(args.groupNames).apply((groupNames) =>
    //     groupNames.map(
    //       (groupName, i) =>
    //         new aws.iam.GroupPolicyAttachment(
    //           `${name}${i}`,
    //           {
    //             group: groupName,
    //             policyArn: this.assumeRolePolicy.arn,
    //           },
    //           childOpts
    //         )
    //     )
    //   );
    // }
  }
}
