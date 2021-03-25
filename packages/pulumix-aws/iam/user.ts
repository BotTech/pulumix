import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { tags } from "@bottech/pulumix";

export interface UserArgs {
  groupNames: Input<string>[];
  passwordLength: number;
  pgpKey: Input<string>;
}

export class User extends pulumi.ComponentResource {
  user: aws.iam.User;
  loginProfile: aws.iam.UserLoginProfile;

  constructor(
    name: string,
    args: UserArgs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super("allfiguredout:auth:User", name, {}, opts);

    const childOpts = { ...opts, parent: this };

    this.user = new aws.iam.User(
      name,
      {
        name: name,
        tags: tags(),
        forceDestroy: true,
      },
      childOpts
    );

    new aws.iam.UserGroupMembership(
      name,
      {
        user: this.user.name,
        groups: args.groupNames,
      },
      childOpts
    );

    this.loginProfile = new aws.iam.UserLoginProfile(
      name,
      {
        passwordLength: args.passwordLength,
        // Do not require a password reset as the user has not setup MFA yet and will be unable to login.
        passwordResetRequired: false,
        pgpKey: args.pgpKey,
        user: this.user.name,
      },
      { ...childOpts, aliases: [{ name: "login" }] }
    );

    this.registerOutputs();
  }
}
