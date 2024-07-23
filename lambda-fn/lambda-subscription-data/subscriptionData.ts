const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";
const https = require('https');

const queryClient = new AWS.TimestreamQuery();



  

export const handler:APIGatewayProxyHandler = async (event:any) => {
  console.log("Event:-----", event);
  const interval = event?.payload.interval || "week";
  const sensor = event?.payload.sensor || null;
  const port = event?.payload.port || null;
  const zone = event?.payload.zone || null;
  const sensorname = event?.payload.sensor_name || null;
  const plant = event?.payload.plant || null;
  console.log("Interval:----------", interval);
  console.log("sensor_type:----------", sensor);
  console.log("port:----------", port);
  console.log("zone:----------", zone);
  console.log("sensor_name:----------", sensorname);
  console.log("plant:----------", plant);

  
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
        case "minute":
          intervalExpression = "1m";
          break;
      default:
        throw new Error("Invalid interval");
    }
    
    


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
    
     // Log the interval expression for debugging
     console.log(`Interval Expression:---------- ${intervalExpression}`);
     
    
      let queryString: string;
      if (sensor && port && zone && plant) {
        queryString = `
          SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
          WHERE time between ago(${intervalExpression}) and now()   
          AND sensor_type = '${sensor}' 
          AND port = '${port}' 
          AND zone = '${zone}'
          AND plant = '${plant}'
          ORDER BY time DESC  LIMIT 1
        `;
      } else if(zone){
        queryString = `
          SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
          WHERE time between ago(${intervalExpression}) and now()   
          AND zone = '${zone}'
          ORDER BY time DESC  LIMIT 1
        `;
      }else if(plant){
        queryString = `
          SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
          WHERE time between ago(${intervalExpression}) and now()   
          AND plant = '${plant}'
          ORDER BY time DESC  LIMIT 1
        `;
      }
      
      
      else if(sensor){
        queryString = `
          SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
          WHERE time between ago(${intervalExpression}) and now()   
          AND sensor_type = '${sensor}'
          ORDER BY time DESC LIMIT 1
        `;
      }
      else if(port) {
        queryString = `
          SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
          WHERE time between ago(${intervalExpression}) and now()   
          AND port = '${port}'
          ORDER BY time DESC  LIMIT 1
        `;
      }
      else if(sensorname) {
        queryString = `
          SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
          WHERE time between ago(${intervalExpression}) and now()   
          AND sensor_name = '${sensorname}'
          ORDER BY time DESC  LIMIT 1
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
    
      
      
      else {
        queryString = `
          SELECT * FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}" 
          WHERE time between ago(${intervalExpression}) and now()   
          AND zone = '${zone}'
          ORDER BY time DESC  LIMIT 1
        `;
      }
      // Log the query string for debugging
      console.log("Query String:----------", queryString);


      const params = {
        QueryString: queryString,
      };

      try{
      
      
        
  

       
        // return items[0]; // Return the data as a list
               const  items  =  await queryDatabase1(queryString);
           

        
    
         
    //return data;
      console.log("Before passing to mutation data:----------",items);
      const postData = JSON.stringify({
        query: `
          mutation PublishNewData($input: IotDataInput) {
            publishNewData(input: $input) {
              port
              zone
              plant
              sensor_type
              sensor_name
              measure_name
              time
              Totaliser1_L
              Flow_Lpmin
              Temperature_C
              Flow_Lph
              Totaliser1_m3
              Flow_m3ph
              DeviceStatus
              Flow_mps
              Pressure_MPa
              Pressure_bar
              Conductivity_mcSpcm
              Temperature_F
            }
          }
        `,
        variables: {
          input: items[0],
        },
      });
      const options = {
        hostname: new URL(process.env.APPSYNC_API_ENDPOINT).hostname,
        path: new URL(process.env.APPSYNC_API_ENDPOINT).pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/graphql',
          'x-api-key': process.env.APPSYNC_API_KEY,
        },
      };
    
      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
    
          res.on('data', (chunk) => {
            data += chunk;
          });
    
          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        });
    
        req.on('error', (e) => {
          reject(e);
        });
    
        req.write(postData);
        req.end();
      });
    
      console.log("pass the data into APPSYNC------------" , postData);
      console.log("check the data into APPSYNC------------", response);
  
    
      }
      catch(err){
    
        console.log("Error querying Timestream:", err);
        
      }
    



   

};
