import * as pulumi from "@pulumi/pulumi";
import { CustomResourceOptions, Input } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface ProviderArgs {
  accountId: Input<string>;
  roleArn?: Input<string>;
}

export class Provider {
  provider: aws.Provider;
  opts: CustomResourceOptions;

  constructor(args: ProviderArgs) {
    const role = args.roleArn
      ? pulumi.output(args.roleArn).apply((arn) => ({
          roleArn: arn,
          sessionName: "PulumiSession",
          externalId: "PulumiApplication",
        }))
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
