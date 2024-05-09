import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Input, Output } from "@pulumi/pulumi";
import { arns, tags } from "~/src";
import * as policies from "./policies";
import { ARNs, parseAccountId } from "~/src/arns";
import { parseGroupARN } from "~/src/arns/iam";

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

    const accountIds: Output<string[]> = arns
      .arns(args.groupArns)
      .apply((arns) => {
        return pulumi.output(arns.map(parseAccountId));
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

    arns.arns(args.policyArns).apply((arns) =>
      arns.map(
        (policyArn, i) =>
          new aws.iam.RolePolicyAttachment(
            `${name}${i}`,
            {
              role: this.role.name,
              policyArn: policyArn,
            },
            childOpts,
          ),
      ),
    );

    arns.arns(args.groupArns).apply((arns) =>
      arns.map((groupArn, i) => {
        const arnParts = parseGroupARN(groupArn);
        return new aws.iam.GroupPolicyAttachment(
          `${name}${i}`,
          {
            group: arnParts.groupNameWithPath,
            policyArn: this.assumeRolePolicy.arn,
          },
          childOpts,
        );
      }),
    );
  }
}
