const express = require('express');
const app = express();
var fs = require("fs");

// Use the followiing header for the page
app.use((req, res, next)=>{
    try{
        res.header("Access-Control-Allow-Origin","*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    }catch{}
})

// Entry page
app.get('/', (req, res) => {
    try{res.send('trackerR324')}catch{};
});

// Return partWin Participants.txt
app.get('/partWin', (req, res) => {
    try{res.send(fs.readFileSync('C:\\trackerR324\\participants.txt',{encoding:'utf8'}))}catch{};
});

// Return partLin Participants.txt
app.get('/partLin', (req, res) => {
    try{res.send(fs.readFileSync('home/trackerR324/participants.txt',{encoding:'utf8'}))}catch{};
});

// Return recordWin RecordData.json
app.get('/recordWin', (req, res) => {
    try{res.send(fs.readFileSync('C:\\trackerR324\\RecordData.json',{encoding:'utf8'}))}catch{};                                                                                                                                                                                                                                                                                                                                                  
});

// Return recordLin RecordData.json
app.get('/recordLin', (req, res) => {
    try{res.send(fs.readFileSync('home/trackerR324/RecordData.json',{encoding:'utf8'}))}catch{};                                                                                                                                                                                                                                                                                                                                                  
});

// Start the server on port 3001
app.listen(3001)