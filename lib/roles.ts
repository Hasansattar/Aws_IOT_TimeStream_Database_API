import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class LambdaRole extends Construct {
  public readonly lambdaRole: iam.Role;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.lambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    this.lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
    );
    this.lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonTimestreamFullAccess")
    );

    const appsyncPolicy = new iam.Policy(this, "AppSyncPolicy", {
      statements: [
        new iam.PolicyStatement({
          actions: [
            "appsync:GraphQL",
            "appsync:StartSchemaCreation",
            "appsync:CreateGraphqlApi",
            "appsync:UpdateGraphqlApi",
            "appsync:DeleteGraphqlApi",
            "appsync:GetGraphqlApi",
            "appsync:ListGraphqlApis",
            "appsync:ListApiKeys",
          ],
          resources: ["*"],
        }),
      ],
    });

    this.lambdaRole.attachInlinePolicy(appsyncPolicy);


    const emailPolicy = new iam.Policy(this, "SesEmailPolicy", {
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ses:SendEmail", "ses:SendRawEmail", "logs:*"],
          resources: ['*']
        }),
      ],
    });
    
    this.lambdaRole.attachInlinePolicy(emailPolicy);
  }
}
