#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsIotTimeStreamDatabaseApiStack } from '../lib/aws_iot_time_stream_database_api-stack';

import { loadConfig } from '../utils/config_util';


const app = new cdk.App();
const stage = app.node.tryGetContext('stage');

if (!stage || stage === 'unknown') {
  console.error(
    'You need to set the target stage. USAGE: cdk <command> -c stage=dev <stack>',
  );
  process.exit(1);
}


// Load stage config and set cdk environment
let config;
try {
  config = loadConfig(stage);
} catch (error) {
  console.error('Failed to load configuration:', error);
  process.exit(1);
}

console.log("config==========>",config);

const env = {
  account: config.aws_account,
  region: config.aws_region,
};


 console.log("env==========>",env);


new AwsIotTimeStreamDatabaseApiStack(app, `AwsIotTimeStreamDatabaseApiStack-${config.stage}`, {
    env: env,
   config: config,
 
});

