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

export class PerMinutePublishNewDataForSenorConductivityLambda  extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole) {
    super(scope, id);
    
    const perMinutePublishNewDataForSensorConductivityLambda = new lambda.Function(this, "perMinutePublishNewDataForSensorConductivityLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "perMinutePublishNewDataForSensorConductivity.handler",
      code: lambda.Code.fromAsset("lambda-fn/lambda-mutation-data/sensor-type"),
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
    const lambdaDsPerMinutePublishNewDataForSensorConductivityLambda= api.graphQLApi.addLambdaDataSource(
      "lambdaDsPerMinutePublishNewDataForSensorConductivityLambda",
      perMinutePublishNewDataForSensorConductivityLambda
    );
  
    // Resolver for Mutation to publish new data
    lambdaDsPerMinutePublishNewDataForSensorConductivityLambda.createResolver("createResolverMutationlambdaDsPerMinutePublishNewDataForSensorConductivity", {
      typeName: "Mutation",
      fieldName: "publishNewDataForSensorConductivity",
            requestMappingTemplate: appsync.MappingTemplate.fromString(`
              {
                "version": "2018-05-29",
                "operation": "Invoke",
                "payload": {
    
                "port": "$ctx.arguments.input.port",
                "zone": "$ctx.arguments.input.zone",
                "plant": "$ctx.arguments.input.plant",
                "sensor_type": "$ctx.arguments.input.sensor_type",
                "sensor_name": "$ctx.arguments.input.sensor_name",
                "measure_name": "$ctx.arguments.input.measure_name",
                "time": "$ctx.arguments.input.time",
                "Totaliser1_L": "$ctx.arguments.input.Totaliser1_L",
                "Flow_Lph": "$ctx.arguments.input.Flow_Lph",
                "Flow_Lpmin": "$ctx.arguments.input.Flow_Lpmin",
                "Totaliser1_m3": "$ctx.arguments.input.Totaliser1_m3",
                "Temperature_C": "$ctx.arguments.input.Temperature_C",
                "Flow_m3ph": "$ctx.arguments.input.Flow_m3ph",
                "Flow_mps": "$ctx.arguments.input.Flow_mps",
                "DeviceStatus": "$ctx.arguments.input.DeviceStatus",
                "Pressure_MPa": "$ctx.arguments.input.Pressure_MPa",
                "Pressure_bar": "$ctx.arguments.input.Pressure_bar",
                "Conductivity_mcSpcm": "$ctx.arguments.input.Conductivity_mcSpcm",
                "Temperature_F": "$ctx.arguments.input.Temperature_F",
  
                
        }
  
              }
            `),
            responseMappingTemplate: appsync.MappingTemplate.fromString(
              `#if($ctx.error)
        $util.error($ctx.error.message, $ctx.error.type)
      #else
  
       {
                "port": "$ctx.arguments.input.port",
                "zone": "$ctx.arguments.input.zone",
                "plant": "$ctx.arguments.input.plant",
                "sensor_type": "$ctx.arguments.input.sensor_type",
                "sensor_name": "$ctx.arguments.input.sensor_name",
                "measure_name": "$ctx.arguments.input.measure_name",
                "time": "$ctx.arguments.input.time",
                "Totaliser1_L": "$ctx.arguments.input.Totaliser1_L",
                "Flow_Lph": "$ctx.arguments.input.Flow_Lph",
                "Flow_Lpmin": "$ctx.arguments.input.Flow_Lpmin",
                "Totaliser1_m3": "$ctx.arguments.input.Totaliser1_m3",
                "Temperature_C": "$ctx.arguments.input.Temperature_C",
                "Flow_m3ph": "$ctx.arguments.input.Flow_m3ph",
                "Flow_mps": "$ctx.arguments.input.Flow_mps",
                "DeviceStatus": "$ctx.arguments.input.DeviceStatus",
                "Pressure_MPa": "$ctx.arguments.input.Pressure_MPa",
                "Pressure_bar": "$ctx.arguments.input.Pressure_bar",
                "Conductivity_mcSpcm": "$ctx.arguments.input.Conductivity_mcSpcm",
                "Temperature_F": "$ctx.arguments.input.Temperature_F",
  
        }
      #end`
            ),
      
     
    });
  
  
  
    perMinutePublishNewDataForSensorConductivityLambda.addPermission("EventBridgeInvoke", {
      principal: new iam.ServicePrincipal("events.amazonaws.com"),
      sourceArn: `arn:aws:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
    });
  
    // EventBridge Rule to trigger the Lambda function periodically
    new events.Rule(this, "rulePerMinutePublishNewDataForSensorConductivityLambda", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(1)),
      targets: [new targets.LambdaFunction(perMinutePublishNewDataForSensorConductivityLambda)],
    });
       


     

    


  }
}
