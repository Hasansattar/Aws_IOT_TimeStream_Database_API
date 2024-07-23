const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(
  interval:string,
  port:string,
  limit:number
) {
  let intervalExpression: string;
  //Determine the interval expression based on the interval provided
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


   let timeSelected;

  if (intervalExpression === "1d") {
    timeSelected = 10;
  } else if (intervalExpression === "7d") {
    timeSelected = 360;
  } else if (intervalExpression === "30d") {
    timeSelected = 1440;
  } else if (intervalExpression === "365d") {
    timeSelected = 43800;
  } else {
    timeSelected = 1;
  }

  console.log("timeSelected --------------", timeSelected);


   // ================================START_ QUERY FUNCTIONS  ================================

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

   
  const queryDatabase1 = async (queryString: string) => {
    const params = { QueryString: queryString };

    const queryResults = await queryClient.query(params).promise();

    console.log("queryResults------", queryResults);

    try {
      const items = queryResults.Rows.map((row: any) => {
        const data = {};
        row.Data.forEach((datum, index) => {
          data[queryResults.ColumnInfo[index].Name] = datum.ScalarValue;
        });
        return data;
      });

      return items; // Return the data as a list

      // console.log("items----",items);
    } catch (error) {
      console.error("Error querying Timestream:", error);
      return 0;
    }
  };


  

    


 const queryStringHistoryOfWaterflow = `
       SELECT
       time_interval,
       Flow_Lpmin
       FROM (
       SELECT bin(time, ${timeSelected}m) AS time_interval,
        Flow_Lpmin,
  
        ROW_NUMBER() OVER (PARTITION BY bin(time, ${timeSelected}m) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(${intervalExpression} + 10m) and now() 
        AND port='${port}'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC
         LIMIT ${limit}`;


  



      //    WITH ranked_data AS (
      //     SELECT 
      //         bin(time, 1d) AS time_interval,
      //         Flow_Lpmin,
      //         ROW_NUMBER() OVER (PARTITION BY bin(time, 1d) ORDER BY time) AS rn
      //     FROM "AquaControl"."plant_alon"
      //     WHERE time BETWEEN ago(30d + 10m) AND now()
      //       AND port = 'x04'
      // )
      // SELECT 
      //     time_interval,
      //     Flow_Lpmin
      // FROM ranked_data
      // WHERE rn = 1
      // ORDER BY time_interval DESC




      // ========================================================

    //   WITH ranked_data AS (
    //     SELECT 
    //         bin(time, 1d) AS time_interval,
    //         MAX(Flow_Lpmin) AS Flow_Lpmin
    //     FROM "AquaControl"."plant_alon"
    //     WHERE time BETWEEN ago(30d + 10m) AND now()
    //       AND port = 'x08'
    //     Group BY  bin(time, 1d)
    // )
    // SELECT 
    //     time_interval,
    //     Flow_Lpmin
    // FROM ranked_data
    // ORDER BY time_interval DESC
    
      

  try {

    const WaterFlowLpminHistoryWater= await queryDatabase1(
      queryStringHistoryOfWaterflow
    );
   


  
    
    const data = WaterFlowLpminHistoryWater;

    console.log("data--------", data);
    
 
 

    return data;

  } catch (error) {
    console.log("DATA ERORRORO----------", error);
  }
  //  =====================================================
}

export const handler = async (event: any) => {
  console.log("Event:-----", event);
  const interval = event?.interval || "week";
  console.log("Interval:----------", interval);
  const port = event?.port || "x08";
  console.log("port:----------", port);
  const limit = Number(event?.limit)|| 100;
  console.log("limit:----------", limit);

  try {
    const data = await fetchDataFromTimestream(interval,port,limit);
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
