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
//import {config} from '../../config/config';
import {DynamoDatabase} from '../../dynamodb';

export interface  QueryStatusOperationLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryStatusOperationLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi,  dynamo:DynamoDatabase,db: TimestreamDatabase, role: LambdaRole,props:QueryStatusOperationLambdaProps) {
    super(scope, id);

    const config = props.config;


    const queryStatusOperationLambda = new lambda.Function(this, `${config.stage}-QueryStatusOperationLambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "getStatusOperation.handler",
      code: lambda.Code.fromAsset("lambda-fn/lambda-query-data"),
      environment: {
        TABLE_NAME: dynamo.DynamoTable.tableName,
        TS_DATABASE_NAME: db.timeStreamDB,
        TS_TABLE_NAME: db.tableName,
        APPSYNC_API_ID: api.graphQLApi.apiId,
        APPSYNC_API_KEY:api.graphQLApi.apiKey!,
        TO_EMAIL_ADDRESS: config.emailAddress
      },
  
      role: role.lambdaRole,
      timeout: cdk.Duration.minutes(5),
    });

    dynamo.DynamoTable.grantReadData(queryStatusOperationLambda);
  
    // AppSync Data Source
    const lambdaDsStatusOperation = api.graphQLApi.addLambdaDataSource(
      "querylambdaDsStatusOperationOperation",
      queryStatusOperationLambda
    );
     
      // Resolver for Query Data
      lambdaDsStatusOperation.createResolver("createResolvergetStatusOperationLambdaData", {
      typeName: "Query",
      fieldName: "getStatusOperation",
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

     
     
    queryStatusOperationLambda.addPermission("EventBridgeInvoke", {
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
    });
  
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "rulequeryStatusOperationLambda", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(11)),
      targets: [new targets.LambdaFunction(queryStatusOperationLambda)],
    });
  }
}
