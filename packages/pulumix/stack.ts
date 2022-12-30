import { getStack } from "@pulumi/pulumi";
import { LocalWorkspace, Stack } from "@pulumi/pulumi/automation";

let _stack: Promise<Stack> | null = null;

export function currentStack(): Promise<Stack> | null {
  if (_stack) {
    _stack = LocalWorkspace.selectStack({
      stackName: getStack(),
      workDir: ".",
    });
  }
  return _stack;
}
