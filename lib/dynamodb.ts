import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';


export class DynamoDatabase extends Construct {
  public readonly DynamoTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);


    
    // DynamoDB table
    const existingTable = dynamodb.Table.fromTableName(this, 'PlantsTable', 'Plants-dev') as dynamodb.Table;

    this.DynamoTable = existingTable;


    


    // Lambda function
    // const scanFunction = new lambda.Function(this, 'ScanFunction', {
    //   runtime: lambda.Runtime.NODEJS_16_X,
    //   code: lambda.Code.fromAsset('lambda-fn/lambda-query-data'),
    //   handler: 'scanDyanmoDB.handler',
    //   environment: {
    //     TABLE_NAME: table.tableName,
    //   },
    // });

    // Grant the Lambda function read access to the DynamoDB table
    //table.grantReadData(scanFunction);

    // Grant the Lambda function permission to log
    // scanFunction.addToRolePolicy(new iam.PolicyStatement({
    //   actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
    //   resources: ['*'],
    // }));

   
  }
}
