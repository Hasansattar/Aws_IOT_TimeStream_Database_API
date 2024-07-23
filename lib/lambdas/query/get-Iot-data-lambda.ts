import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import * as appsync from 'aws-cdk-lib/aws-appsync';
import { GraphQLApi } from '../../graphql-api';
import { TimestreamDatabase } from '../../database';
import { LambdaRole } from '../../roles';
//import {config} from '../../config/config';


export interface  QueryGetIotDataReadLambdaProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class QueryGetIotDataReadLambda extends Construct {
  constructor(scope: Construct, id: string, api: GraphQLApi, db: TimestreamDatabase, role: LambdaRole,props:QueryGetIotDataReadLambdaProps) {
    super(scope, id);


    const config = props.config;

  
     
    const readLambda = new lambda.Function(this, `${config.stage}-QueryGetIotDataLambda`, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "getIotData.handler",
      code: lambda.Code.fromAsset("lambda-fn/lambda-query-data"),
      environment: {
        TS_DATABASE_NAME: db.timeStreamDB,
        TS_TABLE_NAME: db.tableName,
        APPSYNC_API_ID: api.graphQLApi.apiId,
        APPSYNC_API_KEY:api. graphQLApi.apiKey!,
        TO_EMAIL_ADDRESS: config.emailAddress
      },

      role: role.lambdaRole,
      timeout: cdk.Duration.minutes(5),
    });

    // AppSync Data Source
    const lambdaDs = api.graphQLApi.addLambdaDataSource(
      "lambdaDatasource",
      readLambda
    );

    // Resolver for Query Data
    lambdaDs.createResolver("createResolvergetIotData", {
      typeName: "Query",
      fieldName: "getIotData",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #if($ctx.args.plant && !$ctx.args.zone && !$ctx.args.sensor && !$ctx.args.port && !$ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
               "limit": "$ctx.args.limit",
              "plant": "$ctx.args.plant"
            }
          }  
          #elseif($ctx.args.plant && $ctx.args.port && !$ctx.args.sensor &&  !$ctx.args.zone  && !$ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "plant": "$ctx.args.plant",
              "port": "$ctx.args.port"
            }
          }  

          #elseif($ctx.args.plant && $ctx.args.port &&  $ctx.args.zone && !$ctx.args.sensor && !$ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "plant": "$ctx.args.plant",
              "port": "$ctx.args.port",
              "zone": "$ctx.args.zone"
            }
          }  

         #elseif( $ctx.args.plant  && $ctx.args.port && $ctx.args.sensor &&  !$ctx.args.zone  && !$ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "zone": "$ctx.args.zone",
              "port": "$ctx.args.port",
              "sensor": "$ctx.args.sensor"
            }
          }   
        #elseif($ctx.args.zone && !$ctx.args.plant && !$ctx.args.sensor && !$ctx.args.port && !$ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "zone": "$ctx.args.zone"
            }
          }
        #elseif($ctx.args.port && !$ctx.args.zone && !$ctx.args.sensor && !$ctx.args.plant && !$ctx.args.sensor_name)
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "port": "$ctx.args.port"
            }
          }
        
        #elseif($ctx.args.sensor && !$ctx.args.zone && !$ctx.args.plant && !$ctx.args.port && !$ctx.args.sensor_name)
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "sensor": "$ctx.args.sensor"
            }
          }  
             #elseif($ctx.args.plant && $ctx.args.zone && $ctx.args.sensor && $ctx.args.port && !$ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "sensor": "$ctx.args.sensor",
              "port": "$ctx.args.port",
              "zone": "$ctx.args.zone",
              "plant": "$ctx.args.plant"
            }
          }  
              #elseif($ctx.args.plant && !$ctx.args.zone && $ctx.args.sensor && $ctx.args.port && $ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "sensor": "$ctx.args.sensor",
              "port": "$ctx.args.port",
              "sensor_name": "$ctx.args.sensor_name",
              "plant": "$ctx.args.plant"
            }
          }  
            #elseif($ctx.args.plant && $ctx.args.zone && $ctx.args.sensor && $ctx.args.port && $ctx.args.sensor_name )
          {
            "version": "2018-05-29",
            "operation": "Invoke",
            "payload": {
              "interval": "$ctx.args.interval",
              "limit": "$ctx.args.limit",
              "sensor": "$ctx.args.sensor",
              "port": "$ctx.args.port",
              "zone": "$ctx.args.zone",
              "sensor_name": "$ctx.args.sensor_name",
              "plant": "$ctx.args.plant"
            }
          }  
        #else
          {
            
            }
          }
        #end
      `),

      responseMappingTemplate: appsync.MappingTemplate.fromString(`
    $utils.toJson($ctx.result)
  `),
    });

   


    
  }
}
