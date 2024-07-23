const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(
  interval:string,
  port: string,
  limit:number
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

if (intervalExpression === '1d'){
  timeSelected=10;
}
else if (intervalExpression === '7d') {
  timeSelected=360;
}

else if (intervalExpression === '30d') {
  timeSelected=1440;
}
else if (intervalExpression === '365d') {
  timeSelected=43800;
}
else{
  timeSelected=1;
}





console.log("timeSelected --------------",timeSelected);




 

 const queryStringPessureBar = `
     SELECT  bin(time, ${timeSelected}m) AS time_interval,
     AVG(Pressure_bar) AS Pressure_bar 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(${intervalExpression} + 10m) and now() 
     AND port='${port}'
     GROUP BY bin(time, ${timeSelected}m)
     ORDER BY time_interval DESC
     LIMIT ${limit} `;

  //    WITH x07_data AS (
  //     SELECT
  //         bin(time, 10m) AS time_interval,
  //         AVG(Pressure_bar) AS X07_Pressure_bar
  //     FROM "AquaControl"."alon"
  //     WHERE time between ago(1d) and now() 
  //     AND port='x07'
  //     GROUP BY bin(time, 10m)
  // ),
  // x01_data AS (
  //     SELECT
  //         bin(time, 10m) AS time_interval,
  //         AVG(Pressure_bar) AS X01_Pressure_bar
  //     FROM "AquaControl"."alon"
  //     WHERE time between ago(1d) and now() 
  //     AND port='x01'
  //     GROUP BY bin(time, 10m)
  // )
  // SELECT
  //     x07_data.time_interval AS time_interval,
  //     x07_data.X07_Pressure_bar - x01_data.X01_Pressure_bar AS X07_X01_Difference
  // FROM
  //     x07_data
  // JOIN
  //     x01_data ON x07_data.time_interval = x01_data.time_interval
  // ORDER BY x07_data.time_interval DESC
  



    //  const queryStringPessureBarDifference = `
    //     WITH ${port}_data AS (
    //    SELECT bin(time, ${timeSelected}m) AS time_interval,
    //    AVG(Pressure_bar) AS ${port}_Pressure_bar
    //    FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
    //    WHERE time between ago(${intervalExpression} + 10m) and now() 
    //    AND port='${port}'
    //    GROUP BY bin(time, ${timeSelected}m)
    //    ),
    //    x01_data AS (
    //    SELECT bin(time, ${timeSelected}m) AS time_interval,
    //    AVG(Pressure_bar) AS X01_Pressure_bar
    //    FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
    //    WHERE time between ago(${intervalExpression} + 10m) and now() 
    //    AND port='x01'
    //    GROUP BY bin(time, ${timeSelected}m)
    //    )
    //    SELECT
    //    ${port}_data.time_interval AS time_interval,
    //    ${port}_data.${port}_Pressure_bar - x01_data.X01_Pressure_bar AS ${port}_X01_Difference
    //    FROM ${port}_data
    //    JOIN
    //    x01_data ON ${port}_data.time_interval = x01_data.time_interval
    //    ORDER BY ${port}_data.time_interval DESC
    //     `;

 

    // Log the query string for debugging
  console.log("Query String:----------", queryStringPessureBar);


      const queryDatabase = async (queryString: string) => {
   

    const params = { QueryString: queryString };
  
    try{
      const queryResults = await queryClient.query(params).promise();
  
      console.log("queryResults------", queryResults);
    
      const items = queryResults.Rows.map((row:any) => {
        const data = {};
        row.Data.forEach((datum, index) => {
         data[queryResults.ColumnInfo[index].Name] = datum.ScalarValue;
        });
        return data;
      });
    
      return items; // Return the data as a list
  


  

    //console.log("items----",items);


  }
  catch(err){

    console.log("Error querying Timestream:", err);
    
  }
      }
    
    try{
      const StringPessureBarTimeInterval = await queryDatabase(queryStringPessureBar);
      // const StringPessureBarDifferencePort = await queryDatabase(queryStringPessureBarDifference);

      console.log("StringPessureBarDifferentTimeInterval-----",StringPessureBarTimeInterval);
      //console.log("StringPessureBarDifferencePort-----",StringPessureBarDifferencePort);
    
      return StringPessureBarTimeInterval;
    
    
    
    }catch(err){
    
    
    }
    
    

  
}

export const handler:APIGatewayProxyHandler = async (event:any) => {
  console.log("Event:-----", event);
  const interval = event?.interval || "week";
 
  const port = event?.port || null;
  const limit = Number(event?.limit) || 1000;
  console.log("Interval:----------", interval);
  console.log("port:----------", port);
  console.log("limit:----------", Number(limit));
  try {
    const data = await fetchDataFromTimestream(interval,port,limit);
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
