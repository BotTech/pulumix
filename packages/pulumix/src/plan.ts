import { PulumiPlan } from "~/types/plan";
import Ajv, { ValidateFunction } from "ajv";
import * as planSchema from "./plan.json";
import fs from "fs/promises";
import type { JSONSchemaType } from "ajv/lib/types/json-schema";

const ajv = new Ajv();

const parserPromise: Promise<ValidateFunction<PulumiPlan>> =
  ajv.compileAsync<PulumiPlan>(planSchema as JSONSchemaType<PulumiPlan>);

export async function parsePlan(path: string): Promise<PulumiPlan> {
  const parser = await parserPromise;
  const data = await fs.readFile(path, "utf8");
  const plan = JSON.parse(data);
  const valid = parser(plan);
  if (!valid) {
    throw `Invalid plan: ${parser.errors}`;
  }
  return plan;
}
