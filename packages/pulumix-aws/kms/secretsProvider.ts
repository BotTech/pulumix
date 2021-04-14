import { currentStack } from "@bottech/pulumix";
import * as aws from "@pulumi/aws";

async function getKmsKeyId(): Promise<string | undefined> {
  const secretsProvider = await currentStack()?.then(
    (stack) => stack.workspace.secretsProvider
  );
  if (secretsProvider) {
    try {
      const url = new URL(secretsProvider);
      if (url.protocol == "awskms") {
        return `${url.host}${url.pathname}`;
      }
    } catch (e) {
      if (e.code != "ERR_INVALID_URL") {
        throw e;
      }
    }
  }
}

export async function secretsProvider(): Promise<string | undefined> {
  const keyId = await getKmsKeyId();
  if (keyId) {
    const result = await aws.kms.getKey({ keyId: keyId });
    return result.arn;
  }
}
