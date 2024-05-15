import { DeploymentResourcePlan, PulumiPlan } from "~/types/plan";
import Ajv, { ValidateFunction } from "ajv";
import * as baseSchema from "./2020-12.json";
import * as planSchema from "./plan.json";
import fs from "fs/promises";
import type { JSONSchemaType } from "ajv/lib/types/json-schema";

const ajv = new Ajv({
  schemas: {
    "https://json-schema.org/draft/2020-12/schema": baseSchema,
  },
  loadSchema: async (uri) => {
    if (uri === "https://json-schema.org/draft/2020-12/schema")
      return baseSchema;
    const text = await fs.readFile(uri, "utf8");
    return JSON.parse(text);
  },
});

const parserPromise: Promise<ValidateFunction<PulumiPlan>> =
  ajv.compileAsync<PulumiPlan>(planSchema as JSONSchemaType<PulumiPlan>);

export async function parsePlan(path: string): Promise<PulumiPlan | undefined> {
  const parser = await parserPromise;
  const data = await fs.readFile(path, "utf8").catch((reason) => {
    if (reason.code === "ENOENT") return undefined;
    else throw reason;
  });
  if (data === undefined) {
    return;
  }
  const plan = JSON.parse(data);
  const valid = parser(plan);
  if (!valid) {
    throw `Invalid plan: ${parser.errors}`;
  }
  return plan;
}

export const resourceChangeSteps: NonNullable<DeploymentResourcePlan["steps"]> =
  // TODO: Which steps to use for a replacement?
  ["create", "update", "replace", "create-replacement"];

export function hasChangeStep(resourcePlan: DeploymentResourcePlan): boolean {
  return (
    resourcePlan.steps?.find((step) => resourceChangeSteps.includes(step)) !==
    undefined
  );
}
