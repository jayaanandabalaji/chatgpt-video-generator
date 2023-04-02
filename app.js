import say from 'say';
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');


app.use(express.static(__dirname+'/output'));


app.get('/getaudio', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const text = req.query.text;
  say.export(text, null, 1, 'output/output.wav', async (err) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    //const url = URL.createObjectURL(blob);

    res.json(req.protocol+"://"+req.headers.host+"/output.wav");
  });
});

const getUrlBlob = async (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${res.statusCode}`));
        return;
      }

      const data = [];

      res.on('data', (chunk) => {
        data.push(chunk);
      });

      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const blob = new Blob([buffer], { type: res.headers['content-type'] });
        resolve(blob);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};




const textToAudioBlob = async (text) => {
  const filePath = 'audio.wav'; // file path to save the audio file
  return new Promise((resolve, reject) => {
    say.export(text, null, 1, filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        // Read the saved audio file and convert to blob
        fs.readFile(filePath, (err, data) => {
          if (err) {
            reject(err);
          } else {
            const blob = new Blob([data], { type: 'audio/wav' });
            const blobUrl = URL.createObjectURL(blob);
            resolve(blobUrl);
          }
        });
      }
    });
  });
};



app.listen(3001, () => {
  console.log('Server listening on port 3001');
});
