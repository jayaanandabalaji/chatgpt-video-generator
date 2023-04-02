import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { Player } from "@remotion/player";
import {MyVideo} from './video/MyVideo';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import React, { useState } from 'react';
import ChatGPT from './chat';
function App() {
  const [query, setQuery] = useState('');
  
  const handleClick = () => {

   fetch("https://api.pexels.com/videos/search?query="+query+"&per_page=1&orientation=landscape", {
      headers: {
        "Authorization": "JcP7hM8FulhBKhJpNGe5EdiwFVXaMTuSYBqN07ObPzZGvPATymKHZAbh",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        console.log("working");
        
      })
      .catch(error => console.log(error));
  }


  
  const [videoBlobUrl, setVideoBlobUrl] = useState('');

  
  
  

  const handleQueryChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setQuery(event.target.value);
  }
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
    <ChatGPT />
  </ThemeProvider>

  );
  

  /*return (
    <div className="App">
      <br></br>
      <br></br>
      <TextField id="standard-basic" label="summary of" variant="standard" value={query} onChange={handleQueryChange} />
      <br></br>
      <br></br>
      <Button variant="contained" onClick={handleClick}>Generate</Button>
      <br></br>
      <br></br>
      {videoBlobUrl && (
      <Player
        component={MyVideo}
        durationInFrames={150}
        fps={30}
        controls
        compositionWidth={960}
        compositionHeight={540}
        inputProps={{
          blobUrl: videoBlobUrl
        }}
      />
    )}
    </div>
  );*/
}

export default App;
