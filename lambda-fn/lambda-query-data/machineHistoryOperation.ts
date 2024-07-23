const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(interval: string, limit: number) {
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






  // let machineSeconds;

  // if (timeSelected == 10) {
  //   machineSeconds = 10 * 60;    // 10 minutes in seconds
  // } else if (timeSelected == 360) {
  //   machineSeconds = 6 * 3600;     // 6 Hours in seconds
  // } else if (timeSelected == 1440) {
  //   machineSeconds = 24 * 3600;   // 1 day in seconds
  // } else if (timeSelected == 43800) {
  //   machineSeconds = 30* 24* 3600;  // 1 month in seconds
  // } else {
  //   machineSeconds = 1;
  // }



//   SELECT 
//     time_interval,
//     Machine1,
//     Flow_Lpmin_status,
//     working_hours
// FROM (
//     SELECT
//         bin(time, 1d) AS time_interval,
//         Flow_Lpmin AS Machine1,
//         CASE 
//             WHEN Flow_Lpmin < 1 THEN 'false'
//             ELSE 'true'
//         END AS Flow_Lpmin_status,
//         SUM(
//             CASE 
//                 WHEN Flow_Lpmin > 1 THEN 10.0 / 60.0
//                 ELSE 0 
//             END
//         ) OVER (PARTITION BY bin(time, 1d)) AS working_hours,
//         ROW_NUMBER() OVER (PARTITION BY bin(time, 1d) ORDER BY time) AS rn
//     FROM "AquaControl"."alon"
//     WHERE time BETWEEN ago(30d + 10m) AND now() 
//     AND port='x08'
// ) AS subquery
// WHERE rn = 1
// ORDER BY time_interval DESC
// LIMIT 100;

  console.log("timeSelected --------------", timeSelected);


//   SELECT time_interval, Machine1, Flow_Lpmin_status
// FROM (
//     SELECT
//         bin(time, 10m) AS time_interval,
//         Flow_Lpmin AS Machine1,
//         CASE 
//             WHEN Flow_Lpmin < 1 THEN 'false'
//             ELSE 'true'
//         END AS Flow_Lpmin_status,
//         ROW_NUMBER() OVER (PARTITION BY bin(time, 10m) ORDER BY time) AS rn
//     FROM "AquaControl"."alon"
//     WHERE time BETWEEN ago(1d + 10m) AND now() 
//     AND port='x08'
// ) AS subquery
// WHERE rn = 1
// ORDER BY time_interval DESC
// LIMIT 100



// -------------------------------------------------------------------

// WITH FlowData AS (
//   SELECT
//       bin(time, 6h) AS time_interval,
//       Flow_Lpmin AS Machine1,
//       CASE
//           WHEN Flow_Lpmin IS NULL OR Flow_Lpmin < 1 THEN 'false'
//           ELSE 'true'
//       END AS Flow_Lpmin_status,
//       time,
//       LAG(CASE
//               WHEN Flow_Lpmin IS NULL OR Flow_Lpmin < 1 THEN 'false'
//               ELSE 'true'
//           END, 1, 'false') OVER (ORDER BY bin(time, 6h))
//   FROM "AquaControl"."alon"
//   WHERE time BETWEEN ago(7d) AND now()
//   AND port='x08'
// ),

// MachineOperation AS (
//   SELECT
//       time_interval,
//       Machine1,
//       Flow_Lpmin_status,
//       time,
//       CASE
//           WHEN Flow_Lpmin_status = 'true'  THEN time
//           ELSE NULL
//       END AS operation_start_stop
//   FROM FlowData
//   WHERE Machine1 IS NOT NULL
// )

// SELECT
//   time_interval,
//   Machine1,
//   Flow_Lpmin_status,
//   SUM(CASE
//           WHEN operation_start_stop IS NOT NULL THEN 6 * 3600  
//           ELSE 0
//       END) AS operation_seconds
// FROM MachineOperation
// GROUP BY time_interval, Machine1, Flow_Lpmin_status
// ORDER BY time_interval DESC
// LIMIT 100

//   const queryStringhistoryMachineOperation = `WITH FlowData AS (
//     SELECT
//         bin(time, ${timeSelected}m) AS time_interval,
//         Flow_Lpmin AS Machine1,
//         CASE
//             WHEN Flow_Lpmin IS NULL OR Flow_Lpmin < 1 THEN 'false'
//             ELSE 'true'
//         END AS Flow_Lpmin_status,
//         time,
//         LAG(CASE
//                 WHEN Flow_Lpmin IS NULL OR Flow_Lpmin < 1 THEN 'false'
//                 ELSE 'true'
//             END, 1, 'false') OVER (ORDER BY bin(time, ${timeSelected}m)) 
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now()
//     AND port='x08'
// ),

// MachineOperation AS (
//     SELECT
//         time_interval,
//         Machine1,
//         Flow_Lpmin_status,
//         time,
       
//         CASE
//             WHEN Flow_Lpmin_status = 'true'  THEN time
//             ELSE NULL
//         END AS operation_start_stop
//     FROM FlowData
//     WHERE Machine1 IS NOT NULL
// )

// SELECT
//     time_interval,
//     Machine1,
//     Flow_Lpmin_status,
//     SUM(CASE
//             WHEN operation_start_stop IS NOT NULL THEN ${machineSeconds}  
//             ELSE 0
//         END) AS machine_operation_seconds
// FROM MachineOperation
// GROUP BY time_interval, Machine1, Flow_Lpmin_status
// ORDER BY time_interval DESC
// LIMIT ${limit}
           

//     `;

// Query the data using selected time interval and then collect rows for how many rows 
// where Flow_Lpmin > 1 then multiply the by 10 , beacuse each record os added into 10 minute
//Also Check the status of flow_Lpmin if the Flow_Lpmin > 1 then true else false

//     const queryStringhistoryMachineOperation =  `WITH FlowData AS (SELECT
//     BIN(time, ${timeSelected}m) AS time_interval,
//     MAX(CASE WHEN Flow_Lpmin > 1 THEN 'true' ELSE 'false' END) AS Flow_Lpmin_status,
//     SUM(CASE WHEN Flow_Lpmin > 1 THEN 10 ELSE 0 END) AS OperatingTime_minutes,
//     SUM(CASE WHEN Flow_Lpmin > 1 THEN 1 ELSE 0 END) AS Working_row,             
//     AVG(Flow_Lpmin) AS Machine1
// FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
// WHERE time between ago(${intervalExpression} + 10m) and now()
//     AND port = 'x08'
// GROUP BY BIN(time, ${timeSelected}m)
// ORDER BY  BIN(time, ${timeSelected}m)
// )

//  SELECT
//         time_interval,
//         Machine1,
//         Flow_Lpmin_status,
//         OperatingTime_minutes,
//         Working_row
//    FROM FlowData
// GROUP BY time_interval, Machine1, Flow_Lpmin_status, OperatingTime_minutes, Working_row
// ORDER BY time_interval DESC
// LIMIT ${limit}`;




 const queryStringhistoryMachineOperation =`WITH FlowData AS (
    SELECT
        BIN(time, ${timeSelected}m) AS time_interval,
        MAX(CASE WHEN Flow_Lpmin > 1 THEN 'true' ELSE 'false' END) AS Flow_Lpmin_status,
        SUM(CASE WHEN Flow_Lpmin > 1 THEN 10 ELSE 0 END) / 60.0 AS OperatingTime_hours,
        SUM(CASE WHEN Flow_Lpmin > 1 THEN 1 ELSE 0 END) AS Working_row,
        AVG(Flow_Lpmin) AS Machine1
    FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
    WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now()
        AND port = 'x08'
    GROUP BY BIN(time, ${timeSelected}m)
    ORDER BY BIN(time, ${timeSelected}m)
),
TotalOperatingTime_hours AS (
    SELECT
        SUM(OperatingTime_hours) AS TotalOperatingTime_hours
    FROM FlowData
)
SELECT
    fd.time_interval,
    fd.Machine1,
    fd.Flow_Lpmin_status,
    fd.OperatingTime_hours,
    fd.Working_row,
    tot.TotalOperatingTime_hours
FROM FlowData fd
CROSS JOIN TotalOperatingTime_hours tot
ORDER BY fd.time_interval DESC
LIMIT ${limit}`;







// ==================================START- CHANGING QUERY =================================
// ==================================START- CHANGING QUERY =================================
// ==================================START- CHANGING QUERY =================================
//   const queryStringhistoryMachineOperation = `SELECT time_interval, Machine1, Flow_Lpmin_status
// FROM (
//     SELECT
//         bin(time, ${timeSelected}m) AS time_interval,
//         Flow_Lpmin AS Machine1,
//         CASE 
//             WHEN Flow_Lpmin < 1 THEN 'false'
//             ELSE 'true'
//         END AS Flow_Lpmin_status,
//         ROW_NUMBER() OVER (PARTITION BY bin(time, ${timeSelected}m) ORDER BY time) AS rn
//     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//     WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now() 
//     AND port='x08'
// ) AS subquery
// WHERE rn = 1
// ORDER BY time_interval DESC
// LIMIT 100
//   `;

  // ==================================END- CHANGING QUERY =================================
  // ==================================END- CHANGING QUERY =================================
  // ==================================END- CHANGING QUERY =================================

  // const queryStringhistoryMachineOperation = `
  //      SELECT time_interval, Machine1, Flow_Lpmin_status
  //      FROM (
  //      SELECT bin(time, ${timeSelected}m) AS time_interval,
  //      Flow_Lpmin AS Machine1,
  //      CASE
  //      WHEN Flow_Lpmin < 1 THEN 'false'
  //      ELSE 'true'
  //      END AS Flow_Lpmin_status,
  //      ROW_NUMBER() OVER (PARTITION BY bin(time, ${timeSelected}m) ORDER BY time) AS rn
  //      FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  //      WHERE time BETWEEN ago(${intervalExpression} + 10m) AND now()
  //      AND port='x08') AS subquery
  //      WHERE rn = 1
  //      ORDER BY time_interval DESC
  //      LIMIT ${limit}`;

  // Log the query string for debugging
  console.log("Query String:----------", queryStringhistoryMachineOperation);

  const queryDatabase = async (queryString: string) => {
    const params = { QueryString: queryString };

    try {
      const queryResults = await queryClient.query(params).promise();

      console.log("queryResults------", queryResults);

      const items = queryResults.Rows.map((row: any) => {
        const data = {};
        row.Data.forEach((datum, index) => {
          data[queryResults.ColumnInfo[index].Name] = datum.ScalarValue;
        });
        return data;
      });

      return items; // Return the data as a list

      //console.log("items----",items);
    } catch (err) {
      console.log("Error querying Timestream:", err);
    }
  };

  try {
    const StringhistoryMachineOperation = await queryDatabase(
      queryStringhistoryMachineOperation
    );

    console.log(
      "StringhistoryMachineOperation-----",
      StringhistoryMachineOperation
    );

    return StringhistoryMachineOperation;
  } catch (err) {}
}

