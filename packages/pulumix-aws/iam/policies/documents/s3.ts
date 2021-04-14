import * as aws from "@pulumi/aws";
import * as statements from "./statements";

export function fullAccess(
  args?: statements.AccessPatternArgs
): aws.iam.PolicyDocument {
  return {
    Version: "2012-10-17",
    Statement: [statements.s3.fullAccess(args)],
  };
}
