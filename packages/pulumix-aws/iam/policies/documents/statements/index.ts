import * as conditions from "./conditions";
import { IAMAccessPatterns } from "./iam";
import { KMSAccessPatterns } from "./kms";
import * as principals from "./principals";
import * as resources from "./resources";
import * as statements from "./statements";
import * as vpc from "./vpc";

export * from "./statements";
export { conditions, principals, resources, vpc };

export const acm = new statements.AccessPatterns("ACM", "acm");

export const apiGateway = new statements.AccessPatterns(
  "APIGateway",
  "apigateway"
);

export const autoScaling = new statements.AccessPatterns(
  "AutoScaling",
  "autoscaling"
);

export const cloudFront = new statements.AccessPatterns(
  "CloudFront",
  "cloudfront"
);

export const cloudTrail = new statements.AccessPatterns(
  "CloudTrail",
  "cloudtrail"
);

export const cloudWatch = new statements.AccessPatterns(
  "CloudWatch",
  "cloudwatch"
);

export const codeBuild = new statements.AccessPatterns(
  "CodeBuild",
  "codebuild"
);

export const codeDeploy = new statements.AccessPatterns(
  "CodeDeploy",
  "codedeploy"
);

export const codePipeline = new statements.AccessPatterns(
  "CodePipeline",
  "codepipeline"
);

export const codeStarConnections = new statements.AccessPatterns(
  "CodeStarConnections",
  "codestar-connections"
);

export const ec2 = new statements.AccessPatterns("EC2", "ec2");

export const ecs = new statements.AccessPatterns("ECS", "ecs");

export const elasticLoadBalancing = new statements.AccessPatterns(
  "ELB",
  "elasticloadbalancing"
);

export const events = new statements.AccessPatterns("Events", "events");

export const firehose = new statements.AccessPatterns("Firehose", "firehose");

export const iam = new IAMAccessPatterns();

export const kms = new KMSAccessPatterns();

export const lambda = new statements.AccessPatterns("Lambda", "lambda");

export const logs = new statements.AccessPatterns("Logs", "logs");

export const organizations = new statements.AccessPatterns(
  "Organizations",
  "organizations"
);

export const route53 = new statements.AccessPatterns("Route53", "route53");

export const s3 = new statements.AccessPatterns("S3", "s3");

export const secretsManager = new statements.AccessPatterns(
  "SecretsManager",
  "secretsmanager"
);

export const ssm = new statements.AccessPatterns("SSM", "ssm");

export const tiros = new statements.AccessPatterns("Tiros", "tiros");
