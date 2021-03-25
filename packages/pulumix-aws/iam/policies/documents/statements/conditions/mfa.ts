import * as aws from "@pulumi/aws";

export const present: aws.iam.Conditions = {
  Bool: {
    "aws:MultiFactorAuthPresent": "true",
  },
};

export const missing: aws.iam.Conditions = {
  BoolIfExists: {
    "aws:MultiFactorAuthPresent": "false",
  },
};
