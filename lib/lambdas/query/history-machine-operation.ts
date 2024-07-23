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


export interface  QueryHistoryMachineOperationLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}

export class QueryHistoryMachineOperationLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole,props:QueryHistoryMachineOperationLambdaProps) {
    super(scope, id);


    const config = props.config;
 

    const queryHistoryMachineOperationLambda = new lambda.Function(this, `${config.stage}-QueryHistoryMachineOperationLambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "machineHistoryOperation.handler",
      code: lambda.Code.fromAsset("lambda-fn/lambda-query-data"),
      environment: {
        TS_DATABASE_NAME: db.timeStreamDB,
        TS_TABLE_NAME: db.tableName,
        APPSYNC_API_ID: api.graphQLApi.apiId,
        APPSYNC_API_KEY:api.graphQLApi.apiKey!,
        TO_EMAIL_ADDRESS: config.emailAddress
      },
  
      role: role.lambdaRole,
      timeout: cdk.Duration.minutes(5),
    });
  
    // AppSync Data Source
    const lambdaDsHistoryMachineOperation = api.graphQLApi.addLambdaDataSource(
      "querylambdaDsHistoryMachineOperation",
      queryHistoryMachineOperationLambda
    );
     
      // Resolver for Query Data
      lambdaDsHistoryMachineOperation.createResolver("createResolvergetHistoryMachineOperationLambdaData", {
      typeName: "Query",
      fieldName: "getMachineHistoryOperationData",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
                "interval": "$ctx.args.interval",
                "limit": "$ctx.args.limit"
              }
           
          
          
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

     
       
    queryHistoryMachineOperationLambda.addPermission("EventBridgeInvoke", {
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
    });
  
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "rulequeryHistoryMachineOperationLambda", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(11)),
      targets: [new targets.LambdaFunction(queryHistoryMachineOperationLambda)],
    });
    

  }
}
