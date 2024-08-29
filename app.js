const express = require('express');
const multer = require('multer');
const { SpeechClient } = require('@google-cloud/speech');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Create a new speech client
const speechClient = new SpeechClient({
  keyFilename: './credentials/speech-to-text-434008-7e67ea45e644.json', // Replace with your actual path
});

// Endpoint to handle audio uploads
app.post('/upload', upload.single('audio'), async (req, res) => {
  const audioFilePath = req.file.path;

  // Read the audio file and convert it to base64
  const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

  const audio = {
    content: audioBytes,
  };

  const config = {
    encoding: 'MP3', // Change based on your audio encoding
    sampleRateHertz: 16000, // Change based on your audio sample rate
    languageCode: 'en-US',
  };

  const request = {
    audio: audio,
    config: config,
  };

  // Recognize the speech in the audio file
  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    res.status(200).send(`Transcription: ${transcription}`);
  } catch (error) {
    console.log('err', error)
    res.status(500).json({message: 'Error processing audio'});
  } finally {
    // Clean up uploaded file
    fs.unlinkSync(audioFilePath);
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
