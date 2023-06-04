import { mapValues, resourceName } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { staticCallerAccountId } from "../caller";
import { AWSIdentifiedResourceNames, iam, id, kms, tagged } from "../index";

export interface AdministratorUserImportArgs {
  import: true;
}

export interface AdministratorUserCreateArgs {
  import?: false;
  pgpKey: string;
}

export type AdministratorUserArgs =
  | AdministratorUserImportArgs
  | AdministratorUserCreateArgs;

export interface OrganizationalUnitArg {
  accounts?: Record<string, aws.organizations.AccountArgs>;
  subOrganizationlUnits?: Record<string, OrganizationalUnitArg>;
}

export interface ManagementAccountArgs {
  administratorUsers: Record<string, AdministratorUserArgs>;
  minimumPasswordLength?: pulumi.Input<number>;
  organizationName: string;
  organizationalUnits: Record<string, OrganizationalUnitArg>;
}

export class ManagementAccount extends pulumi.ComponentResource {
  accountId: pulumi.Output<string>;
  administratorsGroup: aws.iam.Group;
  everyoneGroup: aws.iam.Group;

  constructor(
    args: ManagementAccountArgs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super(
      "pulumix-aws:organizations:ManagementAccount",
      args.organizationName,
      {},
      opts
    );

    const childOpts = { ...opts, parent: this, protect: true };

    const passwordPolicy = iam.strongAccountPasswordPolicy(
      args.minimumPasswordLength,
      childOpts
    );

    // Policies.

    const adminPolicies =
      iam.policies.organizations.administratorPolicies(childOpts);

    const enforceMFAPolicy = iam.policies.iam.enforceMFA(
      {
        allowListUsers: true,
        allowChangePasswordViaConsole: true,
      },
      childOpts
    );

    // Groups.

    this.everyoneGroup = new aws.iam.Group(
      "Everyone",
      { name: "Everyone" },
      childOpts
    );

    iam.attachGroupPolicies(
      { group: this.everyoneGroup, policies: [enforceMFAPolicy] },
      childOpts
    );

    this.administratorsGroup = new aws.iam.Group(
      "Administrators",
      { name: "Administrators" },
      childOpts
    );

    iam.attachGroupPolicies(
      { group: this.administratorsGroup, policies: adminPolicies },
      childOpts
    );

    // Users.

    mapValues(args.administratorUsers, (user, name) => {
      return new iam.User(
        name,
        {
          ...user,
          allUsersGroupName: this.everyoneGroup.name,
          groupNames: [this.administratorsGroup.name],
          passwordLength: passwordPolicy.minimumPasswordLength.apply(
            (length) => length ?? iam.DefaultPasswordLength
          ),
        },
        childOpts
      );
    });

    // Organizational Units.

    const organization = new aws.organizations.Organization(
      args.organizationName,
      {
        awsServiceAccessPrincipals: [],
        // Enable everything. What's the harm?
        enabledPolicyTypes: [
          "SERVICE_CONTROL_POLICY",
          "TAG_POLICY",
          "BACKUP_POLICY",
          "AISERVICES_OPT_OUT_POLICY",
        ],
        featureSet: "ALL",
      },
      childOpts
    );
    this.accountId = organization.masterAccountId;

    const rootOrganization = organization.roots[0];
    const organizationalUnits = organizationalUnitHierarchy(
      {
        id: rootOrganization.id,
        resourceName: "",
      },
      args.organizationalUnits,
      childOpts
    );

    const assumeOrgAccountAccessRoles =
      assumeOrganizationAccountAccessRolePolicies(
        organizationalUnits,
        childOpts
      );

    iam.attachGroupPolicies(
      {
        group: this.administratorsGroup,
        policies: assumeOrgAccountAccessRoles,
      },
      childOpts
    );

    // KMS Key.

    kms.secretsProvider().then((arn?: string) => {
      if (arn) {
        const key = new aws.kms.Key(
          "Pulumi",
          {
            description: "Pulumi secrets key.",
            policy: staticCallerAccountId().then((accountId) => {
              return JSON.stringify(
                iam.policies.documents.kms.inline.keyAccess({
                  accountId: accountId,
                })
              );
            }),
          },
          { ...childOpts, import: arn }
        );

        new aws.kms.Alias(
          "Pulumi",
          {
            targetKeyId: key.id,
            name: "Pulumi",
          },
          childOpts
        );
      }
    });
  }
}

export interface ProdNonProdSubOrganizationalUnitsArgs {
  NonProd?: Record<string, aws.organizations.AccountArgs>;
  Prod?: Record<string, aws.organizations.AccountArgs>;
}

export function prodNonProdOrganizationalUnit(
  name: string,
  subOrganizationalUnits: ProdNonProdSubOrganizationalUnitsArgs
): Record<string, OrganizationalUnitArg> {
  return {
    [name]: {
      subOrganizationlUnits: mapValues(subOrganizationalUnits, (accounts) => {
        return { accounts: accounts };
      }),
    },
  };
}

