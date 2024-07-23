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


export interface  QueryTankPressureLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryTankPressureLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole,props:QueryTankPressureLambdaProps) {
    super(scope, id);

    const config = props.config;


  const queryTankPressureLambda = new lambda.Function(this, `${config.stage}-QueryTankAndPressureLambda`, {
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: "tankAndPressureData.handler",
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
  const lambdaDsTankPressure = api.graphQLApi.addLambdaDataSource(
    "queryTankPressureLambdaDatasource",
    queryTankPressureLambda
  );
   
    // Resolver for Query Data
    lambdaDsTankPressure.createResolver("createResolvergetTankAndPressureData", {
    typeName: "Query",
    fieldName: "getTankAndPressureData",
    requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "Invoke",
          "payload": {
            "interval": $util.toJson($context.arguments.interval)
          }
        
        
        }
    `),

    responseMappingTemplate: appsync.MappingTemplate.fromString(`
  $utils.toJson($ctx.result)
`),
  });

  queryTankPressureLambda.addPermission("EventBridgeInvoke", {
    principal: new iam.ServicePrincipal("events.amazonaws.com"),
    sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
  });

  // EventBridge Rule to trigger the Lambda function periodically
  new events.Rule(this, "rulequeryTankPressureLambda", {
    schedule: events.Schedule.rate(cdk.Duration.minutes(11)),
    targets: [new targets.LambdaFunction(queryTankPressureLambda)],
  });
  

     
     

  }
}
