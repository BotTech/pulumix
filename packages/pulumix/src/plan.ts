import { getSchema, DeploymentPlanForVersion } from "@bottech/pulumix-schema";
import fs from "fs/promises";
import Ajv2020 from "ajv/dist/2020";
import { version } from "@pulumi/pulumi/version"
import { DeploymentResourcePlan } from "~/types/plan";

const ajv = new Ajv2020({
  formats: {
    "date-time": true,
  },
  loadSchema: async (uri) => {
    const text = await fs.readFile(uri, "utf8");
    return JSON.parse(text);
  },
});

export async function parsePlan(
  path: string,
): Promise<DeploymentPlanForVersion<typeof version>> {
  const planSchema = getSchema(version);
  const parser = ajv.getSchema((planSchema).$id) ??  ajv.compile(planSchema);
  const data = await fs.readFile(path, "utf8");
  const plan = JSON.parse(data);
  const valid = parser(plan);
  if (!valid) {
    throw new Error(`Invalid plan: ${JSON.stringify(parser.errors)}`);
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
