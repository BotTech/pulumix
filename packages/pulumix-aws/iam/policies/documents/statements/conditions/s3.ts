import * as aws from "@pulumi/aws";

export const notEncrypted: aws.iam.Conditions = {
  StringNotEquals: {
    "s3:x-amz-server-side-encryption": "aws:kms",
  },
};

export const insecureConnection: aws.iam.Conditions = {
  Bool: {
    "aws:SecureTransport": "false",
  },
};
