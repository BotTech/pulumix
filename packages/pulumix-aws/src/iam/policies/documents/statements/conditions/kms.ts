import * as aws from "@pulumi/aws";

export const grantIsForAWSResource: aws.iam.Conditions = {
  BoolIfExists: {
    "kms:GrantIsForAWSResource": "true",
  },
};
