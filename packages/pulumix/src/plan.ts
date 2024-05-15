import { DeploymentResourcePlan, PulumiPlan } from "~/types/plan";
import * as planSchema from "./plan.json";
import fs from "fs/promises";
import Ajv2020 from "ajv/dist/2020";

const ajv = new Ajv2020({
  formats: {
    "date-time": true,
  },
  loadSchema: async (uri) => {
    const text = await fs.readFile(uri, "utf8");
    return JSON.parse(text);
  },
});

export async function parsePlan(path: string): Promise<PulumiPlan | undefined> {
  const parser =
    ajv.getSchema<PulumiPlan>(planSchema.$id) ??
    ajv.compile<PulumiPlan>(planSchema);
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
