import { TAGGABLE_TYPES } from "./taggable-types";

import * as pulumi from "@pulumi/pulumi";
import { ResourceTransformationArgs } from "@pulumi/pulumi/resource";

export type Tags = pulumi.Input<{
  [key: string]: pulumi.Input<string>;
}>;

export type TaggableProps = {
  tags?: Tags;
};

export type TaggableResourceTransformationArgs = ResourceTransformationArgs & {
  props: TaggableProps;
};

export function isTaggableResourceTransformation(
  args: ResourceTransformationArgs,
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
