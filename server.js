
// File stream
const fs = require('fs');

//Database
let mysql = require('mysql2');

let con = mysql.createConnection({
    host: "localhost",
    user: "me",
    password: "rocker123321"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
})

// Authentication
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

// Server 
const http = require('http');

http.createServer((req, res) => {

    // Log incoming requests to command line
    console.log(req.method, req.url);

    if (req.url === "/") {
        fs.readFile("./index.html", (err, data) => {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(data);
        });
    }
    
    else if (req.url === "/styles.css") {
        fs.readFile("./styles.css", (err, data) => {
            res.writeHead(200, {"Content-Type": "text/css"});
            res.end(data);
        });
    }

    else if (req.url === "/script.js") {
        fs.readFile("./script.js", (err, data) => {
            res.writeHead(200, {"Content-Type": "application/javascript"});
            res.end(data);
        });
    }

    // Save button
    else if (req.url === "/save" && req.method === "POST") {
        fs.writeFile("letter.txt", "Y", err => {
            if (err) {
                res.writeHead(500);
                res.end("Failed");
                return;
            }

            res.writeHead(200);
            res.end("Saved");
        });
    }

    // Authentication
    else if (req.url === '/register' && req.method === "POST") {
        // Register if data fits criteria and user is unique
        // try {
        //     const { username, password } = req.body;            
        // }
    }

    else if (req.url === '/login' && req.method === "POST") {
        // Try login w/ mysql
    }

    else {
        res.writeHead(404);
        res.end("Not found");
    }
    
}).listen(3000, "0.0.0.0");

console.log("Server running on port 3000");

