import { tags } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export interface BaseUserArgs {
  allUsersGroupName?: pulumi.Input<string> | null;
  groupNames: pulumi.Input<string>[];
  passwordLength: pulumi.Input<number>;
}

export interface ImportUserArgs extends BaseUserArgs {
  import: true;
}

export interface NewUserArgs extends BaseUserArgs {
  import?: false;
  pgpKey: pulumi.Input<string>;
}

export type UserArgs = ImportUserArgs | NewUserArgs;

export class User extends pulumi.ComponentResource {
  user: aws.iam.User;
  loginProfile: aws.iam.UserLoginProfile;

  constructor(
    name: string,
    args: UserArgs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super("pulumix-aws:iam:User", name, {}, opts);

    const childOpts = { ...opts, parent: this };
    const userOpts = args.import ? { ...childOpts, import: name } : childOpts;

    this.user = new aws.iam.User(
      name,
      {
        name: name,
        tags: tags(),
        forceDestroy: true,
      },
      userOpts
    );

    const userGroups = args.groupNames;
    if (typeof args.allUsersGroupName === "undefined") {
      userGroups.push("Everyone");
    } else if (args.allUsersGroupName) {
      userGroups.push(args.allUsersGroupName);
    }
    new aws.iam.UserGroupMembership(
      name,
      {
        user: this.user.name,
        groups: userGroups,
      },
      childOpts
    );

    this.loginProfile = new aws.iam.UserLoginProfile(
      name,
      {
        passwordLength: args.passwordLength,
        // Do not require a password reset as the user has not setup MFA yet and will be unable to login.
        passwordResetRequired: false,
        pgpKey: args.import ? "" : args.pgpKey,
        user: this.user.name,
      },
      userOpts
    );

    this.registerOutputs();
  }
}