export const handler: APIGatewayProxyHandler = async (event: any) => {
  console.log("Event:-----", event);
  const interval = event?.interval || "week";

  const port = event?.port || null;
  const limit = Number(event?.limit) || 1000;
  console.log("Interval:----------", interval);
  console.log("port:----------", port);
  console.log("limit:----------", Number(limit));
  try {
    const data = await fetchDataFromTimestream(interval, limit);
    console.log("data----------------", data);
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



// WITH FlowData AS (
//   SELECT
//       bin(time, 30d) AS time_interval,
//       MAX(Flow_Lpmin) AS Machine1,
//       CASE
//           WHEN MAX(Flow_Lpmin) IS NULL OR MAX(Flow_Lpmin) < 1 THEN 'false'
//           ELSE 'true'
//       END AS Flow_Lpmin_status,
      
//       SUM(CASE
//           WHEN Flow_Lpmin >= 1 THEN 1
//           ELSE 0
//       END) AS operation_records
//   FROM "AquaControl"."alon"
//   WHERE time BETWEEN ago(365d) AND now()
//   AND port='x08'
//   GROUP BY bin(time, 30d)
// ),

// OperationIntervals AS (
//   SELECT
//       time_interval,
//       Machine1,
//       Flow_Lpmin_status,
//       ( 6 * 60 * 60 ) AS operation_minutes
//   FROM FlowData
// )

// SELECT
//   time_interval,
//   Machine1,
//   Flow_Lpmin_status,
//   operation_minutes
// FROM OperationIntervals
// ORDER BY time_interval DESC
// LIMIT 200