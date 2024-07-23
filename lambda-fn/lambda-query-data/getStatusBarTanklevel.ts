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

async function fetchDataFromTimestream(interval: string) {





  const queryStringX04 = `
     SELECT Flow_Lpmin AS avg_Flow_Lpmin 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(10m) and now() AND port='x04' AND Flow_Lpmin > 1
     ORDER BY time DESC
     LIMIT 1
     `;

  const queryStringX08 = `
     SELECT Flow_Lpmin AS avg_Flow_Lpmin 
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(10m) and now() AND port='x08' AND Flow_Lpmin > 1
     ORDER BY time DESC
     LIMIT 1
   `;



// ======================END WATER PRODUCTION TOTILIZER==============================

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


  
      // =================================================START- SES _SEND MESSAGE TO SES================================================================

      const sendEmail = async (statusbar_result: string,email:string) => {
        const params = {
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: {
              Text: { Data: `Alert! The current level of  tank status is ${statusbar_result}` },
            },
            Subject: { Data: "Tank Level Alert" },
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
    
      // 

  try {

   


    // Querying the data
    const avgFlowLpminX04 = await queryDatabase(queryStringX04);
    const avgFlowLpminX08 = await queryDatabase(queryStringX08);
    
    console.log("avgFlowLpminX04--------------", avgFlowLpminX04);
    console.log("avgFlowLpminX08--------------", avgFlowLpminX08);
   
    // Calculating tank level

    let currentTankLevel = 9000 - avgFlowLpminX04 + avgFlowLpminX08;
    let currentTankLevel_Status="RED"; 
    const currentStatusTankLevel = currentTankLevel <= 5400 ? currentTankLevel_Status : "GREEN";


    
    if (currentStatusTankLevel === "RED") {
      const email=await fetchEmailFromDynamoDB();
       console.log("email  ----> ",email);
      await sendEmail(currentStatusTankLevel,email);
    }
   

    if (currentTankLevel == 9000) {
      // Tank is full
      let currentTankLevel = 9000 - avgFlowLpminX04;  
      console.log("Tank is full", currentTankLevel);
    } else if (avgFlowLpminX08 > 1) {
      // current Tank level , X08 turns on
      let currentTankLevel = 9000 - avgFlowLpminX04 + avgFlowLpminX08;
      console.log("Current Tank level , X08 turns on ", currentTankLevel);

    }
    else {
      // Tank is full
      console.log("Tank is full", currentTankLevel);
    }

  
 
    
    const data = {
      current_Tank_Level: currentTankLevel,
      status_alert: currentStatusTankLevel,
     
    };

    console.log("data--------", data);

    console.log("Current Tank Level:", currentTankLevel);
    console.log("Current Tank Level Status:", currentStatusTankLevel);
  

    return data;
  } catch (error) {
    console.log("Error", error);
  }
  //  =====================================================
}

export const handler = async (event: any) => {
  console.log("Event:-----", event);
  const interval = event?.interval || "week";
  console.log("Interval:----------", interval);

  try {
    const data = await fetchDataFromTimestream(interval);
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
