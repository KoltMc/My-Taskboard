// File stream
const fs = require('fs');

//Database
let mysql = require('mysql2');

let con = mysql.createConnection({
    host: "localhost",
    user: "me",
    password: "rocker123321",
    database: "taskboardusers"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
})

// Authentication
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

// Server 
const http = require('http');

http.createServer((req, res) => {

    // Log incoming requests to command line
    console.log(req.method, req.url);

    // Parse request body
    jsonParser(req, res, async (err) => {
        if (err) {
            res.statusCode = 400;
            return res.end('Invalid JSON');
        }

        console.log(req.body);

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
            try {
                const { username, password } = req.body;

                const [rows] = await con.promise().query(
                    "SELECT username FROM user WHERE username = ?",
                    [username]
                );

                if (rows.length > 0) {
                    // username taken
                    return;
                }
                
                const hashedPassword = await bcrypt.hash(password, 10);
                
                await con.promise().query(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    [username, hashedPassword]
                );
            }
            catch (error) {
                console.error("REGISTER ERROR:", error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Error registering user' }));
            }
        }

        else if (req.url === '/login' && req.method === "POST") {
            // Try login w/ mysql
            const {username, password} = req.body;

            con.query(
                "SELECT username, password FROM user WHERE username = ?", 
                [username], 
                async (err, result) => { 
                    if (err) throw err;
                    console.log(result);
                    if (result.length === 0) {
                        // user not found
                        return res.statusCode(401).json({ message: 'Invalid Credentials' });
                    } else {
                        const passwordMatch = await bcrypt.compare(password, result.password);

                        if (!passwordMatch) {
                            return res.statusCode(401).json({ message: 'Invalid Credentials' });
                        }

                        res.json({ 
                            message: 'Login successful',
                        })
                    }
                }
            );
        }

        else {
            res.writeHead(404);
            res.end("Not found");
        }
    });
    
}).listen(3000, "0.0.0.0");

console.log("Server running on port 3000");

