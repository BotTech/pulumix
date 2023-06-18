import * as pulumi from "@pulumi/pulumi";
import { Input, Output } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import * as kms from "./kms";
import * as mfa from "./mfa";
import * as s3 from "./s3";

export { kms, mfa, s3 };

export function merge(
  a?: Input<aws.iam.Conditions>,
  b?: Input<aws.iam.Conditions>
): Output<aws.iam.Conditions> | undefined {
  if (a) {
    if (b) {
      return pulumi.all([a, b]).apply(([a2, b2]) => {
        const result: aws.iam.Conditions = { ...a2 };
        for (const key in b2) {
          const aOperator = a2[key];
          const bOperator = b2[key];
          if (aOperator !== undefined) {
            result[key] = mergeOperator(aOperator, bOperator);
          }
        }
        return result;
      });
    } else {
      return pulumi.output(a);
    }
  } else if (b) {
    return pulumi.output(b);
  } else {
    return undefined;
  }
}

function mergeOperator(
  a: aws.iam.ConditionArguments,
  b?: aws.iam.ConditionArguments
): aws.iam.ConditionArguments {
  if (b) {
    const result = { ...a };
    for (const key in b) {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue !== undefined) {
        result[key] = mergeValue(aValue, bValue);
      }
    }
    return result;
  } else {
    return a;
  }
}

type Value = Input<string> | Input<Input<string>[]>;

function mergeValue(a: Value, b?: Value): Value | Output<string[]> {
  if (b) {
    return pulumi.all([a, b]).apply(([a2, b2]) => {
      if (typeof a2 === "string") {
        if (typeof b2 === "string") {
          return [a2, b2];
        } else {
          return [a2, ...b2];
        }
      } else {
        if (typeof b2 === "string") {
          return [...a2, b2];
        } else {
          return [...a2, ...b2];
        }
      }
    });
  } else {
    return a;
  }
}
