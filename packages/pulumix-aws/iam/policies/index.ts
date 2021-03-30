import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as documents from "./documents";
import * as iam from "./iam";
import * as organizations from "./organizations";
import * as vpc from "./vpc";

export { documents, iam, organizations, vpc };

export function organizationAdministratorPolicies(
  opts?: pulumi.CustomResourceOptions
): aws.iam.Policy[] {
  return [iam.fullAccess(opts), organizations.fullAccess(opts)];
}
