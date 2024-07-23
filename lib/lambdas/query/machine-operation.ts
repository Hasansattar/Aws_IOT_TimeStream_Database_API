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



export interface  QueryMachineOperationLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}

export class QueryMachineOperationLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole,props:QueryMachineOperationLambdaProps) {
    super(scope, id);
   

    const config = props.config;
 
    const queryMachineOperationLambda = new lambda.Function(this, `${config.stage}-QueryMachineOperationLambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "machineOperation.handler",
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
    const lambdaDsMachineOperation = api.graphQLApi.addLambdaDataSource(
      "querylambdaDsMachineOperation",
      queryMachineOperationLambda
    );
     
      // Resolver for Query Data
      lambdaDsMachineOperation.createResolver("createResolvergetMachineOperationLambdaData", {
      typeName: "Query",
      fieldName: "getMachineOperationData",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
                "interval": "$ctx.args.interval"
               
              }
           
          
          
          }
      `),
  
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        `#if($ctx.error)
          $util.error($ctx.error.message, $ctx.error.type)
         #else
             {
              "Flow_Lpmin_status": "$ctx.result[0].Flow_Lpmin_status",
              "Machine1": "$ctx.result[0].Machine1",
              "time_interval": "$ctx.result[0].time_interval"
              
              }
         #end`
  ),
    });

   
    queryMachineOperationLambda.addPermission("EventBridgeInvoke", {
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
    });
  
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "rulequeryMachineOperationLambda", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(11)),
      targets: [new targets.LambdaFunction(queryMachineOperationLambda)],
    });
    
     
     

  }
}
