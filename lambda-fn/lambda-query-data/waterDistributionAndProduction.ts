const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream() {
  //let intervalExpression: string;
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

  //  // Log the interval expression for debugging
  //  console.log(`Interval Expression:---------- ${intervalExpression}`);


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


  // ================================END_ QUERY FUNCTIONS  ================================



     //  =============================START- PER DAY- TOTILIZER PRODUCTION AND DISTRIBUTION  X08 - X04=============================

  const queryStringTotilizerPreviosWaterflowX04PerDay = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_OneDayAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(1d + 10m) AND ago(1d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerDay = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX04PerWeek = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_OneWeekAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(7d + 10m) AND ago(7d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerWeek = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX04PerMonth = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_LastMonthAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(30d + 10m) AND ago(30d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerMonth = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX04PerYear = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_LastYearAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(365d + 10m) AND ago(365d)
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx04PerYear = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x04_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1
  `;

  // ------------------------------------------------------------------------------------------------------

  const queryStringTotilizerPreviosWaterflowX08PerDay = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_OneDayAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(1d + 10m) AND ago(1d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerDay = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX08PerWeek = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_OneWeekAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(7d + 10m) AND ago(7d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerWeek = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX08PerMonth = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_LastMonthAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(30d + 10m) AND ago(30d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerMonth = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  const queryStringTotilizerPreviosWaterflowX08PerYear = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_LastYearAgo
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(365d + 10m) AND ago(365d)
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1  
  `;

  const queryStringTotilizerCurrentWaterflowx08PerYear = `
  SELECT Totaliser1_m3 AS Totaliser1_L_x08_Last10Minutes
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1
  `;

  //  =============================END- PER DAY- TOTILIZER PRODUCTION AND DISTRIBUTION X08 - X04 =============================





     // =========================================START- History of x08 and x04 Per Day =============================

  const queryStringHistoryOfWaterflowx04PerDay = `
  SELECT  bin(time, 10m) AS time_interval,
   Flow_Lpmin AS Flow_Lpmin_x04_10min
   FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
   WHERE  time >= ago(1d) 
   AND port = 'x04'
   ORDER BY 
   time_interval ASC`;

 const queryStringHistoryOfWaterflowx08PerDay = `
   SELECT  bin(time, 10m) AS time_interval,
     Flow_Lpmin AS Flow_Lpmin_x08_10min
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time >= ago(1d) 
     AND port = 'x08'
     ORDER BY 
     time_interval ASC`;

 // =========================================END- History of x08 and x04 Per Day =============================




 // ==========================================SATRT- HISTORY OF X08  AND X04  PER WEEK================= 

 const queryStringHistoryOfWaterflowx04PerWeek = `
        SELECT
       time_interval,
       Flow_Lpmin AS Flow_Lpmin_x04_6hr
       FROM (
       SELECT bin(time, 6h) AS time_interval,
        Flow_Lpmin,
  
        ROW_NUMBER() OVER (PARTITION BY bin(time, 6h) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(7d) and now() 
        AND port='x04'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC
         
 `;

    
//  const queryStringHistoryOfWaterflowx04PerWeek = `
//  SELECT bin(time, 6h) AS time_interval,
//  AVG(Flow_Lpmin) AS Flow_Lpmin_x04_6hr
//  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//  WHERE time >= ago(7d) 
//  AND port = 'x04'
//  GROUP BY bin(time, 6h)
//  ORDER BY time_interval ASC`;

 const queryStringHistoryOfWaterflowx08PerWeek = `
       SELECT
       time_interval,
       Flow_Lpmin AS Flow_Lpmin_x08_6hr
       FROM (
       SELECT bin(time, 6h) AS time_interval,
        Flow_Lpmin,
  
        ROW_NUMBER() OVER (PARTITION BY bin(time, 6h) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(7d) and now() 
        AND port='x08'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC`;


  //  const queryStringHistoryOfWaterflowx08PerWeek = `
  //  SELECT bin(time, 6h) AS time_interval,
  //  AVG(Flow_Lpmin) AS Flow_Lpmin_x08_6hr
  //  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  //  WHERE time >= ago(7d) 
  //  AND port = 'x08'
  //  GROUP BY bin(time, 6h)
  //  ORDER BY time_interval ASC`;

  // ==========================================END- HISTORY OF X08  AND X04  PER WEEK================= 


    // ==========================================SATART- HISTORY OF X08  AND X04  PER MONTH================= 


    const queryStringHistoryOfWaterflowx04PerMonth = `
       SELECT
       time_interval,
       Flow_Lpmin AS Flow_Lpmin_x04_1day
       FROM (
       SELECT bin(time, 1d) AS time_interval,
        Flow_Lpmin,
  
        ROW_NUMBER() OVER (PARTITION BY bin(time, 1d) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(30d) and now() 
        AND port='x04'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC`;

//  const queryStringHistoryOfWaterflowx04PerMonth = `
//  SELECT bin(time, 1d) AS time_interval,
//  AVG(Flow_Lpmin) AS Flow_Lpmin_x04_1day
//  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//  WHERE time >= ago(30d) 
//  AND port = 'x04'
//  GROUP BY bin(time, 1d)
//  ORDER BY time_interval ASC`;

//  const queryStringHistoryOfWaterflowx08PerMonth = `
//    SELECT bin(time, 1d) AS time_interval,
//    AVG(Flow_Lpmin) AS Flow_Lpmin_x08_1day
//    FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//    WHERE time >= ago(30d) 
//    AND port = 'x08'
//    GROUP BY bin(time, 1d)
//    ORDER BY time_interval ASC`;


   const queryStringHistoryOfWaterflowx08PerMonth = `
       SELECT
       time_interval,
       Flow_Lpmin AS Flow_Lpmin_x08_1day
       FROM (
       SELECT bin(time, 1d) AS time_interval,
        Flow_Lpmin,
  
        ROW_NUMBER() OVER (PARTITION BY bin(time, 1d) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(30d) and now() 
        AND port='x08'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC`;

  // ==========================================END- HISTORY OF X08  AND X04  PER MONTH================= 



  // ==========================================SATART- HISTORY OF X08  AND X04  PER YEAR ================ 


  const queryStringHistoryOfWaterflowx04PerYear = `
       SELECT
       time_interval,
       Flow_Lpmin AS Flow_Lpmin_x04_1month
       FROM (
       SELECT bin(time, 30d) AS time_interval,
        Flow_Lpmin,
  
        ROW_NUMBER() OVER (PARTITION BY bin(time, 30d) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(365d) and now() 
        AND port='x04'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC`;

//  const queryStringHistoryOfWaterflowx04PerYear = `
//  SELECT bin(time, 30d) AS time_interval,
//  AVG(Flow_Lpmin) AS Flow_Lpmin_x04_1month
//  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
//  WHERE time >= ago(365d) 
//  AND port = 'x04'
//  GROUP BY bin(time, 30d)
//  ORDER BY time_interval ASC`;

 const queryStringHistoryOfWaterflowx08PerYear = `
   SELECT
       time_interval,
       Flow_Lpmin AS Flow_Lpmin_x08_1month
       FROM (
       SELECT bin(time, 30d) AS time_interval,
        Flow_Lpmin,
  
        ROW_NUMBER() OVER (PARTITION BY bin(time, 30d) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(365d) and now() 
        AND port='x08'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC`;


  //  const queryStringHistoryOfWaterflowx08PerYear = `
  //  SELECT bin(time, 30d) AS time_interval,
  //  AVG(Flow_Lpmin) AS Flow_Lpmin_x08_1month
  //  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  //  WHERE time >= ago(365d) 
  //  AND port = 'x08'
  //  GROUP BY bin(time, 30d)
  //  ORDER BY time_interval ASC`;


 // =========================================END- History of x08 and x04 Per Day =============================

  //  ===================START- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================
  //  ===================START- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================



  const currentValueX08Flowlpmin =
  `SELECT Flow_Lpmin 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1`;  


  const currentValueX04Flowlpmin =
  `SELECT Flow_Lpmin 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1`; 


  //  ===================END- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================
  //  ===================END- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================



  


  try {

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





    console.log(
      "avgFlowLpminX08HistoryWaterPerDay --------------",
      avgFlowLpminX08HistoryWaterPerDay
    );
    console.log(
      "avgFlowLpminX04HistoryWaterPerDay --------------",
      avgFlowLpminX04HistoryWaterPerDay
    );

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

  // 

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

  try {
    const data = await fetchDataFromTimestream();
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
