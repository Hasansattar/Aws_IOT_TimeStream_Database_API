import * as cdk from 'aws-cdk-lib';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import { Construct } from 'constructs';
//import { config } from './config/config'; 


export interface TimestreamDatabaseProps  {
  config: any; // You can replace 'any' with a more specific type if you have one
}



export class TimestreamDatabase extends Construct {
  public readonly timeStreamDB: string;
  public readonly tableName: string;

  constructor(scope: Construct, id: string,props:TimestreamDatabaseProps) {
    super(scope, id);


    const config = props.config;

   // console.log("lib database Config====>",config);

    this.timeStreamDB =  config.timeStreamDB;
    this.tableName = config.tableName;

    // Define the Timestream database and table here if needed
    // new timestream.CfnDatabase(this, 'TimestreamDatabase', {
    //   databaseName: this.timeStreamDB,
    // });
    // new timestream.CfnTable(this, 'TimestreamTable', {
    //   databaseName: this.timeStreamDB,
    //   tableName: this.tableName,
    // });
  }
}
