import { Name, nameProperty } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { tags } from "base/index";

export interface BaseUserArgs {
  allUsersGroupName?: Name | null;
  groupNames: Name[];
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
    const userArgs = args.import
      ? {
          name: name,
        }
      : {
          name: name,
          tags: tags(),
          forceDestroy: true,
        };

    this.user = new aws.iam.User(name, userArgs, userOpts);

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
        groups: userGroups.map(nameProperty),
      },
      childOpts
    );

    this.loginProfile = new aws.iam.UserLoginProfile(
      name,
      {
        passwordLength: args.passwordLength,
        // Do not require a password reset as the user has not setup MFA yet and will be unable to login.
        // Do not set this to anything if importing as it will not import correctly.
        passwordResetRequired: args.import ? undefined : false,
        pgpKey: args.import ? "" : args.pgpKey,
        user: this.user.name,
      },
      userOpts
    );
  }
}
