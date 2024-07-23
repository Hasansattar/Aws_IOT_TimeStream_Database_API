import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import * as appsync from 'aws-cdk-lib/aws-appsync';
import { GraphQLApi } from '../../graphql-api';
import { TimestreamDatabase } from '../../database';
import { LambdaRole } from '../../roles';

export class SubscriptionDataLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole) {
    super(scope, id);
     
    
    const subscriptionDataLambda = new lambda.Function(this, "checkSubscriptionDataLambdaa", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "subscriptionData.handler",
      code: lambda.Code.fromAsset("lambda-fn/lambda-subscription-data"),
      environment: {
        TS_DATABASE_NAME: db.timeStreamDB,
        TS_TABLE_NAME: db.tableName,
        APPSYNC_API_ID: api.graphQLApi.apiId,
        APPSYNC_API_KEY: api.graphQLApi.apiKey!,
        APPSYNC_API_ENDPOINT: api.graphQLApi.graphqlUrl,
      },
      role: role.lambdaRole,
      timeout: cdk.Duration.minutes(5),
    });

    // Data source for checking real-time data from AppSync
    const checkSubscriptionDsLambda = api.graphQLApi.addLambdaDataSource(
      "checkSubscriptionDataLambda",
      subscriptionDataLambda
    );

   


     
        checkSubscriptionDsLambda.createResolver("createResolveronSubscriptionDataSubscriptionnnnn", {
      typeName: "Subscription",
      fieldName: "onPublishNewData",
      
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(`
        {
  "version": "2018-05-29",
  "operation": "Invoke",
  "payload": {
    "interval": "$ctx.arguments.interval",
    "plant": "$ctx.arguments.plant",
    "zone": "$ctx.arguments.zone",
    "sensor": "$ctx.arguments.sensor"
    
  }
}
      `),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),

      
    });
   


    
  }
}
