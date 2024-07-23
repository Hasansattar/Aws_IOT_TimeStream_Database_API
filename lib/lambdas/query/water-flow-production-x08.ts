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


export interface  QueryWaterFlowProductionx08LambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryWaterFlowProductionx08Lambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole,props:QueryWaterFlowProductionx08LambdaProps) {
    super(scope, id);
    const config = props.config;

 
    const queryWaterFlowProductionx08Lambda = new lambda.Function(this, `${config.stage}-QueryWaterFlowProductionx08Lambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "waterFlowProductionx08.handler",
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
    const lambdaDsWaterFlowProductionx08 = api.graphQLApi.addLambdaDataSource(
      "queryWaterFlowProductionx08Datasource",
      queryWaterFlowProductionx08Lambda
    );

    
     
      // Resolver for Query Data
      lambdaDsWaterFlowProductionx08.createResolver("createResolvergetsWaterFlowProductionx08Data", {
      typeName: "Query",
      fieldName: "getWaterFlowProductionX08",
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
         
          $utils.toJson($ctx.result)
          
         #end`
  ),
    });

    
     

  }
}
