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
import {DynamoDatabase} from '../../dynamodb'


export interface  QueryStatusBarx07AndX05LambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryStatusBarx07AndX05Lambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, dynamo:DynamoDatabase ,db: TimestreamDatabase, role: LambdaRole,props:QueryStatusBarx07AndX05LambdaProps) {
    super(scope, id);


    const config = props.config;


    const queryStatusBarLambda = new lambda.Function(this, `${config.stage}-QueryStatusBarx07AndX05Lambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "getStatusBarx07AndX05.handler",
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

    dynamo.DynamoTable.grantReadData(queryStatusBarLambda);
  
    // AppSync Data Source
    const lambdaDsStatusBar = api.graphQLApi.addLambdaDataSource(
      "querylambdaDsStatusBarOperation",
      queryStatusBarLambda
    );
     
      // Resolver for Query Data
      lambdaDsStatusBar.createResolver("createResolverhasangetstatusbar-LambdaData", {
      typeName: "Query",
      fieldName: "getStatusBarX07AndX05",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
                "port": "$ctx.args.port"
              }
           
          
          
          }
      `),
  
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        `#if($ctx.error)
          $util.error($ctx.error.message, $ctx.error.type)
         #else
           {
              "time_interval": "$ctx.result.time_interval",  
              "pressure_bar_difference": "$ctx.result.pressure_bar_difference",  
              "status_alert": "$ctx.result.status_alert"  
           }
              
         #end`
  ),
    });

   
    queryStatusBarLambda.addPermission("EventBridgeInvoke", {
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
    });
  
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "rulequeryStatusBarLambda", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(11)),
      targets: [new targets.LambdaFunction(queryStatusBarLambda)],
    });
    
     
     

  }
}
