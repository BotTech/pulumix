import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function awsPrincipal(arn: pulumi.Input<string>): aws.iam.AWSPrincipal {
  return { AWS: arn };
}

export function awsPrincipals(
  arns: pulumi.Input<string>[]
): aws.iam.AWSPrincipal {
  return { AWS: arns };
}

export function rootUser(accoundId: pulumi.Input<string>): aws.iam.Principal {
  return awsPrincipal(pulumi.interpolate`arn:aws:iam::${accoundId}:root`);
}
