const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();

async function fetchDataFromTimestream(
  interval: string,
  sensor: string,
  port: string,
  zone: string,
  sensorname: string,
  plant:string,
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
 

  let queryString: string;
  if (sensor && port && zone && plant && sensorname ) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND sensor_type = '${sensor}' 
      AND port = '${port}' 
      AND zone = '${zone}'
      AND plant = '${plant}'
      AND sensor_name = '${sensorname}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  } else if(zone && !sensor && !port && !plant && !sensorname ){
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND zone = '${zone}'
      ORDER BY time DESC
      LIMIT ${limit}
        
    `;
  }else if(plant && !zone && !sensor && !port && !sensorname){
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND plant = '${plant}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }

  else if(plant && port && !zone && !sensor && !sensorname) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND plant = '${plant}'
      AND port = '${port}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }

    else if(plant && port && zone && !sensor && !sensorname) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND plant = '${plant}'
      AND port = '${port}' 
      AND zone = '${zone}' 
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }



  else if(plant && port && sensor && !zone && !sensorname) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND plant = '${plant}'
      AND port = '${port}'
      AND sensor_type = '${sensor}' 
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }

  else if(plant && port && sensor && zone && !sensorname) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND plant = '${plant}'
      AND port = '${port}'
      AND sensor_type = '${sensor}' 
      AND zone = '${zone}' 
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }


  else if(plant && port && sensor && sensorname && !zone) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND plant = '${plant}'
      AND port = '${port}'
      AND sensor_type = '${sensor}' 
      AND sensor_name = '${sensorname}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }
  
  
  
  
  else if(sensor && !plant && !port && !sensorname && !zone){
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND sensor_type = '${sensor}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }
  else if(port && !sensor && !plant && !sensorname && !zone) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND port = '${port}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }
  else if(sensorname && !port && !sensor && !plant && !zone) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND sensor_name = '${sensorname}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }

  // else if(port && Flow_Lpmin=1 ) {
  //   queryString = `
  
  //     SELECT Flow_Lpmin FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  //     WHERE time between ago(${intervalExpression}) and now()   
  //     AND port = '${port}'
  //     AND Flow_Lpmin <= 1 
  //     ORDER BY time DESC
  //   `;
  // }

  else if(!sensorname && !port && !sensor && !plant && zone) {
    queryString = `
      SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
      WHERE time between ago(${intervalExpression} + 10m) and now()   
      AND zone = '${zone}'
      ORDER BY time DESC
       LIMIT ${limit}
    `;
  }
     
  else {
    queryString = `
    SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
    WHERE time between ago(${intervalExpression} + 10m) and now()   
    ORDER BY time DESC
     LIMIT ${limit}
  `;

  }
  // Log the query string for debugging
  console.log("Query String:----------", queryString);

  const params = {
    QueryString: queryString,
  };

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

export const handler:APIGatewayProxyHandler = async (event:any) => {
  console.log("Event:-----", event);
  const interval = event?.interval || "week";
  const sensor_type = event?.sensor || null;
  const port = event?.port || null;
  const zone = event?.zone || null;
  const sensor = event?.sensor_name || null;
  const plant = event?.plant || null;
  const limit = Number(event?.limit) || 1000;
  console.log("Interval:----------", interval);
  console.log("sensor_type:----------", sensor_type);
  console.log("port:----------", port);
  console.log("zone:----------", zone);
  console.log("sensor_name:----------", sensor);
  console.log("plant:----------", plant);
  console.log("limit:----------", Number(limit));
  try {
    const data = await fetchDataFromTimestream(interval, sensor_type, port, zone,sensor,plant,limit);
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
