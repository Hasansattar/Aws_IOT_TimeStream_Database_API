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


export interface  QueryTankLevelHistoryMinMaxAvgUsingDateLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryTankLevelHistoryMinMaxAvgUsingDateLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole,props:QueryTankLevelHistoryMinMaxAvgUsingDateLambdaProps) {
    super(scope, id);

    const config = props.config;

    const queryTankLevelHistoryMinMaxAvgUsingDateLambda = new lambda.Function(this, `${config.stage}-QueryTankLevelHistoryMinMaxAvgUsingDateLambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "tankLevelHistoryHighLowAvgUsingDate.handler",
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
    const lambdaDsTankLevelHistoryMinMaxAvgUsingDate = api.graphQLApi.addLambdaDataSource(
      "querylambdaDsTankLevelHistoryMinMaxAvgUsingDateOperation",
      queryTankLevelHistoryMinMaxAvgUsingDateLambda
    );
     
      // Resolver for Query Data
      lambdaDsTankLevelHistoryMinMaxAvgUsingDate.createResolver("createResolvergetTankLevelHistoryMinMaxAvgUsingDateLambdaData", {
      typeName: "Query",
      fieldName: "getTankLevelHistoryMaxMinAvgUsingDate",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
                "date": "$ctx.args.date"
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
