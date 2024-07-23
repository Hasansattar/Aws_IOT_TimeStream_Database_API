export type Config ={

  stage:'local' | 'dev' | 'prod',
  aws_account: string,
  aws_region: string,
  appsyncIotStream: {
    appsync_API: {
      domain:string,
      certificateArn:string,
    }
  },
  emailAddress:string,
  tableName:string,
  timeStreamDB:string,



  name: string,
  tags: {
    app: string
  },
  action: string,
  domain: {
    cert_arn: string
  },
  network: {
    vpc: {
      natGatewaySubnetName: string,
      maxAzs: number
    },
    subnets: Array<{
      cidrMask: number,
      name: string,
      subnetType: string,
    }>
  },
  queue: {
    sqs: Array<{
      name: string,
      visibility: number, // in minutes
      cron_expression: string,
      dlq_visibility: number // in seconds
    }>
  },

 
  // Add any other configuration properties here
}