import * as pulumi from "@pulumi/pulumi";
import * as policy from "@pulumi/policy";

import { TAGGABLE_TYPES } from "./taggable-types";
export * from "./taggable-types";

export type Tags = Record<string, string>;

export type TaggableProps = Omit<
  Pick<policy.ResourceValidationArgs, "props">,
  "tags"
> & {
  tags?: Tags;
};

export type TaggableResourceValidationArgs = Omit<
  policy.ResourceValidationArgs,
  "props"
> & {
  props: TaggableProps;
};

export function isTaggableResourceValidation(
  args: policy.ResourceValidationArgs,
): args is TaggableResourceValidationArgs {
  return TAGGABLE_TYPES.includes(args.type);
}

export type TagsInput = pulumi.Input<{
  [key: string]: pulumi.Input<string>;
}>;

export type TaggableInputProps = Omit<
  Pick<pulumi.ResourceTransformationArgs, "props">,
  "tags"
> & {
  tags?: TagsInput;
};

export type TaggableResourceTransformationArgs = Omit<
  pulumi.ResourceTransformationArgs,
  "props"
> & {
  props: TaggableInputProps;
};

export function isTaggableResourceTransformation(
  args: pulumi.ResourceTransformationArgs,
): args is TaggableResourceTransformationArgs {
  return TAGGABLE_TYPES.includes(args.type);
}

export function appendTagsToProps(
  props: TaggableInputProps,
  tags: TagsInput,
): TaggableInputProps {
  return {
    ...props,
    tags: pulumi.all([props.tags, tags]).apply(([existingTags, tags]) => {
      return { ...existingTags, ...tags };
    }),
  };
}

export function registerAppendTagsTransformation(tags: TagsInput): void {
  pulumi.runtime.registerStackTransformation((args) => {
    if (isTaggableResourceTransformation(args)) {
      return { props: appendTagsToProps(args.props, tags), opts: args.opts };
    }
    return;
  });
}
