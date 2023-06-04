import * as aws from "@pulumi/aws";
import * as statements from "./statements";

export function reachabilityAnalyzerFullAccess(): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [statements.vpc.reachabilityAnalyzerFullAccess()],
  };
}
