import { mapValues, tagged } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { iam } from "../index";

export interface AdministratorUserArgs {
  pgpKey: string;
}

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

  constructor(
    name: string,
    args?: RootAccountArgs,
    opts?: pulumi.CustomResourceOptions
  ) {
    super("pulumix-aws:accounts:Root", name, {}, opts);

    const childOpts = { ...opts, parent: this };

    const passwordPolicy = iam.strongAccountPasswordPolicy(
      args?.minimumPasswordLength,
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

    iam.attachGroupPolicies(
      this.everyoneGroup.name,
      [enforceMFAPolicy],
      childOpts
    );

    this.administratorsGroup = new aws.iam.Group(
      "Administrators",
      { name: "Administrators" },
      childOpts
    );

    iam.attachGroupPolicies(
      this.administratorsGroup.name,
      adminPolicies,
      childOpts
    );

    // Users.

    mapValues(args?.administratorUsers, (name, user) => {
      return new iam.User(
        name,
        {
          allUsersGroupName: this.everyoneGroup.name,
          groupNames: [this.administratorsGroup.name],
          passwordLength: passwordPolicy.minimumPasswordLength.apply(
            (length) => length ?? iam.DefaultPasswordLength
          ),
          pgpKey: user.pgpKey,
        },
        childOpts
      );
    });

    // Organizational Units.

    const organization = new aws.organizations.Organization(
      args?.organizationName ?? name,
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
      args?.organizationalUnits,
      childOpts
    );

    const assumeOrgAccountAccessRoles = assumeOrganizationAccountAccessRolePolicies(
      organizationalUnits,
      childOpts
    );

    iam.attachGroupPolicies(
      this.administratorsGroup.name,
      assumeOrgAccountAccessRoles,
      childOpts
    );

    this.registerOutputs();
  }
}

function organizationalUnitAccounts(
  parentId: pulumi.Input<string>,
  accounts?: Record<string, aws.organizations.AccountArgs>,
  opts?: pulumi.CustomResourceOptions
): Record<string, aws.organizations.Account> {
  return mapValues(accounts, (name, acc) => {
    return new aws.organizations.Account(
      name,
      tagged({
        ...acc,
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
  return mapValues(args, (name, unit) => {
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
      Object.values(unit.accounts).map((account) => {
        return iam.policies.organizations.assumeOrganizationAccountAccessRole(
          account,
          opts
        );
      })
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
