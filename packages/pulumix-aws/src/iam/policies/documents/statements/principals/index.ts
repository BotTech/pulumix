import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { arns, ARNs } from "~/src/types";

export function awsPrincipals(principalARNs: ARNs): aws.iam.AWSPrincipal {
  return { AWS: arns(principalARNs) };
}

export function services(
  services: aws.iam.ServicePrincipal["Service"]
): aws.iam.ServicePrincipal {
  return { Service: services };
}

export function rootUser(accoundId: pulumi.Input<string>): aws.iam.Principal {
  return awsPrincipals(pulumi.interpolate`arn:aws:iam::${accoundId}:root`);
}
