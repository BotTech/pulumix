import * as aws from "@pulumi/aws";
import { GetCallerIdentityResult } from "@pulumi/aws";

let firstCaller: Promise<GetCallerIdentityResult> | null = null;

export function staticCaller(): Promise<GetCallerIdentityResult> {
  if (!firstCaller) {
    firstCaller = aws.getCallerIdentity();
  }
  return firstCaller;
}

export function staticCallerAccountId(): Promise<string> {
  return staticCaller().then((id) => id.accountId);
}

export function staticCallerArn(): Promise<string> {
  return staticCaller().then((id) => id.arn);
}

export function staticCallerUserId(): Promise<string> {
  return staticCaller().then((id) => id.userId);
}

export function callerAccountId(): Promise<string> {
  return aws.getCallerIdentity().then((id) => id.accountId);
}

export function callerArn(): Promise<string> {
  return aws.getCallerIdentity().then((id) => id.arn);
}

export function callerUser(): Promise<string> {
  return aws.getCallerIdentity().then((id) => id.userId);
}
