//import * as AWS from "aws-sdk";
const AWS = require('aws-sdk');
const https = require('https');


const timestreamWrite = new AWS.TimestreamWrite();
const queryClient = new AWS.TimestreamQuery();


exports.handler = async (event:any) => {


  const databaseName = process.env.TS_DATABASE_NAME;
  const tableName = process.env.TS_TABLE_NAME;
  const appsyncApiEndpoint = process.env.APPSYNC_API_ENDPOINT;
  const appsyncApiKey = process.env.APPSYNC_API_KEY;

  // console.log("databaseName---",databaseName);
  // console.log("tableName---",tableName);
  // console.log("appsyncApiEndpoint---",appsyncApiEndpoint);
  // console.log("appsyncApiKey---",appsyncApiKey);
 
 

  const queryString = `
  SELECT * FROM "${databaseName}"."${tableName}"
  WHERE time between ago(1m) and now()
  AND port = 'x05'
  ORDER BY time DESC LIMIT 1
`;

const params = {
  QueryString: queryString,
};

try {
  const queryResults = await queryClient.query(params).promise();

  console.log("queryResults-------------",queryResults);
  const items = queryResults.Rows.map((row) => {
    const data = {};
    row.Data.forEach((datum, index) => {
      data[queryResults.ColumnInfo[index].Name] = datum.ScalarValue;
    });
    return data;
  });
  console.log("items-------",items[0]);
 
  // Publish new data to AppSync
  // Publish new data to AppSync
  const postData = JSON.stringify({
    query: `
      mutation PublishNewDataForPortx05($input: IotDataInput) {
        publishNewDataForPortx05(input: $input) {
          port
          zone
          plant
          sensor_type
          sensor_name
          measure_name
          time
          Totaliser1_L
          Flow_Lpmin
          Temperature_C
          Flow_Lph
          Totaliser1_m3
          Flow_m3ph
          DeviceStatus
          Flow_mps
          Pressure_MPa
          Pressure_bar
          Conductivity_mcSpcm
          Temperature_F
        }
      }
    `,
    variables: {
      input: items[0],
    },
  });

  const options = {
    hostname: new URL(appsyncApiEndpoint).hostname,
    path: new URL(appsyncApiEndpoint).pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/graphql',
      'x-api-key': appsyncApiKey,
    },
  };

  const response = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });

  console.log("pass the data into APPSYNC------------" , postData);
  console.log("check the data into APPSYNC------------", response);

} catch (error) {
  console.error('Error querying Timestream or publishing to AppSync:', error);
}
  


    

   
   

};
