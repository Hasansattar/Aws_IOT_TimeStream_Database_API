const AWS = require('aws-sdk');
//const axios = require('axios');
const https = require('https');

const queryClient = new AWS.TimestreamQuery();

export const handler = async (event:any ) => {

  console.log("Event:-----", event);
  // const interval = event?.interval || "week";
  // const limit = event?.limit || 1;
  
  // console.log("Interval:----------", interval);
  // console.log("limit:----------", limit);
  



  const databaseName = process.env.TS_DATABASE_NAME;
  const tableName = process.env.TS_TABLE_NAME;
  const appsyncApiEndpoint = process.env.APPSYNC_API_ENDPOINT;
  const appsyncApiKey = process.env.APPSYNC_API_KEY;

  console.log("databaseName---", databaseName);
  console.log("tableName---", tableName);
  console.log("appsyncApiEndpoint---", appsyncApiEndpoint);
  console.log("appsyncApiKey---", appsyncApiKey);


  

  const queryDatabase = async (queryString: string) => {
    const params = { QueryString: queryString };

    try {
      const queryResults = await queryClient.query(params).promise();
      if (queryResults.Rows.length > 0) {
        const avgValue = queryResults.Rows[0].Data[0].ScalarValue;
        return parseFloat(avgValue);
      } else {
        return 0;
      }
     
    } catch (error) {
      console.error('Error querying Timestream:', error);
      return 0;
    }
  };

   

 
  // Query strings for different ports
  const queryStringX04 = `
    SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin 
    FROM "${databaseName}"."${tableName}"
    WHERE time between ago(30d) and now() AND port='x04' AND Flow_Lpmin > 1
    GROUP BY port
  `;

  const queryStringX08 = `
    SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin 
    FROM "${databaseName}"."${tableName}"
    WHERE time between ago(30d) and now() AND port='x08' AND Flow_Lpmin > 1
    GROUP BY port
  `;

  const queryStringX05 = `
    SELECT AVG(CAST(Pressure_bar AS double)) AS avg_Pressure_bar 
    FROM "${databaseName}"."${tableName}"
    WHERE time between ago(30d) and now() AND port='x05' 
    GROUP BY port
  `;

  const queryStringX01 = `
    SELECT AVG(CAST(Pressure_bar AS double)) AS avg_Pressure_bar 
    FROM "${databaseName}"."${tableName}"
    WHERE time between ago(30d) and now() AND port='x01' 
    GROUP BY port
  `;

  const queryStringX07 = `
    SELECT AVG(CAST(Pressure_bar AS double)) AS avg_Pressure_bar 
    FROM "${databaseName}"."${tableName}"
    WHERE time between ago(30d) and now() AND port='x07'
    GROUP BY port
  `;

 

  try {
    // Querying the data
    const avgFlowLpminX04 = await queryDatabase(queryStringX04);
    const avgFlowLpminX08 = await queryDatabase(queryStringX08);
    const avgPressureBarX05 = await queryDatabase(queryStringX05);
    const avgPressureBarX01 = await queryDatabase(queryStringX01);
    const avgPressureBarX07 = await queryDatabase(queryStringX07);




    console.log("avgFlowLpminX04--------------",avgFlowLpminX04);
    console.log("avgFlowLpminX08--------------",avgFlowLpminX08);
    console.log("avgPressureBarX05--------------",avgPressureBarX05);
    console.log("avgPressureBarX01--------------",avgPressureBarX01);
    console.log("avgPressureBarX07--------------",avgPressureBarX07);

    // Calculating tank level
    
    let currentTankLevel= 9000 - avgFlowLpminX04 + avgFlowLpminX08;

    if (currentTankLevel == 9000) {
      // Tank is full
     let currentTankLevel = 9000 - avgFlowLpminX04;
     console.log("Tank is full",currentTankLevel);
     
    } 
    else if (avgFlowLpminX08 > 1) {
      // current Tank level , X08 turns on 
      let currentTankLevel = 9000 - avgFlowLpminX04 + avgFlowLpminX08;
      console.log("Current Tank level , X08 turns on ",currentTankLevel);
     
    }
    else {
      // Tank is full
      console.log("Tank is full",currentTankLevel );
      
    }

    // Calculating filter results
    const filter1Result = avgPressureBarX05 - avgPressureBarX01;
    const filter2Result = avgPressureBarX07 - avgPressureBarX01;

    const waterProduction= avgPressureBarX05 + avgPressureBarX07 ;

    const interval="month";
    const data={
         currentTankLevel:currentTankLevel,
          filter1Result:filter1Result,
          filter2Result:filter2Result,
          interval : interval,
          productionWater:waterProduction 

       }


    console.log("data--------",data);

    console.log("Current Tank Level:", currentTankLevel);
    console.log("Filter1 Result (x05 - x01):", filter1Result);
    console.log("Filter2 Result (x07 - x01):", filter2Result);

          

          // port: "x04",
          // avgFlowLpmin: ${avgFlowLpminX04},

          const postData = JSON.stringify({
            query: `
              mutation UpdateTankAndPressureDataPerMonth($input: UpdateTankAndPressureDataInput) {
                updateTankAndPressureDataPerMonth(input: $input) {
                  currentTankLevel
                  filter1Result
                  filter2Result
                  interval
                  productionWater
                }
              }
            `,
            variables: {
              input: data,
            },
          });

           console.log("postData---------------------",postData)

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


    // Publish new data to AppSync
    // const mutationQuery = `
    //   mutation UpdateTankAndPressureDataInput {
    //     updateTankAndPressureDataInput(input: {
          
    //       currentTankLevel: ${currentTankLevel},
    //       filter1Result: ${filter1Result},
    //       filter2Result: ${filter2Result}
    //     }) {
          
    //       currentTankLevel
    //       filter1Result
    //       filter2Result
    //     }
    //   }
    // `;

    // const mutationResponse = await axios({
    //   url: appsyncApiEndpoint,
    //   method: 'post',
    //   headers: {
    //     'x-api-key': appsyncApiKey,
    //     'Content-Type': 'application/json',
    //   },
    //   data: JSON.stringify({ query: mutationQuery }),
    // });
    console.log("Mutation1 Response:----------", postData);
    console.log("Mutation2 Response:-------------", response);
    

  } catch (error) {
    console.error('Error:', error);
  }
};