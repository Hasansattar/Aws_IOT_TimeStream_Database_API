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
import {config} from '../../config/config';


export interface  QueryWaterDistributionAndProductionLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryWaterDistributionAndProductionLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole,props:QueryWaterDistributionAndProductionLambdaProps) {
    super(scope, id);

    const config = props.config;


 
    const queryWaterDistributionAndProductionLambda = new lambda.Function(this, `${config.stage}-QueryWaterDistributionAndProductionLambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "waterDistributionAndProduction.handler",
      code: lambda.Code.fromAsset("lambda-fn/lambda-query-data"),
      environment: {
        TS_DATABASE_NAME: db.timeStreamDB,
        TS_TABLE_NAME: db.tableName,
        APPSYNC_API_ID: api.graphQLApi.apiId,
        APPSYNC_API_KEY: api.graphQLApi.apiKey!,
        TO_EMAIL_ADDRESS: config.emailAddress
      },

      role: role.lambdaRole,
      timeout: cdk.Duration.minutes(5),
    });

    // AppSync Data Source
    const lambdaDsWaterDistributionAndProduction = api.graphQLApi.addLambdaDataSource(
      "queryWaterDistributionAndProductionLambdaDatasource",
      queryWaterDistributionAndProductionLambda
    );
     
      // Resolver for Query Data
      lambdaDsWaterDistributionAndProduction.createResolver("createResolvergetWaterDistributionAndProductionData", {
      typeName: "Query",
      fieldName: "getFlowWaterProductionAndDistribution",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
          {
            "version": "2018-05-29",
            "operation": "Invoke",
              
          
          }
      `),

      responseMappingTemplate: appsync.MappingTemplate.fromString(
        `#if($ctx.error)
          $util.error($ctx.error.message, $ctx.error.type)
         #else
         {
          "x04": 
                {
                 "waterDistributionX04CurrentFlowLpmin": "$ctx.result.x04Input.waterDistributionX04CurrentFlowLpmin",
                 "waterDistributionX04PerDay": "$ctx.result.x04Input.waterDistributionX04PerDay",
                 "waterDistributionX04PerWeek": "$ctx.result.x04Input.waterDistributionX04PerWeek",
                 "waterDistributionX04PerMonth": "$ctx.result.x04Input.waterDistributionX04PerMonth",
                 "waterDistributionX04PerYear": "$ctx.result.x04Input.waterDistributionX04PerYear",
                 "waterDistributionX04Current": "$ctx.result.x04Input.waterDistributionX04Current",
                 "waterDistributionX04Recent24Hours": "$ctx.result.x04Input.waterDistributionX04Recent24Hours",
                 "waterDistributionHistoryX04PerDay":  $utils.toJson($ctx.result.x04Input.waterDistributionHistoryX04PerDay),
                 "waterDistributionHistoryX04PerWeek":  $utils.toJson($ctx.result.x04Input.waterDistributionHistoryX04PerWeek),
                 "waterDistributionHistoryX04PerMonth":  $utils.toJson($ctx.result.x04Input.waterDistributionHistoryX04PerMonth),
                 "waterDistributionHistoryX04PerYear":  $utils.toJson($ctx.result.x04Input.waterDistributionHistoryX04PerYear)
                
                },
          "x08": 
                {
                 "waterProductionX08CurrentFlowLpmin": "$ctx.result.x08Input.waterProductionX08CurrentFlowLpmin",
                 "waterProductionX08PerDay": "$ctx.result.x08Input.waterProductionX08PerDay",
                 "waterProductionX08PerWeek": "$ctx.result.x08Input.waterProductionX08PerWeek",
                 "waterProductionX08PerMonth": "$ctx.result.x08Input.waterProductionX08PerMonth",
                 "waterProductionX08PerYear": "$ctx.result.x08Input.waterProductionX08PerYear",
                 "waterProductionX08Current": "$ctx.result.x08Input.waterProductionX08Current",
                 "waterProductionX08Recent24Hours": "$ctx.result.x08Input.waterProductionX08Recent24Hours",
                 "waterProductionHistoryX08PerDay":  $utils.toJson($ctx.result.x08Input.waterProductionHistoryX08PerDay),
                 "waterProductionHistoryX08PerWeek": $utils.toJson($ctx.result.x08Input.waterProductionHistoryX08PerWeek),
                 "waterProductionHistoryX08PerMonth": $utils.toJson($ctx.result.x08Input.waterProductionHistoryX08PerMonth),
                 "waterProductionHistoryX08PerYear": $utils.toJson($ctx.result.x08Input.waterProductionHistoryX08PerYear)
                 
                  
                 
                }
          
         
         
         }
          
         #end`
  ),
    });

    queryWaterDistributionAndProductionLambda.addPermission("EventBridgeInvoke", {
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
    });
  
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "rulequeryWaterDistributionAndProductionLambda", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(11)),
      targets: [new targets.LambdaFunction(queryWaterDistributionAndProductionLambda)],
    });
     
     

  }
}
