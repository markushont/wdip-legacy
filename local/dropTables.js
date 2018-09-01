var AWS = require("aws-sdk");

const Constants = require('./constants');

AWS.config.update({
  region: "eu-west-1",
  endpoint: Constants.LOCAL_DB_PATH
});

var dynamodb = new AWS.DynamoDB();

dynamodb.listTables({}, (err, data) => {
    if (err) {
        console.log("Failed to list tables");
    }
    else {
        console.log("Listed " + data.TableNames.length + " tables");
        for (var i = 0; i < data.TableNames.length; i++) {
            var tableName = data.TableNames[i];
            console.log("Deleting table '" + tableName + "'");
            dynamodb.deleteTable({TableName: tableName}, (err, data) => {
                if (err) console.log("Could not delete table " + data.TableName + ". " + err.stack);
                else console.log("Deleted table '" + data.TableName + "'");
            });
        };
    }  
});

