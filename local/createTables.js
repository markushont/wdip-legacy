var AWS = require("aws-sdk");

const Constants = require('./constants');

AWS.config.update({
  region: "eu-west-1",
   endpoint: Constants.LOCAL_DB_PATH
});

var dynamodb = new AWS.DynamoDB();

dynamodb.listTables({}, (err, data) => {
    if (err) console.log("Failed to list tables");
    else {
        console.log("Listed " + data.TableNames.length + " tables.");
        let tables = data.TableNames;
        // Create request log table
        if (tables.indexOf(Constants.MOTION_REQUEST_LOG_TABLE) == -1) {
            var params = {
                TableName : Constants.MOTION_REQUEST_LOG_TABLE,
                KeySchema: [       
                    { AttributeName: "id", KeyType: "HASH"},  //Partition key
                    { AttributeName: "date", KeyType: "RANGE" }  //Sort key
                ],
                AttributeDefinitions: [       
                    { AttributeName: "id", AttributeType: "S" },
                    { AttributeName: "date", AttributeType: "N" }
                ],
                ProvisionedThroughput: {       
                    ReadCapacityUnits: 10, 
                    WriteCapacityUnits: 10
                }
            };
        
            dynamodb.createTable(params, function(err, data) {
                if (err) {
                    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                }
            });  
        }

        // Create motion table
        if (tables.indexOf(Constants.MOTION_TABLE) == -1) {
            var params = {
                TableName : Constants.MOTION_TABLE,
                KeySchema: [       
                    { AttributeName: "dok_id", KeyType: "HASH"}  //Partition key
                ],
                AttributeDefinitions: [       
                    { AttributeName: "dok_id", AttributeType: "S" }
                ],
                ProvisionedThroughput: {       
                    ReadCapacityUnits: 10, 
                    WriteCapacityUnits: 10
                }
            };
        
            dynamodb.createTable(params, function(err, data) {
                if (err) {
                    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                }
            }); 
        }
    }
});
