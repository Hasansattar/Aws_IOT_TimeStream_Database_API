const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(interval: string) {
  let intervalExpression: string;
  // Determine the interval expression based on the interval provided
  switch (interval) {
    case "week":
      intervalExpression = "7d";
      break;
    case "month":
      intervalExpression = "30d";
      break;
    case "year":
      intervalExpression = "365d";
      break;
    case "day":
      intervalExpression = "1d";
      break;
    case "current":
      intervalExpression = "0m";
      break;
    default:
      throw new Error("Invalid interval");
  }

  // Log the interval expression for debugging
  console.log(`Interval Expression:---------- ${intervalExpression}`);

  //==========================================================


   



  const queryStringX04 = `
     SELECT Flow_Lpmin AS avg_Flow_Lpmin 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(${intervalExpression} + 10m ) and ago(${intervalExpression} ) AND port='x04' AND Flow_Lpmin > 1
     ORDER BY time DESC
     LIMIT 1
     `;

  const queryStringX08 = `
     SELECT Flow_Lpmin AS avg_Flow_Lpmin 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(${intervalExpression} + 10m) and ago(${intervalExpression}) AND port='x08' AND Flow_Lpmin > 1
     ORDER BY time DESC
     LIMIT 1
   `;

  const queryStringX05 = `
     SELECT Pressure_bar AS avg_Pressure_bar 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(${intervalExpression} + 10m) and ago(${intervalExpression}) AND port='x05' 
     ORDER BY time DESC
     LIMIT 1
   `;

  const queryStringX01 = `
     SELECT Pressure_bar AS avg_Pressure_bar 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(${intervalExpression} +10m) and ago(${intervalExpression}) AND port='x01' 
     ORDER BY time DESC
     LIMIT 1
   `;

  const queryStringX07 = `
     SELECT Pressure_bar  AS avg_Pressure_bar 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(${intervalExpression} + 10m) and ago(${intervalExpression}) AND port='x07'
     ORDER BY time DESC
     LIMIT 1
   `;


  //  ====================STARTWATER PRODUCTIONTOTLIZER==============================
  
    const totalizerInterval = interval !== "current" ? intervalExpression : '1d';
     
  const queryStringTotilizerPreviosWaterflowX04 = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_time
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(${totalizerInterval} + 10m) AND ago(${totalizerInterval})
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04 = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;


  const queryStringTotilizerPreviosWaterflowX08 = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_time
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(${totalizerInterval} + 10m) AND ago(${totalizerInterval})
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  
  const queryStringTotilizerCurrentWaterflowx08 = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;
  

// ======================END WATER PRODUCTION TOTILIZER==============================

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
      console.error("Error querying Timestream:", error);
      return 0;
    }
  };

  try {

    const StringTotilizerPreviosWaterflowX04 = await queryDatabase(queryStringTotilizerPreviosWaterflowX04);
    const StringTotilizerCurrentWaterflowx04 = await queryDatabase(queryStringTotilizerCurrentWaterflowx04);
    const StringTotilizerPreviosWaterflowX08 = await queryDatabase(queryStringTotilizerPreviosWaterflowX08);
    const StringTotilizerCurrentWaterflowx08 = await queryDatabase(queryStringTotilizerCurrentWaterflowx08);
   


    console.log("StringTotilizerPreviosWaterflowX04------",StringTotilizerPreviosWaterflowX04);


    // Querying the data
    const avgFlowLpminX04 = await queryDatabase(queryStringX04);
    const avgFlowLpminX08 = await queryDatabase(queryStringX08);
    const avgPressureBarX05 = await queryDatabase(queryStringX05);
    const avgPressureBarX01 = await queryDatabase(queryStringX01);
    const avgPressureBarX07 = await queryDatabase(queryStringX07);

    console.log("avgFlowLpminX04--------------", avgFlowLpminX04);
    console.log("avgFlowLpminX08--------------", avgFlowLpminX08);
    console.log("avgPressureBarX05--------------", avgPressureBarX05);
    console.log("avgPressureBarX01--------------", avgPressureBarX01);
    console.log("avgPressureBarX07--------------", avgPressureBarX07);

    // Calculating tank level

    let currentTankLevel = 9000 - avgFlowLpminX04 + avgFlowLpminX08;

    if (currentTankLevel == 9000) {
      // Tank is full
      let currentTankLevel = 9000 - avgFlowLpminX04;
      console.log("Tank is full", currentTankLevel);
    } else if (avgFlowLpminX08 > 1) {
      // current Tank level , X08 turns on
      let currentTankLevel = 9000 - avgFlowLpminX04 + avgFlowLpminX08;
      console.log("Current Tank level , X08 turns on ", currentTankLevel);
    } else {
      // Tank is full
      console.log("Tank is full", currentTankLevel);
    }

    // Calculating filter results
    const filter1Result = avgPressureBarX01 - avgPressureBarX05 ;
    const filter2Result = avgPressureBarX01 - avgPressureBarX07;



    const waterDistributedx04 = StringTotilizerCurrentWaterflowx04 - StringTotilizerPreviosWaterflowX04;
     
    console.log("waterProductionx04 --------",waterDistributedx04);
    
    const waterProducedx08 =StringTotilizerCurrentWaterflowx08 - StringTotilizerPreviosWaterflowX08;

    console.log("waterProductionx08 --------",waterProducedx08);


    // const filter1ResultZero = filter1Result <= 0 ? 0 : filter1Result;
    // const filter2ResultZero = filter2Result <= 0 ? 0 : filter2Result;
 
    const interval = intervalExpression;
    const data = {
      currentTankLevel: currentTankLevel,
      filter1Result: filter1Result,
      filter2Result: filter2Result,
      interval: interval, // Add interval to the data object
      distributedWaterx04: waterDistributedx04,
      producedWaterx08:waterProducedx08
    };

    console.log("data--------", data);

    console.log("Current Tank Level:", currentTankLevel);
    console.log("Filter1 Result (x01 - x05 ):", filter1Result);
    console.log("Filter2 Result (x01 - x07):", filter2Result);

    return data;
  } catch (error) {
    console.log("hasansas", error);
  }
  //  =====================================================
}

export const handler = async (event: any) => {
  console.log("Event:-----", event);
  const interval = event?.interval || "week";
  console.log("Interval:----------", interval);

  try {
    const data = await fetchDataFromTimestream(interval);
    console.log("hasan---Data:----------", data);
    return data;
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify(data),
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Access-Control-Allow-Origin": "*",
    //   },
    // };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching data" }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
};
