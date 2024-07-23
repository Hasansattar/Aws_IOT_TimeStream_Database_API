// WITH FlowX08 AS (
//   SELECT 
//       bin(time, 10m) AS time_interval,
//       AVG(Flow_Lpmin) AS avgFlowLpminX08
//   FROM "AquaControl"."alon"
//   WHERE time BETWEEN ago(1d) AND now()
//     AND port = 'x08'
//   GROUP BY bin(time, 10m)
// ),

// FlowX04 AS (
//   SELECT 
//       bin(time, 10m) AS time_interval,
//       AVG(Flow_Lpmin) AS avgFlowLpminX04
//   FROM "AquaControl"."alon"
//   WHERE time BETWEEN ago(1d) AND now()
//     AND port = 'x04'
//   GROUP BY bin(time, 10m)
// )

// SELECT 
//   f04.time_interval,
//   CASE 
//       WHEN COALESCE(f08.avgFlowLpminX08, 0) > 1 THEN 9000 - f04.avgFlowLpminX04 + COALESCE(f08.avgFlowLpminX08, 0)
//       ELSE 9000 - f04.avgFlowLpminX04
//   END AS currentTankLevel
// FROM 
//   FlowX04 f04
// LEFT JOIN 
//   FlowX08 f08
// ON 
//   f04.time_interval = f08.time_interval
// ORDER BY 
//   f04.time_interval DESC


const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(date: string) {
  let intervalExpression: string;
 // Determine the interval expression based on the interval provided
  // switch (interval) {
  //   case "week":
  //     intervalExpression = "7d";
  //     break;
  //   case "month":
  //     intervalExpression = "30d";
  //     break;
  //   case "year":
  //     intervalExpression = "365d";
  //     break;
  //   case "day":
  //     intervalExpression = "1d";
  //     break;
  //   case "current":
  //     intervalExpression = "0m";
  //     break;
  //   default:
  //     throw new Error("Invalid interval");
  // }

   // Log the interval expression for debugging
  //  console.log(`Interval Expression:---------- ${intervalExpression}`);



  //  let timeSelected;

  // if (intervalExpression === "1d") {
  //   timeSelected = 10;
  // } else if (intervalExpression === "7d") {
  //   timeSelected = 360;
  // } else if (intervalExpression === "30d") {
  //   timeSelected = 1440;
  // } else if (intervalExpression === "365d") {
  //   timeSelected = 43800;
  // } else {
  //   timeSelected = 1;
  // }

  // console.log("timeSelected --------------", timeSelected);
   // ================================START_ QUERY FUNCTIONS  ================================

 

   
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





  // ================================END_ QUERY FUNCTIONS  ================================

  //  ===================START- TANK LEVEL HISTORY=================
  //  ===================START- TANK LEVEL HISTORY =================



  
//   `WITH FlowX08 AS (
//     SELECT 
//         bin(time, 10m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX08
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE date_trunc('day', time) = '${date}' 
//           AND port = 'x08'
//     GROUP BY bin(time, 10m)
// ),

// FlowX04 AS (
//     SELECT 
//         bin(time, 10m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX04
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE date_trunc('day', time) = '${date}' 
//           AND port = 'x04'
//     GROUP BY bin(time, 10m)
// ),

// CurrentTankLevels AS (
//     SELECT 
//         f04.time_interval,
//         CASE 
//             WHEN COALESCE(f08.avgFlowLpminX08, 0) > 1 THEN 9000 - f04.avgFlowLpminX04 + COALESCE(f08.avgFlowLpminX08, 0)
//             ELSE 9000 - f04.avgFlowLpminX04
//         END AS currentTankLevel
//     FROM 
//         FlowX04 f04
//     LEFT JOIN 
//         FlowX08 f08
//     ON 
//         f04.time_interval = f08.time_interval
// ),

// TenMinIntervals AS (
//     SELECT 
//         time_interval,
//         currentTankLevel
        
//     FROM 
//         CurrentTankLevels
//     GROUP BY 
//         time_interval
// ),

// SelectedHourIntervals AS (
//     SELECT 
//         bin(time_interval, 1d) AS time_interval,
//         AVG(currentTankLevel) AS currentTankLevel
//     FROM 
//         TenMinIntervals
//     GROUP BY 
//         bin(time_interval, 1d)
// )

// SELECT 
//     time_interval,
//     currentTankLevel

// FROM 
//     SelectedHourIntervals
// WHERE 
//     time_interval = '${date}' 
// ORDER BY 
//     time_interval DESC
// `;  







//   const queryStringTankLevelHistory =
//   `WITH FlowX08 AS (
//     SELECT 
//         bin(time, ${timeSelected}m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX08
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now()
//       AND port = 'x08'
//     GROUP BY bin(time, ${timeSelected}m)
// ),

// FlowX04 AS (
//     SELECT 
//         bin(time, ${timeSelected}m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX04
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now()
//       AND port = 'x04'
//     GROUP BY bin(time, ${timeSelected}m)
// )

// SELECT 
//     f04.time_interval,
//     CASE 
//         WHEN COALESCE(f08.avgFlowLpminX08, 0) > 1 THEN 9000 - f04.avgFlowLpminX04 + COALESCE(f08.avgFlowLpminX08, 0)
//         ELSE 9000 - f04.avgFlowLpminX04
//     END AS currentTankLevel
// FROM 
//     FlowX04 f04
// LEFT JOIN 
//     FlowX08 f08
// ON 
//     f04.time_interval = f08.time_interval
// ORDER BY 
//     f04.time_interval DESC
// `;  



//==================DAY VISE TANK LEVEL DATA HISTORY

const queryStringTankLevelHistory = `WITH FlowX08 AS (
  SELECT 
      bin(time, 10m) AS time_interval,
      AVG(Flow_Lpmin) AS avgFlowLpminX08
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE date_trunc('day', time) = '${date}'  
    AND port = 'x08'
  GROUP BY bin(time, 10m)
),

FlowX04 AS (
  SELECT 
      bin(time, 10m) AS time_interval,
      AVG(Flow_Lpmin) AS avgFlowLpminX04
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE  date_trunc('day', time) = '${date}' 
    AND port = 'x04'
  GROUP BY bin(time, 10m)
)

SELECT 
  f04.time_interval,
  CASE 
      WHEN COALESCE(f08.avgFlowLpminX08, 0) > 1 THEN 9000 - f04.avgFlowLpminX04 + COALESCE(f08.avgFlowLpminX08, 0)
      ELSE 9000 - f04.avgFlowLpminX04
  END AS currentTankLevel
FROM 
  FlowX04 f04
LEFT JOIN 
  FlowX08 f08
ON 
  f04.time_interval = f08.time_interval
ORDER BY 
  f04.time_interval DESC
`;
  //  ===================END- TANK LEVEL HISTORY =================
  //  ===================END- TANK LEVEL HISTORY =================



  


  try {

    


    const StringTankLevelHistory = await queryDatabase1(
      queryStringTankLevelHistory
    );
  

    console.log(
      "StringTankLevelHistory --------------",
      StringTankLevelHistory
    );

   



    console.log("data--------", StringTankLevelHistory);
    
 
 

    return StringTankLevelHistory;

  } catch (error) {
    console.log("DATA ERROR----------", error);
  }
  //  =====================================================
}

export const handler = async (event: any) => {
  console.log("Event:-----", event);
  // const interval = event?.interval || "day";
  // console.log("Interval:----------", interval);

  const date = event?.date || "2024-07-01";
  console.log("date:----------", date);

  try {
    const data = await fetchDataFromTimestream(date);
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
