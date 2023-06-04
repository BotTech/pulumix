import * as aws from "@pulumi/aws";
import { CustomResourceOptions, Input } from "@pulumi/pulumi";

export interface ProviderUserArgs {
  accountId: Input<string>;
  roleArn: undefined;
}

export interface ProviderRoleArgs {
  accountId: Input<string>;
  roleArn: Input<string>;
  userName: Input<string>;
}

export type ProviderArgs = ProviderUserArgs | ProviderRoleArgs;

export class Provider {
  provider: aws.Provider;
  opts: CustomResourceOptions;

  constructor(args: ProviderArgs) {
    // TODO: Enforce this for certain roles.
    // https://aws.amazon.com/blogs/security/easily-control-naming-individual-iam-role-sessions/
    const role = args.roleArn
      ? {
          roleArn: args.roleArn,
          sessionName: args.userName,
        }
      : undefined;

    this.provider = new aws.Provider("main", {
      allowedAccountIds: [args.accountId],
      assumeRole: role,
      profile: aws.config.profile,
      region: aws.config.requireRegion(),
    });

    this.opts = { provider: this.provider };
  }
}
