import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Input } from "@pulumi/pulumi";
import { arns, mapInputs } from "~/src";
import { ARNs } from "~/src/arns";

export function awsPrincipals(principalARNs: ARNs): aws.iam.AWSPrincipal {
  return { AWS: arns.arns(principalARNs) };
}

export function services(
  services: aws.iam.ServicePrincipal["Service"],
): aws.iam.ServicePrincipal {
  return { Service: services };
}

export function rootUser(
  accountIds: Input<string> | Input<Input<string>[]>,
): aws.iam.Principal {
  return awsPrincipals(
    mapInputs(accountIds, (accountId) => {
      return pulumi.interpolate`arn:aws:iam::${accountId}:root`;
    }),
  );
}

export function account(
  accountIds: Input<string> | Input<Input<string>[]>,
): aws.iam.Principal {
  // The account principal can either be the root principal ARN or just the account id.
  // See https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_principal.html#principal-accounts.
  return rootUser(accountIds);
}
