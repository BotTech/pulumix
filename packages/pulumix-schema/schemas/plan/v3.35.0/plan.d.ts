/**
 * JSON schema for Pulumi deployment plan types
 */
export interface DeploymentPlan {
  config?: Map;
  manifest: ManifestV1;
  resourcePlans?: {
    [k: string]: ResourcePlanV1;
  };
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "Map".
 */
export interface Map {
  [k: string]: Value;
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "Value".
 */
export interface Value {}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "ManifestV1".
 */
export interface ManifestV1 {
  magic: string;
  plugins?: PluginInfoV1[];
  time: string;
  version: string;
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "PluginInfoV1".
 */
export interface PluginInfoV1 {
  name: string;
  path: string;
  type: string;
  version: string;
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "ResourcePlanV1".
 */
export interface ResourcePlanV1 {
  goal?: GoalV1;
  state: {
    [k: string]: unknown;
  };
  steps?: string[];
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "GoalV1".
 */
export interface GoalV1 {
  additionalSecretOutputs?: string[];
  aliases?: Alias[];
  checkedInputs?: {
    [k: string]: unknown;
  };
  custom: boolean;
  customTimeouts?: CustomTimeouts;
  deleteBeforeReplace?: boolean;
  dependencies?: string[];
  id?: string;
  ignoreChanges?: string[];
  inputDiff?: PlanDiffV1;
  name: string;
  outputDiff?: PlanDiffV1;
  parent?: string;
  propertyDependencies?: {
    [k: string]: string[];
  };
  protect: boolean;
  provider?: string;
  type: string;
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "Alias".
 */
export interface Alias {
  name?: string;
  noParent?: boolean;
  parent?: string;
  project?: string;
  stack?: string;
  type?: string;
  urn?: string;
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "CustomTimeouts".
 */
export interface CustomTimeouts {
  create?: number;
  delete?: number;
  update?: number;
}
/**
 * This interface was referenced by `DeploymentPlan`'s JSON-Schema
 * via the `definition` "PlanDiffV1".
 */
export interface PlanDiffV1 {
  adds?: {
    [k: string]: unknown;
  };
  deletes?: string[];
  updates?: {
    [k: string]: unknown;
  };
}
