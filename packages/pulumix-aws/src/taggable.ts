import * as pulumi from "@pulumi/pulumi";

import { TAGGABLE_TYPES } from "./taggable-types";
export * from "./taggable-types";

export type Tags = pulumi.Input<{
  [key: string]: pulumi.Input<string>;
}>;

export type TaggableProps = {
  tags?: Tags;
};

export type TaggableResourceTransformationArgs =
  pulumi.ResourceTransformationArgs & {
    props: TaggableProps;
  };

export function isTaggableResourceTransformation(
  args: pulumi.ResourceTransformationArgs,
): args is TaggableResourceTransformationArgs {
  return TAGGABLE_TYPES.includes(args.type);
}

export function appendTagsToProps(
  props: TaggableProps,
  tags: Tags,
): TaggableProps {
  return {
    ...props,
    tags: pulumi.all([props.tags, tags]).apply(([existingTags, tags]) => {
      return { ...existingTags, ...tags };
    }),
  };
}

export function registerAppendTagsTransformation(tags: Tags): void {
  pulumi.runtime.registerStackTransformation((args) => {
    if (isTaggableResourceTransformation(args)) {
      return { props: appendTagsToProps(args.props, tags), opts: args.opts };
    }
    return;
  });
}
