import * as aws from "@pulumi/aws";
import { PolicyStatement } from "@pulumi/aws/iam";
import * as conditions from "./conditions";

export type Action = PolicyStatement["Action"];

export type Condition = PolicyStatement["Condition"];

export type Principal = PolicyStatement["Principal"];

export type Resource = PolicyStatement["Resource"];

export type Sid = PolicyStatement["Sid"];

export interface MfaPresentArg {
  mfaPresent?: boolean;
}

export type AllowActionsArgs = {
  Action: Action;
  Condition?: Condition;
  Sid?: Sid;
} & MfaPresentArg;

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
  Resource?: Resource;
}

export function inlineAllowActions(
  args: InlineAllowActionsArgs
): aws.iam.PolicyStatement {
  return {
    Sid: args.Sid,
    Effect: "Allow",
    Principal: args.Principal,
    Action: args.Action,
    // Some inline policies still need a resource (e.g. KMS key policies).
    Resource: args.Resource,
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

export type AccessPatternArgs = MfaPresentArg;

export class AccessPatterns {
  name: string;
  prefix: string;

  constructor(name: string, prefix: string) {
    this.name = name;
    this.prefix = prefix;
  }

  fullAccess(args?: AccessPatternArgs): aws.iam.PolicyStatement {
    return allowActions({
      Sid: `${this.name}FullAccess`,
      Action: `${this.prefix}:*`,
      mfaPresent: args?.mfaPresent,
    });
  }

  readOnlyAccess(args?: AccessPatternArgs): aws.iam.PolicyStatement {
    return allowActions({
      Sid: `${this.name}ReadOnlyAccess`,
      Action: [
        `${this.prefix}:Describe*`,
        `${this.prefix}:Get*`,
        `${this.prefix}:List*`,
      ],
      mfaPresent: args?.mfaPresent,
    });
  }
}

export interface InlineAccessPatternArgs extends AccessPatternArgs {
  Principal: Principal;
}

export class InlineAccessPatterns {
  name: string;
  prefix: string;

  constructor(name: string, prefix: string) {
    this.name = name;
    this.prefix = prefix;
  }

  fullAccess(args: InlineAccessPatternArgs): aws.iam.PolicyStatement {
    return inlineAllowActions({
      Sid: `${this.name}FullAccess`,
      Principal: args?.Principal,
      Resource: "*",
      Action: `${this.prefix}:*`,
      mfaPresent: args?.mfaPresent,
    });
  }

  readOnlyAccess(args: InlineAccessPatternArgs): aws.iam.PolicyStatement {
    return inlineAllowActions({
      Sid: `${this.name}ReadOnlyAccess`,
      Principal: args?.Principal,
      Resource: "*",
      Action: [
        `${this.prefix}:Describe*`,
        `${this.prefix}:Get*`,
        `${this.prefix}:List*`,
      ],
      mfaPresent: args?.mfaPresent,
    });
  }
}
