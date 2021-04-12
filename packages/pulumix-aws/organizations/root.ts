import { mapValues, tagged } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { iam } from "../index";

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

export interface RootAccountArgs {
  administratorUsers: Record<string, AdministratorUserArgs>;
  minimumPasswordLength?: pulumi.Input<number>;
  organizationName: string;
  organizationalUnits: Record<string, OrganizationalUnitArg>;
}

export class RootAccount extends pulumi.ComponentResource {
  administratorsGroup: aws.iam.Group;
  everyoneGroup: aws.iam.Group;

  constructor(args: RootAccountArgs, opts?: pulumi.CustomResourceOptions) {
    super("pulumix-aws:accounts:Root", args.organizationName, {}, opts);

    const childOpts = { ...opts, parent: this, protect: true };

    const passwordPolicy = iam.strongAccountPasswordPolicy(
      args.minimumPasswordLength,
      childOpts
    );

    // Policies.

    const adminPolicies = iam.policies.organizationAdministratorPolicies(
      childOpts
    );

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

    iam.attachGroupPolicies(this.everyoneGroup, [enforceMFAPolicy], childOpts);

    this.administratorsGroup = new aws.iam.Group(
      "Administrators",
      { name: "Administrators" },
      childOpts
    );

    iam.attachGroupPolicies(this.administratorsGroup, adminPolicies, childOpts);

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

    const organizationalUnits = organizationalUnitHierarchy(
      organization.roots[0].id,
      args.organizationalUnits,
      childOpts
    );

    const assumeOrgAccountAccessRoles = assumeOrganizationAccountAccessRolePolicies(
      organizationalUnits,
      childOpts
    );

    iam.attachGroupPolicies(
      this.administratorsGroup,
      assumeOrgAccountAccessRoles,
      childOpts
    );

    this.registerOutputs();
  }
}

export interface ProdNonProdSubOrganizationalUnitsArgs {
  NonProd?: Record<string, aws.organizations.AccountArgs>;
  Prod?: Record<string, aws.organizations.AccountArgs>;
}

export function prodNonProdSubOrganizationalUnits(
  subOrganizationalUnits: ProdNonProdSubOrganizationalUnitsArgs
): Record<string, OrganizationalUnitArg> {
  return mapValues(subOrganizationalUnits, (accounts) => {
    return { accounts: accounts };
  });
}

export function prodNonProdOrganizationalUnit(
  name: string,
  subOrganizationalUnits: ProdNonProdSubOrganizationalUnitsArgs
): Record<string, OrganizationalUnitArg> {
  return {
    [name]: {
      subOrganizationlUnits: prodNonProdSubOrganizationalUnits(
        subOrganizationalUnits
      ),
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
  return prodNonProdSubOrganizationalUnits({
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
  });
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
  return prodNonProdSubOrganizationalUnits({
    Prod: {
      [prodName]: {
        email: email(prodName, true),
      },
    },
  });
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
  parentId: pulumi.Input<string>,
  accounts?: Record<string, aws.organizations.AccountArgs>,
  opts?: pulumi.CustomResourceOptions
): Record<string, aws.organizations.Account> {
  return mapValues(accounts, (account, name) => {
    return new aws.organizations.Account(
      name,
      tagged({
        ...account,
        parentId: parentId,
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
  parentId: pulumi.Input<string>,
  args: Record<string, OrganizationalUnitArg> | undefined,
  opts: pulumi.CustomResourceOptions
): Record<string, OrganizationalUnitResult> {
  return mapValues(args, (unit, name) => {
    const organizationalUnit = new aws.organizations.OrganizationalUnit(
      name,
      {
        name: name,
        parentId: parentId,
      },
      opts
    );
    return {
      accounts: organizationalUnitAccounts(
        organizationalUnit.id,
        unit.accounts,
        opts
      ),
      organizationalUnit: organizationalUnit,
      subOrganizationalUnits: organizationalUnitHierarchy(
        organizationalUnit.id,
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
        mapValues(unit.accounts, (account, accountName) => {
          return iam.policies.organizations.assumeOrganizationAccountAccessRole(
            {
              id: account.id,
              name: accountName,
            },
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
