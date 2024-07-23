import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from "aws-cdk-lib/aws-iam";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

import { GraphQLApi } from '../../graphql-api';
import { TimestreamDatabase } from '../../database';
import { LambdaRole } from '../../roles';

export class FlowCheckWaterForProductionAndDistributionLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole) {
    super(scope, id);

    const checkWaterForProductionAndDistributionPerDay = new lambda.Function(
      this,
      "checkWaterForProductionAndDistributionPerDay",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "perDayCheckWaterProductionAndDistribution.handler",
        code: lambda.Code.fromAsset("lambda-fn/lambda-mutation-data/lambda-water-production-distribution"),
        environment: {
          TS_DATABASE_NAME: db.timeStreamDB,
          TS_TABLE_NAME: db.tableName,
          APPSYNC_API_ID: api.graphQLApi.apiId,
          APPSYNC_API_KEY: api.graphQLApi.apiKey!,
          APPSYNC_API_ENDPOINT: api.graphQLApi.graphqlUrl,
        },
        role: role.lambdaRole,
        timeout: cdk.Duration.minutes(5),
      }
    );

    const lambdaDscheckWaterForProductionAndDistributionPerDay = api.graphQLApi.addLambdaDataSource(
      "lambdaDscheckWaterForProductionAndDistributionPerDay",
      checkWaterForProductionAndDistributionPerDay
    );

    // Resolver for Mutation
    lambdaDscheckWaterForProductionAndDistributionPerDay.createResolver(
      "createResolverMutationWaterProductionAndDistributionPerDay",
      {
        typeName: "Mutation",
        fieldName: "updateWaterProductionAndDistribution",
        requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "Invoke",
          "payload": {
             "x04Input": {
               "waterDistributionX04PerDay": "$ctx.arguments.input.x04Input.waterDistributionX04PerDay",
               "waterDistributionX04PerWeek": "$ctx.arguments.input.x04Input.waterDistributionX04PerWeek",
               "waterDistributionX04PerMonth": "$ctx.arguments.input.x04Input.waterDistributionX04PerMonth",
               "waterDistributionX04PerYear": "$ctx.arguments.input.x04Input.waterDistributionX04PerYear",
               "waterDistributionX04Current": "$ctx.arguments.input.x04Input.waterDistributionX04Current",
               "waterDistributionX04Recent24Hours": "$ctx.arguments.x04Input.input.waterDistributionX04Recent24Hours",
               "waterDistributionHistoryX04PerDay":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerDay),

               "waterDistributionHistoryX04PerWeek":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerWeek),
               "waterDistributionHistoryX04PerMonth":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerMonth),
               "waterDistributionHistoryX04PerYear":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerYear)
                
                
               },
             "x08Input": {

                 "waterProductionX08PerDay": "$ctx.arguments.input.x08Input.waterProductionX08PerDay",
              
                  "waterProductionX08PerWeek": "$ctx.arguments.input.x08Input.waterProductionX08PerWeek",
                  
                  "waterProductionX08PerMonth": "$ctx.arguments.input.x08Input.waterProductionX08PerMonth",
                  
                  "waterProductionX08PerYear": "$ctx.arguments.input.x08Input.waterProductionX08PerYear",
                  
                  "waterProductionX08Current": "$ctx.arguments.input.x08Input.waterProductionX08Current",
                  
                   "waterProductionX08Recent24Hours": "$ctx.arguments.input.x08Input.waterProductionX08Recent24Hours",
                   "waterProductionHistoryX08PerDay": $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerDay),

                   "waterProductionHistoryX08PerWeek": $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerWeek),
                   "waterProductionHistoryX08PerMonth": $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerMonth),
                   "waterProductionHistoryX08PerYear": $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerYear)
                   
                  }
          
        
        
           }
          
        }
      `),

      responseMappingTemplate: appsync.MappingTemplate.fromString(
        `#if($ctx.error)
          $util.error($ctx.error.message, $ctx.error.type)
         #else
         {
          "x04": 
                {
                 "waterDistributionX04PerDay": "$ctx.arguments.input.x04Input.waterDistributionX04PerDay",
                 "waterDistributionX04PerWeek": "$ctx.arguments.input.x04Input.waterDistributionX04PerWeek",
                 "waterDistributionX04PerMonth": "$ctx.arguments.input.x04Input.waterDistributionX04PerMonth",
                 "waterDistributionX04PerYear": "$ctx.arguments.input.x04Input.waterDistributionX04PerYear",
                 "waterDistributionX04Current": "$ctx.arguments.input.x04Input.waterDistributionX04Current",
                 "waterDistributionX04Recent24Hours": "$ctx.arguments.input.x04Input.waterDistributionX04Recent24Hours",
                 "waterDistributionHistoryX04PerDay":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerDay),

                 "waterDistributionHistoryX04PerWeek":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerWeek),
                 "waterDistributionHistoryX04PerMonth":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerMonth),
                 "waterDistributionHistoryX04PerYear":  $utils.toJson($ctx.arguments.input.x04Input.waterDistributionHistoryX04PerYear)
                
                },
          "x08": 
                {

                 "waterProductionX08PerDay": "$ctx.arguments.input.x08Input.waterProductionX08PerDay",
                 "waterProductionX08PerWeek": "$ctx.arguments.input.x08Input.waterProductionX08PerWeek",
                 "waterProductionX08PerMonth": "$ctx.arguments.input.x08Input.waterProductionX08PerMonth",
                 "waterProductionX08PerYear": "$ctx.arguments.input.x08Input.waterProductionX08PerYear",
                 "waterProductionX08Current": "$ctx.arguments.input.x08Input.waterProductionX08Current",
                 "waterProductionX08Recent24Hours": "$ctx.arguments.input.x08Input.waterProductionX08Recent24Hours",
                 "waterProductionHistoryX08PerDay":  $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerDay),
                 "waterProductionHistoryX08PerWeek": $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerWeek),
                 "waterProductionHistoryX08PerMonth": $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerMonth),
                 "waterProductionHistoryX08PerYear": $utils.toJson($ctx.arguments.input.x08Input.waterProductionHistoryX08PerYear)
                 
                  
                 
                }
          
         
         
         }
          
         #end`
      ),
        
      }
    );


     // Add permission for EventBridge to invoke the detect Lambda function
     checkWaterForProductionAndDistributionPerDay.addPermission(
      "EventBridgeInvokecheckWaterProductionAndDistributionPerDay",
      {
        principal: new iam.ServicePrincipal("events.amazonaws.com"),
        sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
      }
    );

    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "ruleCheckWaterProductinDistribution", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      targets: [new targets.LambdaFunction(checkWaterForProductionAndDistributionPerDay)],
    });
       


  }
}
