var AWS = require("aws-sdk");

const Constants = require('./constants');

AWS.config.update({
  region: "eu-west-1",
  endpoint: Constants.LOCAL_DB_PATH
});

var dynamodb = new AWS.DynamoDB();

var tables = [];
dynamodb.listTables(tables, (err, data) => {
  if (err) console.log("Failed to list tables");
  else {
    console.log("Listed " + data.TableNames.length + " tables");
    tables = data.TableNames;
    for (var i = 0; i < tables.length; i++) {
      dynamodb.describeTable({TableName: tables[i]}, (err, data) => {
        if (err) console.log("Could not create table " + tables[i]);
        else console.log(data.Table);
      });
    }
  }
});