export function securityOrganizationalUnit(
  email: (accountName: string, prod: boolean) => string
): Record<string, OrganizationalUnitArg> {
  return prodNonProdOrganizationalUnit("Security", {
    Prod: {
      Auth: {
        email: email("Auth", true),
        iamUserAccessToBilling: "ALLOW",
      },
    },
  });
}

export function workloadSubOrganizationalUnit(
  workload: string,
  email: (accountName: string, prod: boolean) => string
): ProdNonProdSubOrganizationalUnitsArgs {
  const nonProdName = `${workload}Test`;
  const prodName = `${workload}Prod`;
  return {
    NonProd: {
      [nonProdName]: {
        email: email(nonProdName, false),
      },
    },
    Prod: {
      [prodName]: {
        email: email(prodName, true),
      },
    },
  };
}

function mergeProdNonProdSubOrganizationalUnitsArgs(
  a: ProdNonProdSubOrganizationalUnitsArgs,
  b: ProdNonProdSubOrganizationalUnitsArgs
): ProdNonProdSubOrganizationalUnitsArgs {
  const merge = (key: keyof ProdNonProdSubOrganizationalUnitsArgs) =>
    a[key] || b[key] ? { [key]: { ...a[key], ...b[key] } } : {};
  return { ...merge("Prod"), ...merge("NonProd") };
}

export function workloadsOrganizationalUnit(
  workloads: string[] = [],
  email: (accountName: string, prod: boolean) => string
): Record<string, OrganizationalUnitArg> {
  return prodNonProdOrganizationalUnit(
    "Workloads",
    workloads
      .map((workload) => {
        return workloadSubOrganizationalUnit(workload, email);
      })
      .reduce(mergeProdNonProdSubOrganizationalUnitsArgs, {})
  );
}

export function deploymentSubOrganizationalUnit(
  workload: string,
  email: (accountName: string, prod: boolean) => string
): ProdNonProdSubOrganizationalUnitsArgs {
  const prodName = `${workload}Prod`;
  return {
    Prod: {
      [prodName]: {
        email: email(prodName, true),
      },
    },
  };
}

export function deploymentsOrganizationalUnit(
  workloads: string[] = [],
  email: (accountName: string, prod: boolean) => string
): Record<string, OrganizationalUnitArg> {
  return prodNonProdOrganizationalUnit(
    "Deployments",
    workloads
      .map((workload) => {
        return deploymentSubOrganizationalUnit(workload, email);
      })
      .reduce(mergeProdNonProdSubOrganizationalUnitsArgs, {})
  );
}

export function recommendedOrganizationalUnits(
  workloads: string[] = [],
  email: (accountName: string, prod: boolean) => string
): Record<string, OrganizationalUnitArg> {
  return {
    ...securityOrganizationalUnit(email),
    ...workloadsOrganizationalUnit(workloads, email),
    ...deploymentsOrganizationalUnit(workloads, email),
  };
}

function organizationalUnitAccounts(
  parent: AWSIdentifiedResourceNames,
  accounts?: Record<string, aws.organizations.AccountArgs>,
  opts?: pulumi.CustomResourceOptions
): Record<string, aws.organizations.Account> {
  if (accounts === undefined) {
    return {};
  }
  return mapValues(accounts, (account, name) => {
    return new aws.organizations.Account(
      `${resourceName(parent)}${name}`,
      tagged({
        ...account,
        parentId: id(parent),
      }),
      opts
    );
  });
}

interface OrganizationalUnitResult {
  accounts: Record<string, aws.organizations.Account>;
  organizationalUnit: aws.organizations.OrganizationalUnit;
  subOrganizationalUnits: Record<string, OrganizationalUnitResult>;
}

function organizationalUnitHierarchy(
  parent: AWSIdentifiedResourceNames,
  organizationalUnits?: Record<string, OrganizationalUnitArg>,
  opts?: pulumi.CustomResourceOptions
): Record<string, OrganizationalUnitResult> {
  if (organizationalUnits === undefined) {
    return {};
  }
  return mapValues(organizationalUnits, (unit, name) => {
    const organizationalUnit = new aws.organizations.OrganizationalUnit(
      `${resourceName(parent)}${name}`,
      {
        name: name,
        parentId: id(parent),
      },
      opts
    );
    return {
      accounts: organizationalUnitAccounts(
        organizationalUnit,
        unit.accounts,
        opts
      ),
      organizationalUnit: organizationalUnit,
      subOrganizationalUnits: organizationalUnitHierarchy(
        organizationalUnit,
        unit.subOrganizationlUnits,
        opts
      ),
    };
  });
}

function assumeOrganizationAccountAccessRolePolicies(
  organizationalUnits: Record<string, OrganizationalUnitResult>,
  opts: pulumi.ComponentResourceOptions
): aws.iam.Policy[] {
  let results = [] as aws.iam.Policy[];
  for (const name in organizationalUnits) {
    const unit = organizationalUnits[name];
    results = results.concat(
      Object.values(
        mapValues(unit.accounts, (account) => {
          return iam.policies.organizations.assumeOrganizationAccountAccessRole(
            account,
            opts
          );
        })
      )
    );
    results = results.concat(
      assumeOrganizationAccountAccessRolePolicies(
        unit.subOrganizationalUnits,
        opts
      )
    );
  }
  return results;
}
