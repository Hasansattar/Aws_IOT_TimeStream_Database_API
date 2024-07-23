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
import {DynamoDatabase} from '../../dynamodb';

export interface  QueryX01PressureIntakeLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryX01PressureIntakeLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi,  dynamo:DynamoDatabase, db: TimestreamDatabase, role: LambdaRole,props:QueryX01PressureIntakeLambdaProps) {
    super(scope, id);
    const config = props.config;
     
    

    const queryx01PressureIntakeLambda = new lambda.Function(this, `${config.stage}-Queryx01PressureIntakeLambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "getStatusPressureIntakex01.handler",
      code: lambda.Code.fromAsset("lambda-fn/lambda-query-data"),
      environment: {
        TABLE_NAME: dynamo.DynamoTable.tableName,
        TS_DATABASE_NAME: db.timeStreamDB,
        TS_TABLE_NAME: db.tableName,
        APPSYNC_API_ID: api.graphQLApi.apiId,
        APPSYNC_API_KEY: api.graphQLApi.apiKey!,
        TO_EMAIL_ADDRESS: config.emailAddress
      },
  
      role: role.lambdaRole,
      timeout: cdk.Duration.minutes(5),
    });

    dynamo.DynamoTable.grantReadData(queryx01PressureIntakeLambda);
  
    // AppSync Data Source
    const lambdaDsx01PressureIntake = api.graphQLApi.addLambdaDataSource(
      "querylambdaDsx01PressureIntakeOperation",
      queryx01PressureIntakeLambda
    );
     
      // Resolver for Query Data
      lambdaDsx01PressureIntake.createResolver("createResolvergetx01PressureIntakeLambdaData", {
      typeName: "Query",
      fieldName: "getStatusPressureIntakex01",
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
              $utils.toJson($ctx.result)
         #end`
  ),
    });


  
    queryx01PressureIntakeLambda.addPermission("EventBridgeInvoke", {
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
    });
  
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "rulequeryx01PressureIntakeLambda", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(11)),
      targets: [new targets.LambdaFunction(queryx01PressureIntakeLambda)],
    });
    
     
     

  }
}
