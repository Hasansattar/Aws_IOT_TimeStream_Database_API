import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as iam from "aws-cdk-lib/aws-iam";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

import { GraphQLApi } from '../../../graphql-api';
import { TimestreamDatabase } from '../../../database';
import { LambdaRole } from '../../../roles';

export class CheckTankAndPressurePerMonthLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole) {
    super(scope, id);
     
   
    
    const checkTankAndPressurePerMonth = new lambda.Function(
      this,
      "checkTankLevelAndPressurePerMonth",
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: "perMonthCheckTankAndPressure.handler",
        code: lambda.Code.fromAsset("lambda-fn/lambda-subscription-data/lambda-tank-pressure"),
        environment: {
          TS_DATABASE_NAME: db.timeStreamDB,
          TS_TABLE_NAME: db.tableName,
          APPSYNC_API_ID: api.graphQLApi.apiId,
          APPSYNC_API_KEY: api.graphQLApi.apiKey!,
          APPSYNC_API_ENDPOINT: api.graphQLApi.graphqlUrl,
        },
        role: role.lambdaRole,
        timeout: cdk.Duration.minutes(5),
      }
    );
    
    const lambdaDscheckTankAndPressurePerMonth = api.graphQLApi.addLambdaDataSource(
      "lambdaDscheckTankAndPressurePerMonth",
      checkTankAndPressurePerMonth
    );
    
    // Resolver for Mutation
    lambdaDscheckTankAndPressurePerMonth.createResolver(
      "createResolverMutationCheckTankAndPressurePerMonth",
      {
        typeName: "Mutation",
        fieldName: "updateTankAndPressureDataPerMonth",
        requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "Invoke",
          "payload": {
          "interval": "$ctx.arguments.input.interval",
          "currentTankLevel": "$ctx.arguments.input.currentTankLevel",
          "filter1Result": "$ctx.arguments.input.filter1Result",
          "filter2Result": "$ctx.arguments.input.filter2Result",
          "productionWater": "$ctx.arguments.input.productionWater"
          
    
        
    }
          
      
        }
      `),
    
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        `#if($ctx.error)
        $util.error($ctx.error.message, $ctx.error.type)
      #else
      {
           "interval": "$ctx.arguments.input.interval",
          "currentTankLevel": "$ctx.arguments.input.currentTankLevel",
          "filter1Result": "$ctx.arguments.input.filter1Result",
          "filter2Result": "$ctx.arguments.input.filter2Result",
          "productionWater": "$ctx.arguments.input.productionWater"
      }
      #end`
      ),
       
      }
    );
            
    
    
    
    checkTankAndPressurePerMonth.addPermission(
      "EventBridgeInvokecheckTankAndPressurePerMonth",
      {
        principal: new iam.ServicePrincipal("events.amazonaws.com"),
        sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
      }
    );
    
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "ruleCheckTankAndPressurePerMonth", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      targets: [new targets.LambdaFunction(checkTankAndPressurePerMonth)],
    });
    
    
    
    
    
    
  }
}
