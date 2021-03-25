import { Input } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as conditions from "./conditions";

export type Action = Input<string> | Input<Input<string>[]>;
export type Condition = Input<aws.iam.Conditions>;
export type Principal = Input<aws.iam.Principal>;
export type Resource = Input<string> | Input<Input<string>[]>;
export type Sid = Input<string>;

export interface AllowActionsArgs {
  Action: Action;
  Condition?: Condition;
  Sid?: Sid;
  mfaPresent?: boolean;
}

export function allowActions(args: AllowActionsArgs): aws.iam.PolicyStatement {
  return allowResourceActions({
    ...args,
    Resource: "*",
  });
}

export interface AllowResourceActionsArgs extends AllowActionsArgs {
  Resource: Resource;
}

function mfaPresentCondition(
  mfaPresent?: boolean
): aws.iam.Conditions | undefined {
  return mfaPresent === undefined || mfaPresent
    ? conditions.mfa.present
    : undefined;
}

export function allowResourceActions(
  args: AllowResourceActionsArgs
): aws.iam.PolicyStatement {
  return {
    Sid: args.Sid,
    Effect: "Allow",
    Action: args.Action,
    Resource: args.Resource,
    Condition: conditions.merge(
      args.Condition,
      mfaPresentCondition(args.mfaPresent)
    ),
  };
}

export interface InlineAllowActionsArgs extends AllowActionsArgs {
  Principal: Principal;
}

export function inlineAllowActions(
  args: InlineAllowActionsArgs
): aws.iam.PolicyStatement {
  return {
    Sid: args.Sid,
    Effect: "Allow",
    Principal: args.Principal,
    Action: args.Action,
    Condition: conditions.merge(
      args.Condition,
      mfaPresentCondition(args.mfaPresent)
    ),
  };
}

export interface DenyAllExceptActionsArgs {
  NotAction: Action;
  Condition?: Condition;
  Sid?: Sid;
}

export function denyAllExceptActions(
  args: DenyAllExceptActionsArgs
): aws.iam.PolicyStatement {
  return denyAllExceptResourceActions({
    ...args,
    Resource: "*",
  });
}

export interface DenyAllExceptResourceActionsArgs
  extends DenyAllExceptActionsArgs {
  Resource: Resource;
}

export function denyAllExceptResourceActions(
  args: DenyAllExceptResourceActionsArgs
): aws.iam.PolicyStatement {
  return {
    Sid: args.Sid,
    Effect: "Deny",
    NotAction: args.NotAction,
    Resource: args.Resource,
    Condition: args.Condition,
  };
}

export interface AccessPatternArgs {
  mfaPresent?: boolean;
}

export class AccessPatterns {
  name: string;
  prefix: string;

  constructor(name: string, prefix: string) {
    this.name = name;
    this.prefix = prefix;
  }

  fullAccess(args?: AccessPatternArgs): aws.iam.PolicyStatement {
    return allowActions({
      Sid: `Full${this.name}Access`,
      Action: `${this.prefix}:*`,
      mfaPresent: args?.mfaPresent,
    });
  }

  readOnlyAccess(args?: AccessPatternArgs): aws.iam.PolicyStatement {
    return allowActions({
      Sid: `ReadOnly${this.name}Access`,
      Action: [
        `${this.prefix}:Describe*`,
        `${this.prefix}:Get*`,
        `${this.prefix}:List*`,
      ],
      mfaPresent: args?.mfaPresent,
    });
  }
}
