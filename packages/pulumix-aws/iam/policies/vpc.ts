import { CustomResourceOptions } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as documents from "./documents";

export function reachabilityAnalyzerFullAccess(
  opts?: CustomResourceOptions
): aws.iam.Policy {
  return new aws.iam.Policy(
    `ReachabilityAnalyzerFullAccess`,
    {
      description: `Allows full access to the Reachability Analyzer.`,
      policy: documents.vpc.reachabilityAnalyzerFullAccess(),
    },
    opts
  );
}
