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
const jwt = require('jsonwebtoken');

const jsonParser = bodyParser.json();

const JWT_SECRET = 'mysecretkey';

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

        const authenticateJWT = (req, res, next) => {
            const cookies = req.headers.cookie;

            if (!cookies) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Authorization header missing.' }));
            }

            const tokenCookie = cookies
                .split(';')
                .find(cookie => cookie.trim().startsWith('token='));

            if (!tokenCookie) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ message: 'Token missing.' }));
            }

            const token = tokenCookie.split('=')[1];

            try {
                const decoded = jwt.verify(token, JWT_SECRET);

                req.user = decoded;

                next();
            } catch(error) {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Invalid or expired token.' }));
            }
        }

        if (req.url === "/") {
            fs.readFile("./index.html", (err, data) => {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
            });
        }

        else if (req.url === "/taskboard" && req.method === "GET") {
            authenticateJWT(req, res, () => {
                fs.readFile("./taskboard.html", (err, data) => {
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(data);
                })
            })
        }

        else if (req.url === "/images/HTA.PNG" && req.method === "GET") {
            fs.readFile("./images/HTA.PNG", (err, data) => {
                if (err) {
                    res.writeHead(404);
                    return res.end();
                }
                res.writeHead(200, {"Content-Type": "image/png"});
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

        else if (req.url === "/tbscript.js") {
            fs.readFile("./tbscript.js", (err, data) => {
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

                console.log("Registration successful.");

            } catch (error) {
                console.error("REGISTER ERROR:", error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Error registering user' }));
            }
        }

        else if (req.url === '/login' && req.method === "POST") {
            // Try login w/ mysql
            try {
                const {username, password} = req.body;

                const [rows] = await con.promise().query(
                    "SELECT username, password FROM user WHERE username = ?", 
                    [username]
                );

                if(rows.length > 0) {
                    const passwordMatch = await bcrypt.compare(password, rows[0].password);

                    if (!passwordMatch) {
                        res.statusCode = 401;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ message: 'Invalid Credentials' }));
                    } else {
                        const jwtPayload = { username };
                        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '1hr' });
                        res.setHeader(
                            'Set-Cookie',
                            `token=${token}; HttpOnly; Path=/`
                        );
                        res.writeHead(302, {
                            Location: "/taskboard"
                        });
                        res.end(JSON.stringify({ message: 'Login successful.', token }));
                        console.log("Login successful.")
                    }

                    
                }

            } catch (error) {
                console.error("LOGIN ERROR:", error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Error logging in' }));
            }
        }

        else {
            res.writeHead(404);
            res.end("Not found");
        }
    });
    
}).listen(3000, "0.0.0.0");

console.log("Server running on port 3000");

