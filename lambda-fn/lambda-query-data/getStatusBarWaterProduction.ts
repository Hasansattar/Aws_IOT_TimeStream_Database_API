const AWS = require("aws-sdk");
import { APIGatewayProxyHandler } from "aws-lambda";

const dynamodb = new AWS.DynamoDB.DocumentClient();

const queryClient = new AWS.TimestreamQuery();
const ses = new AWS.SES();


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

async function fetchDataFromTimestream() {

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

  //  ===================START- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================
  //  ===================START- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================

  const currentValueX08Flowlpmin = `SELECT Flow_Lpmin 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x08'
  ORDER BY time DESC
  LIMIT 1`;

  const currentValueX04Flowlpmin = `SELECT Flow_Lpmin 
  FROM "${process.env.TS_DATABASE_NAME}"."${process.env.TS_TABLE_NAME}"
  WHERE time BETWEEN ago(10m) AND now()
  AND port = 'x04'
  ORDER BY time DESC
  LIMIT 1`;




  
      // =================================================START- SES _SEND MESSAGE TO SES================================================================

      const sendEmail = async (statusbar_result: string,email:string) => {
        const params = {
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: {
              Text: { Data: `Alert! The X04 water is more then x08 : status is ${statusbar_result}` },
            },
            Subject: { Data: "X04 > X08 Water Alert" },
          },
          Source:email,
        };
    
        try {
          await ses.sendEmail(params).promise();
          console.log("Email sent successfully");
        } catch (err) {
          console.log("Error sending email:", err);
        }
      };
    
     // =================================================END- SES _SEND MESSAGE TO SES================================================================

  //  ===================END- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================
  //  ===================END- CURRENT VALUES OF X08 AND X04 FLOW_Lpmings =================

  try {
    // =================================================================
    const StringCurrentValueX08Flowlpmin = await queryDatabase(
      currentValueX08Flowlpmin
    );

    const StringCurrentValueX04Flowlpmin = await queryDatabase(
      currentValueX04Flowlpmin
    );

    const x08Production = StringCurrentValueX08Flowlpmin;

    const x04Distribution = StringCurrentValueX04Flowlpmin;

    let Status_Alert;

    const statusbar_result = x04Distribution > x08Production ? "RED" : "GREEN";

    if (statusbar_result === "RED") {

      const email=await fetchEmailFromDynamoDB();
      console.log("email  ----> ",email);
     
      await sendEmail(statusbar_result,email);
    }
    
    const data = {
      x04_distribution_water: x04Distribution,
      x08_production_water: x08Production,
      status_alert: statusbar_result,
    };

    console.log("data--------", data);

    return data;
  } catch (error) {
    console.log("DATA ERROR----------", error);
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
