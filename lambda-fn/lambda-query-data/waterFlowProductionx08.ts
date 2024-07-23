const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(
  interval:string,
 
) {
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

  

  



     //  =============================START- TOTILIZER PRODUCTION AX08=============================

  const queryStringTotilizerPreviosWaterflowX08 = `
  SELECT Totaliser1_m3
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(${intervalExpression} + 10m) AND ago(${intervalExpression})
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08 = `
  SELECT Totaliser1_m3 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;



  






  //  ===================START- CURRENT VALUES OF X08  =================
  //  ===================START- CURRENT VALUES OF X08 =================



  const currentValueX08Flowlpmin =
  `SELECT Flow_Lpmin 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1`;  


  // const currentValueX04Flowlpmin =


  //  ===================END- CURRENT VALUES OF X08 =================
  //  ===================END- CURRENT VALUES OF X08 =================



  


  try {

   


   
   // =============================TOTILZER  X08 =============================

   const TotilizerPreviosWaterflowx08= await queryDatabase(
    queryStringTotilizerPreviosWaterflowX08
  );
  const TotilizerCurrentWaterflowx08 = await queryDatabase(
    queryStringTotilizerCurrentWaterflowx08
  );
  


  const stringCurrentValueX08Flowlpmin = await queryDatabase(
    currentValueX08Flowlpmin
  );
  
  


   

  const FlowWaterProductionX08Totilizer =
    TotilizerCurrentWaterflowx08 - TotilizerPreviosWaterflowx08;
 

  console.log(
    "FlowWaterProductionX08Totilizer",
    FlowWaterProductionX08Totilizer
  );
  



  
    
    const data ={
      time_interval:intervalExpression,
      flow_totilizer_x08:FlowWaterProductionX08Totilizer,
      current_flowLpmin_x08:stringCurrentValueX08Flowlpmin,
      current_totilizer_x08:TotilizerCurrentWaterflowx08

    };
    
    
    

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
  const limit = event?.limit || "100";
  console.log("limit:----------", limit);

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
