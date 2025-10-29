import * as conditions from "./conditions";
import { IAMAccessPatterns } from "./iam";
import { KMSAccessPatterns } from "./kms";
import * as principals from "./principals";
import * as s3 from "./s3";
import * as statements from "./statements";
import * as vpc from "./vpc";

export * from "./statements";
export { conditions, principals, s3, vpc };

export const acm: statements.AccessPatterns = new statements.AccessPatterns("ACM", "acm");

export const apiGateway: statements.AccessPatterns = new statements.AccessPatterns(
  "APIGateway",
  "apigateway",
);

export const autoScaling: statements.AccessPatterns = new statements.AccessPatterns(
  "AutoScaling",
  "autoscaling",
);

export const cloudFront: statements.AccessPatterns = new statements.AccessPatterns(
  "CloudFront",
  "cloudfront",
);

export const cloudTrail: statements.AccessPatterns = new statements.AccessPatterns(
  "CloudTrail",
  "cloudtrail",
);

export const cloudWatch: statements.AccessPatterns = new statements.AccessPatterns(
  "CloudWatch",
  "cloudwatch",
);

export const codeBuild: statements.AccessPatterns = new statements.AccessPatterns(
  "CodeBuild",
  "codebuild",
);

export const codeDeploy: statements.AccessPatterns = new statements.AccessPatterns(
  "CodeDeploy",
  "codedeploy",
);

export const codePipeline: statements.AccessPatterns = new statements.AccessPatterns(
  "CodePipeline",
  "codepipeline",
);

export const codeStarConnections: statements.AccessPatterns = new statements.AccessPatterns(
  "CodeStarConnections",
  "codestar-connections",
);

export const ec2: statements.AccessPatterns = new statements.AccessPatterns("EC2", "ec2");

export const ecs: statements.AccessPatterns = new statements.AccessPatterns("ECS", "ecs");

export const elasticLoadBalancing: statements.AccessPatterns = new statements.AccessPatterns(
  "ELB",
  "elasticloadbalancing",
);

export const events: statements.AccessPatterns = new statements.AccessPatterns("Events", "events");

export const firehose: statements.AccessPatterns = new statements.AccessPatterns("Firehose", "firehose");

export const iam: IAMAccessPatterns = new IAMAccessPatterns();

export const kms: KMSAccessPatterns = new KMSAccessPatterns();

export const lambda: statements.AccessPatterns = new statements.AccessPatterns("Lambda", "lambda");

export const logs: statements.AccessPatterns = new statements.AccessPatterns("Logs", "logs");

export const organizations: statements.AccessPatterns = new statements.AccessPatterns(
  "Organizations",
  "organizations",
);

export const route53: statements.AccessPatterns = new statements.AccessPatterns("Route53", "route53");

export const secretsManager: statements.AccessPatterns = new statements.AccessPatterns(
  "SecretsManager",
  "secretsmanager",
);

export const ssm: statements.AccessPatterns = new statements.AccessPatterns("SSM", "ssm");

export const tiros: statements.AccessPatterns = new statements.AccessPatterns("Tiros", "tiros");
