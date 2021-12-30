const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/joins', (req, res) => {
  getJoins( rows=> {
    res.set({'Access-Control-Allow-Origin': '*'})
    .send(rows)
  });
})

app.listen(3000, () => console.log('Start Server, listening on port 3000!'))


var Web3 = require('web3');
let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));


var mysql  = require('mysql');


function insertJoins(address, price, tx, blockNo) {
  var connection = getConn();

  connection.connect();

  const query = `INSERT into joins (
        address,
        price,
        tx,
        block_no,
        created_at
    ) Values (?,?,?,?,NOW())`;
  const params = [address, price, tx, blockNo];

  connection.query(query, params, function (error, results) {
    if (error) throw error;
  });

  connection.end();
}

function getConn() {
  return mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    port     : '8889',
    database : 'crowdfund'
  });
}

function getJoins(callback) {
  var connection = getConn();
  connection.connect();

  const query = `SELECT address, price from joins`;
  const params = [];

  connection.query(query, params, (err, rows)=>{
      if(err){
          return callback(err);
      }
      console.log(`result=>`, rows);
      callback(rows);
  });

  connection.end();
}

var Crowdfunding = require('../build/contracts/Crowdfunding.json');
const crowdFund = new web3.eth.Contract(
  Crowdfunding.abi,
  Crowdfunding.networks[2337].address
);



crowdFund.events.Join(function(error, event) {
  if (error) {
    console.log(error);
  }

  console.log("trade hash:" + event.transactionHash);

  console.log("address:" + event.returnValues.user);

  insertJoins(event.returnValues.user,
    web3.utils.fromWei(event.returnValues.price),
    event.transactionHash,
    event.blockNumber )

});


