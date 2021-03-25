import { CustomResourceOptions } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as documents from "./documents";

export function fullAccess(opts?: CustomResourceOptions): aws.iam.Policy {
  return new aws.iam.Policy(
    "FullOrganizationsAccess",
    {
      description: "Allows full access to AWS Organizations.",
      policy: documents.organizations.fullAccess(),
    },
    opts
  );
}
