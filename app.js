const express = require('express');
const app = express();
const { exec } = require('child_process');
const fs = require('fs');
const { getAudioDurationInSeconds } = require('get-audio-duration')

app.use(express.static(__dirname+'/output'));

app.get('/getaudio', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
 await exec('rm output/output.mp3');
  const text = req.query.text;
  
 await exec('gtts-cli \"'+text+'\" --output output/output.mp3');
    await new Promise(resolve => setTimeout(resolve, 1000));

const buffer = fs.readFileSync('output/output.mp3');
const audioData = Buffer.from(buffer).toString('base64');

const blobUrl = `data:audio/mp3;base64,${audioData}`;

  const duration=await getAudioDurationInSeconds('output/output.mp3');
  res.json({
    "url": blobUrl,
    "duration":duration
  });
});


app.get('/', (req, res) => {
  res.send('Hello World!');
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);

});
