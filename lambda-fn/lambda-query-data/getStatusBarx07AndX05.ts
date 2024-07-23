const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const queryClient = new AWS.TimestreamQuery();
const ses = new AWS.SES();

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function fetchEmailFromDynamoDB(){
  const tableName = process.env.TABLE_NAME;
  const organizationIdToFind = 'idce343e93ceb2c'; // Replace with the organization ID you're looking for

  const params = {
    TableName: tableName,
    FilterExpression: 'organization_id = :organizationId',
    ExpressionAttributeValues: {
      ':organizationId': organizationIdToFind,
    },
  };
  try {
    const data = await dynamodb.scan(params).promise();
    const items = data.Items;
    console.log("item=====>",items)

    if (items.length > 0) {
        // Assuming your DynamoDB table structure, add type annotations for 'item'
        const emails = items.map((item: { mail_contact: string }) => item.mail_contact);
        return emails;
        // return {
      //   statusCode: 200,
      //   body: emails,
      // };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Organization ID not found' }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not retrieve emails' }),
    };
  }

};

async function fetchDataFromTimestream(
  port: string,
 
) {
//   let intervalExpression: string;
// // Determine the interval expression based on the interval provided
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
//     case "current":
//       intervalExpression = "0m";
//       break;
//   default:
//     throw new Error("Invalid interval");
// }



//  // Log the interval expression for debugging
//  console.log(`Interval Expression:---------- ${intervalExpression}`);


//  let timeSelected;

// if (intervalExpression === '1d'){
//   timeSelected=10;
// }
// else if (intervalExpression === '7d') {
//   timeSelected=360;
// }

// else if (intervalExpression === '30d') {
//   timeSelected=1440;
// }
// else if (intervalExpression === '365d') {
//   timeSelected=43800;
// }
// else{
//   timeSelected=1;
// }





// console.log("timeSelected --------------",timeSelected);




 



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
  



     const queryStringPessureBarDifference = `
        WITH ${port}_data AS (
       SELECT bin(time, 10m) AS time_interval,
       AVG(Pressure_bar) AS ${port}_Pressure_bar
       FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
       WHERE time between ago(10m) and now() 
       AND port='${port}'
       GROUP BY bin(time, 10m)
       ),
       x01_data AS (
       SELECT bin(time, 10m) AS time_interval,
       AVG(Pressure_bar) AS X01_Pressure_bar
       FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
       WHERE time between ago(10m) and now() 
       AND port='x01'
       GROUP BY bin(time, 10m)
       )
       SELECT
       ${port}_data.time_interval AS time_interval,
       ${port}_data.${port}_Pressure_bar - x01_data.X01_Pressure_bar AS pressure_bar_difference
       FROM ${port}_data
       JOIN
       x01_data ON ${port}_data.time_interval = x01_data.time_interval
       ORDER BY ${port}_data.time_interval DESC
        `;

 

    // Log the query string for debugging
  console.log("Query String:----------", queryStringPessureBarDifference);


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
  


  

     


  }
  catch(err){

    console.log("Error querying Timestream:", err);
    
  }
      }

      // =================================================START- SES _SEND MESSAGE TO SES================================================================

      const sendEmail = async (statusbar_result: string,email:string) => {
        const params = {
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: {
              Text: { Data: `Alert! The pressure bar difference status is ${statusbar_result}` },
            },
            Subject: { Data: "Pressure Bar Difference Alert" },
          },
          Source: email,
        };
    
        try {
          await ses.sendEmail(params).promise();
          console.log("Email sent successfully");
        } catch (err) {
          console.log("Error sending email:", err);
        }
      };
    
      // =================================================END- SES _SEND MESSAGE TO SES================================================================

    try{
     
      const StringPessureBarDifferencePort = await queryDatabase(queryStringPessureBarDifference);

      console.log("StringPessureBarDifferencePort-----",StringPessureBarDifferencePort);
      const statusbar=StringPessureBarDifferencePort[0].pressure_bar_difference;

      const statusbar_result= statusbar >= 1 ? "RED" : "GREEN";


      if (statusbar_result === "RED") {
        const email=await fetchEmailFromDynamoDB();
       console.log("email  ----> ",email);
        await sendEmail(statusbar_result,email);
      }




      const data={
             "time_interval":StringPessureBarDifferencePort[0].time_interval,
             "pressure_bar_difference":StringPessureBarDifferencePort[0].pressure_bar_difference,
             "status_alert":statusbar_result

           };

      return data;
    
    
    
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
    const data = await fetchDataFromTimestream(port);
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
