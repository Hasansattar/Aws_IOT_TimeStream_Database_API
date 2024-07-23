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

  console.log("timeSelected --------------", timeSelected);

  // WITH ranked_data AS (
  //   SELECT
  //       bin(time, 10m) AS time_interval,
  //       Temperature_C,
  //       Conductivity_mcSpcm,
  //       ROW_NUMBER() OVER (PARTITION BY bin(time, 10m) ORDER BY time) AS rn
  //   FROM "AquaControl"."alon"
  //   WHERE time between ago(1d) and now()
  //   AND port='x03'
  // )
  // SELECT
  //   time_interval,
  //   Temperature_C,
  //   Conductivity_mcSpcm
  // FROM ranked_data
  // WHERE rn = 1
  // ORDER BY time_interval DESC
  // LIMIT 100




//   SELECT
//     time_interval,
//     Temperature_C,
//     Conductivity_mcSpcm
// FROM (
//     SELECT
//         bin(time, 10m) AS time_interval,
//         Temperature_C,
//         Conductivity_mcSpcm,
//         ROW_NUMBER() OVER (PARTITION BY bin(time, 10m) ORDER BY time) AS rn
//     FROM "AquaControl"."alon"
//     WHERE time between ago(1d) and now() 
//     AND port='x03'
// ) AS subquery
// WHERE rn = 1
// ORDER BY time_interval DESC
// LIMIT 100
  
  const queryStringX03_Temperature_C_Conductivity_mcSpcm = `
       SELECT
       time_interval,
       Temperature_C,
       Conductivity_mcSpcm
       FROM (
       SELECT bin(time, ${timeSelected}m) AS time_interval,
        Temperature_C,
        Conductivity_mcSpcm,
        ROW_NUMBER() OVER (PARTITION BY bin(time, ${timeSelected}m) ORDER BY time) AS rn
        FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
        WHERE time between ago(${intervalExpression} + 10m) and now() 
        AND port='x03'
         ) AS subquery
         WHERE rn = 1
         ORDER BY time_interval DESC
         LIMIT ${limit}
                  `;

  // Log the query string for debugging
  console.log(
    "Query String:----------",
    queryStringX03_Temperature_C_Conductivity_mcSpcm
  );

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
    const StringX03_Temperature_C_Conductivity_mcSpcm = await queryDatabase(
      queryStringX03_Temperature_C_Conductivity_mcSpcm
    );

    console.log(
      "StringPessureBarDifferencePort-----",
      StringX03_Temperature_C_Conductivity_mcSpcm
    );

    return StringX03_Temperature_C_Conductivity_mcSpcm;
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
