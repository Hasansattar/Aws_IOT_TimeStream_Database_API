import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
// import * as route53 from 'aws-cdk-lib/aws-route53';
// import * as targets from 'aws-cdk-lib/aws-route53-targets';
// import * as acm  from 'aws-cdk-lib/aws-certificatemanager';
// import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
// import * as cr from 'aws-cdk-lib/custom-resources';
// import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

import { Construct } from 'constructs';


export interface GraphQLApiProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}


export class GraphQLApi extends Construct {
  public readonly graphQLApi: appsync.GraphqlApi;

  constructor(scope: Construct, id: string,props:GraphQLApiProps) {
    super(scope, id);

    const config = props.config;

    console.log("GraphQLApi config",config);
    

    this.graphQLApi = new appsync.GraphqlApi(this, `GraphQLApi-${config.stage}`, {
      name: `TimestreamAppSyncApi-${config.stage}`,
      schema: appsync.SchemaFile.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      
    });


   // Assuming you have already validated your domain and created a certificate in ACM
      const domainName =  config.appsyncIotStream.appsync_API.domain;
      const certificateArn =  config.appsyncIotStream.appsync_API.certificateArn;

   
      // Assuming you have already validated your domain and created a certificate in ACM
      //'arn:aws:acm:REGION:ACCOUNT_ID:certificate/CERTIFICATE_ID';
     // const certificateArn = 'arn:aws:acm:us-east-1:951882055661:certificate/6911f0c7-d583-4be4-baf6-cc03d771694e';
      //const hostedZoneId = 'YOUR_HOSTED_ZONE_ID';
     // const hostedZoneId = 'Z0636085WQK7ZIJEC45I';
     // const domainName = 'graph-api-dev.aquacontrol.ai';
    //  const domainName = 'graph-api.aquacontrol.ai';

      // Create the custom domain for AppSync
    const domainNameConfig = new appsync.CfnDomainName(this, 'AppSyncDomainName', {
      domainName: domainName,
      certificateArn: certificateArn,
      
    });

    // Create an association between the custom domain and the AppSync API
    const domainAssociation=new appsync.CfnDomainNameApiAssociation(this, 'AppSyncDomainNameAssociation', {
      domainName: domainName,
      apiId: this.graphQLApi.apiId,
    });


    // Ensure the association happens after the domain name creation
    domainAssociation.node.addDependency(domainNameConfig);

    // Configure Route 53
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'aquacontrol.ai',
    });

   
    

    new route53.CnameRecord(this, 'AppSyncCustomDomainCnameRecord', {
      zone: hostedZone,
      recordName: 'graph-api-dev',
      domainName: domainNameConfig.attrAppSyncDomainName, // The target value for your CNAME record
    });

        




     
    



    
  }
}
