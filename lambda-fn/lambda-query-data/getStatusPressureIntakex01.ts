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







  const queryStringX01PressureIntake= `
     SELECT Pressure_bar
     FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
     WHERE time between ago(10m) and now() 
     AND port='x01' 
     ORDER BY time DESC
     LIMIT 1
     `;

      // =================================================START- SES _SEND MESSAGE TO SES================================================================

 const sendEmail = async (statusbar_result: string,email:string) => {
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: { Data: `Alert! The Current operation status is ${statusbar_result}` },
      },
      Subject: { Data: "Operation Alert" },
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

  try {

   


    // Querying the data
    const StringX01PressureIntake = await queryDatabase(queryStringX01PressureIntake);
   
    
    console.log("StringX01PressureIntake--------------", StringX01PressureIntake);
    
   
    
    
    const status_Result = StringX01PressureIntake  < 1 ? "RED" : "GREEN";

    if (status_Result === "RED") {
      const email=await fetchEmailFromDynamoDB();
      console.log("email  ----> ",email);
      await sendEmail(status_Result,email);
    }
    
    const data = {
      pressure_bar:StringX01PressureIntake,
      status_alert:status_Result
     
    };

    console.log("data--------", data);

 
  

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
