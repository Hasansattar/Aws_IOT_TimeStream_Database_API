const AWS = require("aws-sdk");
//const axios = require('axios');
const https = require("https");
import { APIGatewayProxyHandler } from "aws-lambda";
const queryClient = new AWS.TimestreamQuery();

export const handler = async (event: any) => {
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

  // ==========================================START- GRAPH BAR X08 AND X04 ========================================

//   const queryStringBarGraphx08For10MinADay = `
//  SELECT 
//     bin(time, 10m) AS time_interval, 
//     AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_10Min
// FROM "${databaseName}"."${tableName}"
// WHERE time BETWEEN ago(1d) AND now() AND port = 'x08'
// GROUP BY bin(time, 10m)
// ORDER BY time_interval
// `;

//   const queryStringBarGraphx08For1DayAMonth = `
//  SELECT 
//     bin(time, 1d) AS time_interval, 
//     AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_1Day
// FROM "${databaseName}"."${tableName}"
// WHERE time BETWEEN ago(30d) AND now() AND port = 'x08'
// GROUP BY bin(time, 1d)
// ORDER BY time_interval
// `;

//   const queryStringBarGraphx08For6HoursAWeek = `
//  SELECT 
//     bin(time, 360m) AS time_interval, 
//     AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_6Hours
// FROM "${databaseName}"."${tableName}"
// WHERE time BETWEEN ago(7d) AND now() AND port = 'x08'
// GROUP BY bin(time, 360m)
// ORDER BY time_interval
// `;

//   const queryStringBarGraphx08For1MonthAYear = `
//  SELECT 
//     bin(time, 30d) AS time_interval, 
//     AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_1Month
// FROM "${databaseName}"."${tableName}"
// WHERE time BETWEEN ago(365d) AND now() AND port = 'x08'
// GROUP BY bin(time, 30d)
// ORDER BY time_interval
// `;

//   const queryStringBarGraphx04For10MinADay = `
//  SELECT 
//     bin(time, 10m) AS time_interval, 
//     AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_10Min
// FROM "${databaseName}"."${tableName}"
// WHERE time BETWEEN ago(1d) AND now() AND port = 'x04'
// GROUP BY bin(time, 10m)
// ORDER BY time_interval
// `;

  // ==========================================END- GRAPH BAR X08 AND X04 ========================================

  //==========================START- RECENT 24 hours VALUE OF x08 and X04========================

//   const queryStringRecent24HoursWaterflowx04 = `
//  SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_Recent24Hours 
//  FROM "${databaseName}"."${tableName}"
//  WHERE time between ago(1d) and now() AND port='x04' 
//  GROUP BY port
// `;

//   const queryStringRecent24HoursWaterflowx08 = `
//  SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_Recent24Hours
//  FROM "${databaseName}"."${tableName}"
//  WHERE time between ago(1d) and now() AND port='x08' 
//  GROUP BY port
// `;

  //==========================END- RECENT 24 hours VALUE OF x08 and X04========================

  // ===========================START- CURRENT VALUE OF x08 and X04 =========================
//   const queryStringCurrentWaterflowx04 = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_Current  
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(10m) and now() AND port='x04' 
//   GROUP BY port
// `;

//   const queryStringCurrentWaterflowx08 = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_Current
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(10m) and now() AND port='x08' 
//   GROUP BY port
// `;

  // ===========================END- CURRENT VALUE OF x08 and X04 =========================

  //  =============================START- PER DAY- TOTILIZER PRODUCTION AND DISTRIBUTION  X08 - X04=============================

  const queryStringTotilizerPreviosWaterflowX04PerDay = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_OneDayAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(1d + 10m) AND ago(1d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerDay = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX04PerWeek = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_OneWeekAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(7d + 10m) AND ago(7d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerWeek = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX04PerMonth = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_LastMonthAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(30d + 10m) AND ago(30d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerMonth = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX04PerYear = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_LastYearAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(365d + 10m) AND ago(365d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerYear = `
  SELECT Totaliser1_L AS Totaliser1_L_x04_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  // ------------------------------------------------------------------------------------------------------

  const queryStringTotilizerPreviosWaterflowX08PerDay = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_OneDayAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(1d + 10m) AND ago(1d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerDay = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX08PerWeek = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_OneWeekAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(7d + 10m) AND ago(7d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerWeek = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX08PerMonth = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_LastMonthAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(30d + 10m) AND ago(30d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerMonth = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX08PerYear = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_LastYearAgo
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(365d + 10m) AND ago(365d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerYear = `
  SELECT Totaliser1_L AS Totaliser1_L_x08_Last10Minutes
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  //  =============================END- PER DAY- TOTILIZER PRODUCTION AND DISTRIBUTION X08 - X04 =============================

  // ===============================START- PER DAY- Water production x08 And distribution x04=============================

  // Query strings for different ports
//   const queryStringPreviosWaterflowX04PerDay = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_Previous 
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(2d) and ago(1d) AND port='x04'
//     GROUP BY port
//   `;

//   const queryStringCurrentWaterflowx04PerDay = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_Current  
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(1d) and now() AND port='x04' 
//     GROUP BY port
//   `;

//   const queryStringPreviosWaterflowX08PerDay = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_Previous  
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(2d) and ago(1d) AND port='x08'
//   GROUP BY port
// `;

//   const queryStringCurrentWaterflowx08PerDay = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_Current
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(1d) and now() AND port='x08' 
//   GROUP BY port
// `;

  // ===============================END- PER DAY- Water production x08 And distribution x04 =============================

  // ===============================START- PER WEEK- Water production x08 And distribution x04=============================

  // Query strings for different ports
//   const queryStringPreviosWaterflowX04PerWeek = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_Previous 
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(14d) and ago(7d) AND port='x04'
//     GROUP BY port
//   `;

//   const queryStringCurrentWaterflowx04PerWeek = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_04_Current  
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(7d) and now() AND port='x04' 
//     GROUP BY port
//   `;

//   const queryStringPreviosWaterflowX08PerWeek = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_Previous  
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(14d) and ago(7d) AND port='x08'
//   GROUP BY port
// `;

//   const queryStringCurrentWaterflowx08PerWeek = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_08_Current
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(7d) and now() AND port='x08' 
//   GROUP BY port
// `;

  // ===============================END- PER WEEK- Water production x08 And distribution x04 =============================

  // ===============================START- PER MONTH- Water production x08 And distribution x04=============================

  // Query strings for different ports
//   const queryStringPreviosWaterflowX04PerMonth = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_Previous 
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(60d) and ago(30d) AND port='x04'
//     GROUP BY port
//   `;

//   const queryStringCurrentWaterflowx04PerMonth = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_04_Current  
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(30d) and now() AND port='x04' 
//     GROUP BY port
//   `;

//   const queryStringPreviosWaterflowX08PerMonth = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_Previous  
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(60d) and ago(30d) AND port='x08'
//   GROUP BY port
// `;

//   const queryStringCurrentWaterflowx08PerMonth = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_08_Current
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(30d) and now() AND port='x08' 
//   GROUP BY port
// `;

  // ===============================END- PER MONTH- Water production x08 And distribution x04 =============================

  // ===============================START- PER YEAR- Water production x08 And distribution x04=============================

  // Query strings for different ports
//   const queryStringPreviosWaterflowX04PerYear = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_Previous 
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(730d) and ago(365d) AND port='x04'
//     GROUP BY port
//   `;

//   const queryStringCurrentWaterflowx04PerYear = `
//     SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_04_Current  
//     FROM "${databaseName}"."${tableName}"
//     WHERE time between ago(365d) and now() AND port='x04' 
//     GROUP BY port
//   `;

//   const queryStringPreviosWaterflowX08PerYear = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_Previous  
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(730d) and ago(365d) AND port='x08'
//   GROUP BY port
// `;

//   const queryStringCurrentWaterflowx08PerYear = `
//   SELECT AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_08_Current
//   FROM "${databaseName}"."${tableName}"
//   WHERE time between ago(365d) and now() AND port='x08' 
//   GROUP BY port
// `;

  // ===============================END- PER YEAR- Water production x08 And distribution x04 =============================

  // ======================================START- History of x08 and x04 Per Month =============================

  // const queryStringHistoryOfWaterflowx08PerMonth = `
  //   SELECT date_trunc('day', time) AS day, AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x08_day
  //   FROM "${databaseName}"."${tableName}"
  //   WHERE time between ago(30d) and now() AND port='x08'
  //   GROUP BY date_trunc('day', time)
  //   ORDER BY day ASC
  //   `;

  // const queryStringHistoryOfWaterflowx04PerMonth = `
  // SELECT date_trunc('day', time) AS day, AVG(CAST(Flow_Lpmin AS double)) AS avg_Flow_Lpmin_x04_day
  // FROM "${databaseName}"."${tableName}"
  // WHERE time between ago(30d) and now() AND port='x04'
  // GROUP BY date_trunc('day', time)
  // ORDER BY day ASC
  // `;
  // ======================================END- History of x08 and x04 Per Month =============================

  // =========================================START- History of x08 and x04 Per Day =============================

  const queryStringHistoryOfWaterflowx04PerDay = `
   SELECT  bin(time, 10m) AS time_interval,
    Flow_Lpmin AS Flow_Lpmin_x04_10min
    FROM "${databaseName}"."${tableName}"
    WHERE  time >= ago(1d) 
    AND port = 'x04'
    ORDER BY 
    time_interval ASC`;

  const queryStringHistoryOfWaterflowx08PerDay = `
    SELECT  bin(time, 10m) AS time_interval,
      Flow_Lpmin AS Flow_Lpmin_x08_10min
      FROM "${databaseName}"."${tableName}"
      WHERE time >= ago(1d) 
      AND port = 'x08'
      ORDER BY 
      time_interval ASC`;

  // =========================================END- History of x08 and x04 Per Day =============================




  // ==========================================SATRT- HISTORY OF X08  AND X04  PER WEEK================= 

  const queryStringHistoryOfWaterflowx04PerWeek = `
  SELECT bin(time, 6h) AS time_interval,
  AVG(Flow_Lpmin) AS Flow_Lpmin_x04_6hr
  FROM "${databaseName}"."${tableName}"
  WHERE time >= ago(7d) 
  AND port = 'x04'
  GROUP BY bin(time, 6h)
  ORDER BY time_interval ASC`;

  const queryStringHistoryOfWaterflowx08PerWeek = `
    SELECT bin(time, 6h) AS time_interval,
    AVG(Flow_Lpmin) AS Flow_Lpmin_x08_6hr
    FROM "${databaseName}"."${tableName}"
    WHERE time >= ago(7d) 
    AND port = 'x08'
    GROUP BY bin(time, 6h)
    ORDER BY time_interval ASC`;


   // ==========================================END- HISTORY OF X08  AND X04  PER WEEK================= 


     // ==========================================SATART- HISTORY OF X08  AND X04  PER MONTH================= 

  const queryStringHistoryOfWaterflowx04PerMonth = `
  SELECT bin(time, 1d) AS time_interval,
  AVG(Flow_Lpmin) AS Flow_Lpmin_x04_1day
  FROM "${databaseName}"."${tableName}"
  WHERE time >= ago(30d) 
  AND port = 'x04'
  GROUP BY bin(time, 1d)
  ORDER BY time_interval ASC`;

  const queryStringHistoryOfWaterflowx08PerMonth = `
    SELECT bin(time, 1d) AS time_interval,
    AVG(Flow_Lpmin) AS Flow_Lpmin_x08_1day
    FROM "${databaseName}"."${tableName}"
    WHERE time >= ago(30d) 
    AND port = 'x08'
    GROUP BY bin(time, 1d)
    ORDER BY time_interval ASC`;


   // ==========================================END- HISTORY OF X08  AND X04  PER MONTH================= 





   // ==========================================SATART- HISTORY OF X08  AND X04  PER YEAR ================ 

  const queryStringHistoryOfWaterflowx04PerYear = `
  SELECT bin(time, 30d) AS time_interval,
  AVG(Flow_Lpmin) AS Flow_Lpmin_x04_1month
  FROM "${databaseName}"."${tableName}"
  WHERE time >= ago(365d) 
  AND port = 'x04'
  GROUP BY bin(time, 30d)
  ORDER BY time_interval ASC`;

  const queryStringHistoryOfWaterflowx08PerYear = `
    SELECT bin(time, 30d) AS time_interval,
    AVG(Flow_Lpmin) AS Flow_Lpmin_x08_1month
    FROM "${databaseName}"."${tableName}"
    WHERE time >= ago(365d) 
    AND port = 'x08'
    GROUP BY bin(time, 30d)
    ORDER BY time_interval ASC`;


   // ==========================================END- HISTORY OF X08  AND X04  PER YEAR ================= 




  //  ===================START- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================
  //  ===================START- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================



    const currentValueX08Flowlpmin =
  `SELECT Flow_Lpmin 
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1`;  


  const currentValueX04Flowlpmin =
  `SELECT Flow_Lpmin 
  FROM "${databaseName}"."${tableName}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1`; 


  //  ===================END- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================
  //  ===================END- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================

  try {
    // Querying the data

    // const avgFlowLpminX04Recent24HoursWater = await queryDatabase(
    //   queryStringRecent24HoursWaterflowx04
    // );
    // const avgFlowLpminX08Recent24HoursWater = await queryDatabase(
    //   queryStringRecent24HoursWaterflowx08
    // );

    // const avgFlowLpminX04CurrentWater = await queryDatabase(
    //   queryStringCurrentWaterflowx04
    // );
    // const avgFlowLpminX08CurrentWater = await queryDatabase(
    //   queryStringCurrentWaterflowx08
    // );

    // ========================================START- PER DAY FLOW======================

    // const avgFlowLpminX04PreviosWaterPerDay = await queryDatabase(
    //   queryStringPreviosWaterflowX04PerDay
    // );
    // const avgFlowLpminX04CurrentWaterPerDay = await queryDatabase(
    //   queryStringCurrentWaterflowx04PerDay
    // );
    // const avgFlowLpminX08PreviosWaterPerDay = await queryDatabase(
    //   queryStringPreviosWaterflowX08PerDay
    // );
    // const avgFlowLpminX08CurrentWaterPerDay = await queryDatabase(
    //   queryStringCurrentWaterflowx08PerDay
    // );

     // ========================================END- PER DAY FLOW======================

    // const avgFlowLpminX04PreviosWaterPerWeek = await queryDatabase(
    //   queryStringPreviosWaterflowX04PerWeek
    // );
    // const avgFlowLpminX04CurrentWaterPerWeek = await queryDatabase(
    //   queryStringCurrentWaterflowx04PerWeek
    // );
    // const avgFlowLpminX08PreviosWaterPerWeek = await queryDatabase(
    //   queryStringPreviosWaterflowX08PerWeek
    // );
    // const avgFlowLpminX08CurrentWaterPerWeek = await queryDatabase(
    //   queryStringCurrentWaterflowx08PerWeek
    // );

    // const avgFlowLpminX04PreviosWaterPerMonth = await queryDatabase(
    //   queryStringPreviosWaterflowX04PerMonth
    // );
    // const avgFlowLpminX04CurrentWaterPerMonth = await queryDatabase(
    //   queryStringCurrentWaterflowx04PerMonth
    // );
    // const avgFlowLpminX08PreviosWaterPerMonth = await queryDatabase(
    //   queryStringPreviosWaterflowX08PerMonth
    // );
    // const avgFlowLpminX08CurrentWaterPerMonth = await queryDatabase(
    //   queryStringCurrentWaterflowx08PerMonth
    // );

    // const avgFlowLpminX04PreviosWaterPerYear = await queryDatabase(
    //   queryStringPreviosWaterflowX04PerYear
    // );
    // const avgFlowLpminX04CurrentWaterPerYear = await queryDatabase(
    //   queryStringCurrentWaterflowx04PerYear
    // );
    // const avgFlowLpminX08PreviosWaterPerYear = await queryDatabase(
    //   queryStringPreviosWaterflowX08PerYear
    // );
    // const avgFlowLpminX08CurrentWaterPerYear = await queryDatabase(
    //   queryStringCurrentWaterflowx08PerYear
    // );

    // ===================START- History x08 x04 per day====================

    // const avgFlowLpminX08HistoryWaterPerMonth  = await queryDatabase1(queryStringHistoryOfWaterflowx08PerMonth);
    // const avgFlowLpminX04HistoryWaterPerMonth  = await queryDatabase1(queryStringHistoryOfWaterflowx04PerMonth);

    const avgFlowLpminX08HistoryWaterPerDay = await queryDatabase1(
      queryStringHistoryOfWaterflowx08PerDay
    );
    const avgFlowLpminX04HistoryWaterPerDay = await queryDatabase1(
      queryStringHistoryOfWaterflowx04PerDay
    );


    const avgFlowLpminX08HistoryWaterPerWeek = await queryDatabase1(
      queryStringHistoryOfWaterflowx08PerWeek
    );
    const avgFlowLpminX04HistoryWaterPerWeek = await queryDatabase1(
      queryStringHistoryOfWaterflowx04PerWeek
    );


    const avgFlowLpminX08HistoryWaterPerMonth = await queryDatabase1(
      queryStringHistoryOfWaterflowx08PerMonth
    );
    const avgFlowLpminX04HistoryWaterPerMonth = await queryDatabase1(
      queryStringHistoryOfWaterflowx04PerMonth
    );


    const avgFlowLpminX08HistoryWaterPerYear = await queryDatabase1(
      queryStringHistoryOfWaterflowx08PerYear
    );
    const avgFlowLpminX04HistoryWaterPerYear = await queryDatabase1(
      queryStringHistoryOfWaterflowx04PerYear
    );




    //=====================end - History x08 x04 per day====================



    // =================================START- GRAPH QUERYIES =================================
    // const BarGraphx08For10MinADay = await queryDatabase1(
    //   queryStringBarGraphx08For10MinADay
    // );
    // const BarGraphx08For1DayAMonth = await queryDatabase1(
    //   queryStringBarGraphx08For1DayAMonth
    // );
    // const BarGraphx08For6HoursAWeek = await queryDatabase1(
    //   queryStringBarGraphx08For6HoursAWeek
    // );
    // const BarGraphx08For1MonthAYear = await queryDatabase1(
    //   queryStringBarGraphx08For1MonthAYear
    // );

    // const BarGraphx04For10MinADay = await queryDatabase1(
    //   queryStringBarGraphx04For10MinADay
    // );

    // =================================END- GRAPH QUERYIES =================================

    console.log(
      "avgFlowLpminX08HistoryWaterPerDay --------------",
      avgFlowLpminX08HistoryWaterPerDay
    );
    console.log(
      "avgFlowLpminX04HistoryWaterPerDay --------------",
      avgFlowLpminX04HistoryWaterPerDay
    );

    // console.log("avgFlowLpminX08HistoryWaterPerMonth --------------",avgFlowLpminX08HistoryWaterPerMonth );
    // console.log("avgFlowLpminX04HistoryWaterPerMonth --------------",avgFlowLpminX04HistoryWaterPerMonth );

    // console.log(
    //   "avgFlowLpminX04CurrentWater --------------",
    //   avgFlowLpminX04CurrentWater
    // );
    // console.log(
    //   "avgFlowLpminX08CurrentWater  --------------",
    //   avgFlowLpminX08CurrentWater
    // );

    // console.log(
    //   "avgFlowLpminX04PreviosWaterPerDay --------------",
    //   avgFlowLpminX04PreviosWaterPerDay
    // );
    // console.log(
    //   "avgFlowLpminX04CurrentWaterPerDay  --------------",
    //   avgFlowLpminX04CurrentWaterPerDay
    // );
    // console.log(
    //   "avgFlowLpminX08PreviosWaterPerDay --------------",
    //   avgFlowLpminX08PreviosWaterPerDay
    // );
    // console.log(
    //   "avgFlowLpminX08CurrentWaterPerDay --------------",
    //   avgFlowLpminX08CurrentWaterPerDay
    // );

    // console.log(
    //   "avgFlowLpminX04PreviosWaterPerWeek --------------",
    //   avgFlowLpminX04PreviosWaterPerWeek
    // );
    // console.log(
    //   "avgFlowLpminX04CurrentWaterPerWeek  --------------",
    //   avgFlowLpminX04CurrentWaterPerWeek
    // );
    // console.log(
    //   "avgFlowLpminX08PreviosWaterPerWeek --------------",
    //   avgFlowLpminX08PreviosWaterPerWeek
    // );
    // console.log(
    //   "avgFlowLpminX08CurrentWaterPerWeek --------------",
    //   avgFlowLpminX08CurrentWaterPerWeek
    // );

    // console.log(
    //   "avgFlowLpminX04PreviosWaterPerMonth --------------",
    //   avgFlowLpminX04PreviosWaterPerMonth
    // );
    // console.log(
    //   "avgFlowLpminX04CurrentWaterPerMonth  --------------",
    //   avgFlowLpminX04CurrentWaterPerMonth
    // );
    // console.log(
    //   "avgFlowLpminX08PreviosWaterPerMonth --------------",
    //   avgFlowLpminX08PreviosWaterPerMonth
    // );
    // console.log(
    //   "avgFlowLpminX08CurrentWaterPerMonth --------------",
    //   avgFlowLpminX08CurrentWaterPerMonth
    // );

    // console.log(
    //   "avgFlowLpminX04PreviosWaterPerYear --------------",
    //   avgFlowLpminX04PreviosWaterPerYear
    // );
    // console.log(
    //   "avgFlowLpminX04CurrentWaterPerYear  --------------",
    //   avgFlowLpminX04CurrentWaterPerYear
    // );
    // console.log(
    //   "avgFlowLpminX08PreviosWaterPerYear --------------",
    //   avgFlowLpminX08PreviosWaterPerYear
    // );
    // console.log(
    //   "avgFlowLpminX08CurrentWaterPerYear --------------",
    //   avgFlowLpminX08CurrentWaterPerYear
    // );

    // console.log(
    //   "BarGraphx08For10MinADay --------------",
    //   BarGraphx08For10MinADay
    // );
    // console.log(
    //   "BarGraphx08For1DayAMonth --------------",
    //   BarGraphx08For1DayAMonth
    // );
    // console.log(
    //   "BarGraphx08For6HoursAWeek --------------",
    //   BarGraphx08For6HoursAWeek
    // );
    // console.log(
    //   "BarGraphx08For1MonthAYear --------------",
    //   BarGraphx08For1MonthAYear
    // );

    // console.log(
    //   "BarGraphx04For10MinADay --------------",
    //   BarGraphx04For10MinADay
    // );

    // =============================TOTILZER X04 and X08 =============================

    const TotilizerPreviosWaterflowX04PerDay = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX04PerDay
    );
    const TotilizerCurrentWaterflowx04PerDay = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx04PerDay
    );
    const TotilizerPreviosWaterflowX04PerWeek = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX04PerWeek
    );
    const TotilizerCurrentWaterflowx04PerWeek = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx04PerWeek
    );
    const TotilizerPreviosWaterflowX04PerMonth = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX04PerMonth
    );
    const TotilizerCurrentWaterflowx04PerMonth = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx04PerMonth
    );
    const TotilizerPreviosWaterflowX04PerYear = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX04PerYear
    );
    const TotilizerCurrentWaterflowx04PerYear = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx04PerYear
    );

    console.log(
      "TotilizerPreviosWaterflowX04PerDay -----------",
      TotilizerPreviosWaterflowX04PerDay
    );
    console.log(
      "TotilizerCurrentWaterflowx04PerDay ---------",
      TotilizerCurrentWaterflowx04PerDay
    );
    console.log(
      "TotilizerPreviosWaterflowX04PerWeek -----------",
      TotilizerPreviosWaterflowX04PerWeek
    );
    console.log(
      "TotilizerCurrentWaterflowx04PerWeek ---------",
      TotilizerCurrentWaterflowx04PerWeek
    );
    console.log(
      "TotilizerPreviosWaterflowX04PerMonth ------------",
      TotilizerPreviosWaterflowX04PerMonth
    );
    console.log(
      "TotilizerCurrentWaterflowx04PerMonth------------",
      TotilizerCurrentWaterflowx04PerMonth
    );
    console.log(
      "TotilizerPreviosWaterflowX04PerYear ------------",
      TotilizerPreviosWaterflowX04PerYear
    );
    console.log(
      "TotilizerCurrentWaterflowx04PerYear ------------",
      TotilizerCurrentWaterflowx04PerYear
    );

    // =================================================================
    const StringCurrentValueX08Flowlpmin = await queryDatabase(
      currentValueX08Flowlpmin
    );

    const StringCurrentValueX04Flowlpmin = await queryDatabase(
      currentValueX04Flowlpmin
    );

  // =================================================================

    const TotilizerPreviosWaterflowX08PerDay = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX08PerDay
    );
    const TotilizerCurrentWaterflowx08PerDay = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx08PerDay
    );
    const TotilizerPreviosWaterflowX08PerWeek = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX08PerWeek
    );
    const TotilizerCurrentWaterflowx08PerWeek = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx08PerWeek
    );
    const TotilizerPreviosWaterflowX08PerMonth = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX08PerMonth
    );
    const TotilizerCurrentWaterflowx08PerMonth = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx08PerMonth
    );
    const TotilizerPreviosWaterflowX08PerYear = await queryDatabase(
      queryStringTotilizerPreviosWaterflowX08PerYear
    );
    const TotilizerCurrentWaterflowx08PerYear = await queryDatabase(
      queryStringTotilizerCurrentWaterflowx08PerYear
    );

    console.log(
      "TotilizerPreviosWaterflowX08PerDay -----------",
      TotilizerPreviosWaterflowX08PerDay
    );
    console.log(
      "TotilizerCurrentWaterflowx08PerDay ---------",
      TotilizerCurrentWaterflowx08PerDay
    );
    console.log(
      "TotilizerPreviosWaterflowX08PerWeek -----------",
      TotilizerPreviosWaterflowX08PerWeek
    );
    console.log(
      "TotilizerCurrentWaterflowx08PerWeek ---------",
      TotilizerCurrentWaterflowx08PerWeek
    );
    console.log(
      "TotilizerPreviosWaterflowX08PerMonth ------------",
      TotilizerPreviosWaterflowX08PerMonth
    );
    console.log(
      "TotilizerCurrentWaterflowx08PerMonth------------",
      TotilizerCurrentWaterflowx08PerMonth
    );
    console.log(
      "TotilizerPreviosWaterflowX08PerYear ------------",
      TotilizerPreviosWaterflowX08PerYear
    );
    console.log(
      "TotilizerCurrentWaterflowx08PerYear ------------",
      TotilizerCurrentWaterflowx08PerYear
    );

    const FlowWaterDistributionX04TotilizerRecent24Hours =
      TotilizerCurrentWaterflowx04PerDay - TotilizerPreviosWaterflowX04PerDay;
    const FlowWaterDistributionX04TotilizerPerWeek =
      TotilizerCurrentWaterflowx04PerWeek - TotilizerPreviosWaterflowX04PerWeek;
    const FlowWaterDistributionX04TotilizerPerMonth =
      TotilizerCurrentWaterflowx04PerMonth -
      TotilizerPreviosWaterflowX04PerMonth;
    const FlowWaterDistributionX04TotilizerPerYear =
      TotilizerCurrentWaterflowx04PerYear - TotilizerPreviosWaterflowX04PerYear;

    const FlowWaterDistributionX08TotilizerRecent24Hours =
      TotilizerCurrentWaterflowx08PerDay - TotilizerPreviosWaterflowX08PerDay;
    const FlowWaterDistributionX08TotilizerPerWeek =
      TotilizerCurrentWaterflowx08PerWeek - TotilizerPreviosWaterflowX08PerWeek;
    const FlowWaterDistributionX08TotilizerPerMonth =
      TotilizerCurrentWaterflowx08PerMonth -
      TotilizerPreviosWaterflowX08PerMonth;
    const FlowWaterDistributionX08TotilizerPerYear =
      TotilizerCurrentWaterflowx08PerYear - TotilizerPreviosWaterflowX08PerYear;

    console.log(
      "FlowWaterDistributionX04TotilizerRecent24Hours",
      FlowWaterDistributionX04TotilizerRecent24Hours
    );
    console.log(
      "FlowWaterDistributionX04TotilizerPerWeek",
      FlowWaterDistributionX04TotilizerPerWeek
    );
    console.log(
      "FlowWaterDistributionX04TotilizerPerMonth",
      FlowWaterDistributionX04TotilizerPerMonth
    );
    console.log(
      "FlowWaterDistributionX04TotilizerPerYear",
      FlowWaterDistributionX04TotilizerPerYear
    );

    console.log(
      "FlowWaterDistributionX08TotilizerRecent24Hours",
      FlowWaterDistributionX08TotilizerRecent24Hours
    );
    console.log(
      "FlowWaterDistributionX08TotilizerPerWeek",
      FlowWaterDistributionX08TotilizerPerWeek
    );
    console.log(
      "FlowWaterDistributionX08TotilizerPerMonth",
      FlowWaterDistributionX08TotilizerPerMonth
    );
    console.log(
      "FlowWaterDistributionX08TotilizerPerYear",
      FlowWaterDistributionX08TotilizerPerYear
    );

    // =============================END TOTILZER X04 and X08 =============================

    // const WaterDistributionX04ResultPerDay =
    //   avgFlowLpminX04CurrentWaterPerDay - avgFlowLpminX04PreviosWaterPerDay;
    // const WaterProductionX08ResultPerDay =
    //   avgFlowLpminX08CurrentWaterPerDay - avgFlowLpminX08PreviosWaterPerDay;

    // const WaterDistributionX04ResultPerWeek =
    //   avgFlowLpminX04CurrentWaterPerWeek - avgFlowLpminX04PreviosWaterPerWeek;
    // const WaterProductionX08ResultPerWeek =
    //   avgFlowLpminX08CurrentWaterPerWeek - avgFlowLpminX08PreviosWaterPerWeek;

    // const WaterDistributionX04ResultPerMonth =
    //   avgFlowLpminX04CurrentWaterPerMonth - avgFlowLpminX04PreviosWaterPerMonth;
    // const WaterProductionX08ResultPerMonth =
    //   avgFlowLpminX08CurrentWaterPerMonth - avgFlowLpminX08PreviosWaterPerMonth;

    // const WaterDistributionX04ResultPerYear =
    //   avgFlowLpminX04CurrentWaterPerYear - avgFlowLpminX04PreviosWaterPerYear;
    // const WaterProductionX08ResultPerYear =
    //   avgFlowLpminX08CurrentWaterPerYear - avgFlowLpminX08PreviosWaterPerYear;

    // const WateravgFlowLpminX04Recent24HoursWater =
    //   avgFlowLpminX04Recent24HoursWater;
    // const WaterAvgFlowLpminX08Recent24HoursWater =
    //   avgFlowLpminX08Recent24HoursWater;

    // const WaterAvgFlowLpminX04CurrentWater = avgFlowLpminX04CurrentWater;
    // const WaterAvgFlowLpminX08CurrentWater = avgFlowLpminX08CurrentWater;

    // const WaterAvgFlowLpminX08HistoryWaterPerMonth=avgFlowLpminX08HistoryWaterPerMonth;
    // const WaterAvgFlowLpminX04HistoryWaterPerMonth=avgFlowLpminX04HistoryWaterPerMonth;

     const WaterAvgFlowLpminX08HistoryWaterPerDay =
      avgFlowLpminX08HistoryWaterPerDay;
     const WaterAvgFlowLpminX04HistoryWaterPerDay =
      avgFlowLpminX04HistoryWaterPerDay;



      const WaterAvgFlowLpminX08HistoryWaterPerWeek =
      avgFlowLpminX08HistoryWaterPerWeek;
      const WaterAvgFlowLpminX04HistoryWaterPerWeek =
      avgFlowLpminX04HistoryWaterPerWeek;

      const WaterAvgFlowLpminX08HistoryWaterPerMonth =
      avgFlowLpminX08HistoryWaterPerMonth;
      const WaterAvgFlowLpminX04HistoryWaterPerMonth =
      avgFlowLpminX04HistoryWaterPerMonth;



      const WaterAvgFlowLpminX08HistoryWaterPerYear =
      avgFlowLpminX08HistoryWaterPerYear;
      const WaterAvgFlowLpminX04HistoryWaterPerYear =
      avgFlowLpminX04HistoryWaterPerYear;








    // console.log(
    //   "avgFlowLpminX04Recent24HoursWater --------",
    //   WateravgFlowLpminX04Recent24HoursWater
    // );
    // console.log(
    //   "avgFlowLpminX08Recent24HoursWater --------",
    //   WaterAvgFlowLpminX08Recent24HoursWater
    // );
    // console.log(
    //   "avgFlowLpminX04CurrentWater --------",
    //   WaterAvgFlowLpminX04CurrentWater
    // );
    // console.log(
    //   "avgFlowLpminX08CurrentWater --------",
    //   WaterAvgFlowLpminX08CurrentWater
    // );

    const data = {
      x04Input: { 
        waterDistributionX04CurrentFlowLpmin:StringCurrentValueX04Flowlpmin,
        waterDistributionX04Recent24Hours:FlowWaterDistributionX04TotilizerRecent24Hours,
        waterDistributionX04Current: TotilizerCurrentWaterflowx04PerDay,
        waterDistributionX04PerDay:FlowWaterDistributionX04TotilizerRecent24Hours,
        waterDistributionX04PerWeek: FlowWaterDistributionX04TotilizerPerWeek,
        waterDistributionX04PerMonth: FlowWaterDistributionX04TotilizerPerMonth,
        waterDistributionX04PerYear: FlowWaterDistributionX04TotilizerPerYear,
        waterDistributionHistoryX04PerDay:WaterAvgFlowLpminX04HistoryWaterPerDay,
        waterDistributionHistoryX04PerWeek:WaterAvgFlowLpminX04HistoryWaterPerWeek,
        waterDistributionHistoryX04PerMonth:WaterAvgFlowLpminX04HistoryWaterPerMonth,
        waterDistributionHistoryX04PerYear:WaterAvgFlowLpminX04HistoryWaterPerYear,

      },
      x08Input: {
        waterProductionX08CurrentFlowLpmin:StringCurrentValueX08Flowlpmin,
        waterProductionX08Recent24Hours:FlowWaterDistributionX08TotilizerRecent24Hours,
        waterProductionX08Current: TotilizerCurrentWaterflowx08PerDay,
        waterProductionX08PerDay:FlowWaterDistributionX08TotilizerRecent24Hours,
        waterProductionX08PerWeek: FlowWaterDistributionX08TotilizerPerWeek,
        waterProductionX08PerMonth: FlowWaterDistributionX08TotilizerPerMonth,
        waterProductionX08PerYear: FlowWaterDistributionX08TotilizerPerYear,
        waterProductionHistoryX08PerDay: WaterAvgFlowLpminX08HistoryWaterPerDay,
        waterProductionHistoryX08PerWeek:WaterAvgFlowLpminX08HistoryWaterPerWeek,
        waterProductionHistoryX08PerMonth:WaterAvgFlowLpminX08HistoryWaterPerMonth,
        waterProductionHistoryX08PerYear:WaterAvgFlowLpminX08HistoryWaterPerYear,


        
      }
    };

    console.log("data--------", data);

    // port: "x04",
    // avgFlowLpmin: ${avgFlowLpminX04},

    const postData = JSON.stringify({
      query: `
              mutation UpdateWaterProductionAndDistribution($input: WaterProductionAndDistributionInput) {
                updateWaterProductionAndDistribution(input: $input) {
                  
                  x04 {
                      waterDistributionX04CurrentFlowLpmin
                      waterDistributionX04Recent24Hours
                      waterDistributionX04Current
                      waterDistributionX04PerDay
                      waterDistributionX04PerWeek
                      waterDistributionX04PerMonth
                      waterDistributionX04PerYear
                      waterDistributionHistoryX04PerDay {
                              time_interval
                              Flow_Lpmin_x04_10min
                    
                          }
                      waterDistributionHistoryX04PerWeek {
                              time_interval
                              Flow_Lpmin_x04_6hr
                    
                          } 
                      waterDistributionHistoryX04PerMonth {
                              time_interval
                              Flow_Lpmin_x04_1day
                    
                          }               
                      
                      waterDistributionHistoryX04PerYear {
                              time_interval
                              Flow_Lpmin_x04_1month
                    
                          }      

                      }
                  x08 {
                    waterProductionX08CurrentFlowLpmin
                    waterProductionX08Recent24Hours
                    waterProductionX08Current
                    waterProductionX08PerDay
                    waterProductionX08PerWeek
                    waterProductionX08PerMonth
                    waterProductionX08PerYear
                    waterProductionHistoryX08PerDay {
                           time_interval
                           Flow_Lpmin_x08_10min
                    
                         }
                    waterProductionHistoryX08PerWeek {
                           time_interval
                           Flow_Lpmin_x08_6hr
                    
                         }       
                    waterProductionHistoryX08PerMonth {
                           time_interval
                           Flow_Lpmin_x08_1day
                    
                         }
                    waterProductionHistoryX08PerYear {
                           time_interval
                           Flow_Lpmin_x08_1month
                    
                         }
                    
                         
                  }
                  
                }
              }
            `,
      variables: {
        input: data,
      },
    });

    console.log("postData---------------------", postData);

    const options = {
      hostname: new URL(appsyncApiEndpoint).hostname,
      path: new URL(appsyncApiEndpoint).pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/graphql",
        "x-api-key": appsyncApiKey,
      },
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(JSON.parse(data));
        });
      });

      req.on("error", (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    });

    console.log("Mutation1 Response:----------", postData);
    console.log("Mutation2 Response:-------------", response);
  } catch (error) {
    console.error("Error:", error);
  }
};
