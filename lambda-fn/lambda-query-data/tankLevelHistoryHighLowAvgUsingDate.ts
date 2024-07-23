

const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(date: string) {
//   let intervalExpression: string;
//  // Determine the interval expression based on the interval provided
//   switch (interval) {
//     case "week":
//       intervalExpression = "7d";
//       break;
//     case "month":
//       intervalExpression = "30d";
//       break;
//     case "year":
//       intervalExpression = "365d";
//       break;
//     case "day":
//       intervalExpression = "1d";
//       break;
//     case "current":
//       intervalExpression = "0m";
//       break;
//     default:
//       throw new Error("Invalid interval");
//   }

//    // Log the interval expression for debugging
//    console.log(`Interval Expression:---------- ${intervalExpression}`);



//    let timeSelected;

//   if (intervalExpression === "1d") {
//     timeSelected = 10;
//   } else if (intervalExpression === "7d") {
//     timeSelected = 360;
//   } else if (intervalExpression === "30d") {
//     timeSelected = 1440;
//   } else if (intervalExpression === "365d") {
//     timeSelected = 43800;
//   } else {
//     timeSelected = 1;
//   }

//   console.log("timeSelected --------------", timeSelected);
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


//   WITH FlowX08 AS (
//     SELECT 
//         bin(time, 10m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX08
//     FROM "AquaControl"."plant_alon"
//     WHERE time BETWEEN ago(1d + 10m) AND now()  -- Adjust time window as needed
//       AND port = 'x08'
//     GROUP BY bin(time, 10m)
// ),

// FlowX04 AS (
//     SELECT 
//         bin(time, 10m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX04
//     FROM "AquaControl"."plant_alon"
//     WHERE time BETWEEN ago(1d + 10m) AND now()  -- Adjust time window as needed
//       AND port = 'x04'
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
// TenMinIntervals AS ( SELECT 
//     time_interval,
//     MAX(currentTankLevel) AS highest_currentTankLevel,
//     MIN(currentTankLevel) AS lowest_currentTankLevel,
//     AVG(currentTankLevel) AS average_currentTankLevel
// FROM 
//     CurrentTankLevels
// GROUP BY 
//     time_interval
// ),


// SixHourIntervals AS (
//   SELECT 
//       bin(time_interval, 10m) AS time_interval_6h,
//       MAX(highest_currentTankLevel) AS highest_currentTankLevel_6h,
//       MIN(lowest_currentTankLevel) AS lowest_currentTankLevel_6h,
//       AVG(average_currentTankLevel) AS average_currentTankLevel_6h
//   FROM 
//       TenMinIntervals
//   GROUP BY 
//       bin(time_interval, 10m)
// )


// SELECT 
//     time_interval_6h,
//     highest_currentTankLevel_6h,
//     lowest_currentTankLevel_6h,
//     average_currentTankLevel_6h
// FROM 
//     SixHourIntervals
// ORDER BY 
//     time_interval_6h DESC


// ================================================================

//   const queryStringTankLevelHistoryMaxMinAvg =
//   `WITH FlowX08 AS (
//     SELECT 
//         bin(time, 10m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX08
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now()  
//       AND port = 'x08'
//     GROUP BY bin(time, 10m)
// ),

// FlowX04 AS (
//     SELECT 
//         bin(time, 10m) AS time_interval,
//         AVG(Flow_Lpmin) AS avgFlowLpminX04
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now()  
//       AND port = 'x04'
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
// TenMinIntervals AS ( SELECT 
//     time_interval,
//     MAX(currentTankLevel) AS highest_currentTankLevel,
//     MIN(currentTankLevel) AS lowest_currentTankLevel,
//     AVG(currentTankLevel) AS average_currentTankLevel
// FROM 
//     CurrentTankLevels
// GROUP BY 
//     time_interval
// ),


// SelectedHourIntervals AS (
//   SELECT 
//       bin(time_interval, ${timeSelected}m) AS time_interval,
//       MAX(highest_currentTankLevel) AS highest_currentTankLevel,
//       MIN(lowest_currentTankLevel) AS lowest_currentTankLevel,
//       AVG(average_currentTankLevel) AS average_currentTankLevel
//   FROM 
//       TenMinIntervals
//   GROUP BY 
//       bin(time_interval, ${timeSelected}m)
// )


// SELECT 
//     time_interval,
//     highest_currentTankLevel,
//     lowest_currentTankLevel,
//     average_currentTankLevel
// FROM 
//     SelectedHourIntervals
// ORDER BY 
//     time_interval DESC
//     LIMIT ${limit}
// `;  

// ================================================================
//'2024-07-01'
const queryStringTankLevelHistoryMaxMinAvg =
`WITH FlowX08 AS (
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
    WHERE date_trunc('day', time) = '${date}' 
          AND port = 'x04'
    GROUP BY bin(time, 10m)
),

CurrentTankLevels AS (
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
),

TenMinIntervals AS (
    SELECT 
        time_interval,
        MAX(currentTankLevel) AS highest_currentTankLevel,
        MIN(currentTankLevel) AS lowest_currentTankLevel,
        AVG(currentTankLevel) AS average_currentTankLevel
    FROM 
        CurrentTankLevels
    GROUP BY 
        time_interval
),

SelectedHourIntervals AS (
    SELECT 
        bin(time_interval, 1d) AS time_interval,
        MAX(highest_currentTankLevel) AS highest_currentTankLevel,
        MIN(lowest_currentTankLevel) AS lowest_currentTankLevel,
        AVG(average_currentTankLevel) AS average_currentTankLevel
    FROM 
        TenMinIntervals
    GROUP BY 
        bin(time_interval, 1d)
)

SELECT 
    time_interval,
    highest_currentTankLevel,
    lowest_currentTankLevel,
    average_currentTankLevel
FROM 
    SelectedHourIntervals
WHERE 
    time_interval = '${date}' 
ORDER BY 
    time_interval DESC`;


  //  ===================END- TANK LEVEL HISTORY =================
  //  ===================END- TANK LEVEL HISTORY =================



  


  try {

    


    const StringTankLevelHistoryMaxMinAvg = await queryDatabase1(
      queryStringTankLevelHistoryMaxMinAvg
    );
  

    console.log(
      "StringTankLevelHistoryMaxMinAvg --------------",
      StringTankLevelHistoryMaxMinAvg
    );

   



    console.log("data--------", StringTankLevelHistoryMaxMinAvg);
    
 
 

    return StringTankLevelHistoryMaxMinAvg;

  } catch (error) {
    console.log("DATA ERROR----------", error);
  }
  //  =====================================================
}

export const handler = async (event: any) => {
  console.log("Event:-----", event);
  const date = event?.date || "2024-07-01";
  console.log("date:----------", date);
  // const limit = Number(event?.limit)|| 100;
  // console.log("limit:----------", limit);

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
