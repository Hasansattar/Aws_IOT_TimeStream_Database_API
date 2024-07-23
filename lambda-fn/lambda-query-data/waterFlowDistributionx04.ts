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

  

  // ================================END_ QUERY FUNCTIONS  ================================



     //  =============================START- PER DAY- TOTILIZER PRODUCTION AND DISTRIBUTION  X08 - X04=============================

  const queryStringTotilizerPreviosWaterflowX04 = `
  SELECT Totaliser1_m3
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(${intervalExpression} + 10m) AND ago(${intervalExpression})
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04 = `
  SELECT Totaliser1_m3 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;



  





  //  ===================START- CURRENT VALUES OF  X04 FLOW_Lpmin =================
  //  ===================START- CURRENT VALUES OF  X04 FLOW_Lpmin ================= 


  const currentValueX04Flowlpmin =
  `SELECT Flow_Lpmin 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1`; 


  //  ===================END- CURRENT VALUES OF  X04 FLOW_Lpmin =================
  //  ===================END- CURRENT VALUES OF  X04 FLOW_Lpmin =================



  


  try {

   


   
   // =============================TOTILZER X04 and X08 =============================

   const TotilizerPreviosWaterflowx04= await queryDatabase(
    queryStringTotilizerPreviosWaterflowX04
  );
  const TotilizerCurrentWaterflowx04 = await queryDatabase(
    queryStringTotilizerCurrentWaterflowx04
  );
  


  const stringCurrentValueX04Flowlpmin = await queryDatabase(
    currentValueX04Flowlpmin
  );
  
  


   

  const FlowWaterDistributionX04Totilizer =
    TotilizerCurrentWaterflowx04 - TotilizerPreviosWaterflowx04;
 

  console.log(
    "FlowWaterDistributionX04Totilizer",
    FlowWaterDistributionX04Totilizer
  );
  



  
    
    const data ={
      time_interval:intervalExpression,
      flow_totilizer_x04:FlowWaterDistributionX04Totilizer,
      current_flowLpmin_x04:stringCurrentValueX04Flowlpmin,
      current_totilizer_x04:TotilizerCurrentWaterflowx04
    };
    
    
    

    console.log("data--------", data);
    
 
 

    return data;

  } catch (error) {
    console.log("DATA ERROR----------", error);
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
