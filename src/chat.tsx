import { Composition } from 'remotion';
import { useRef, useCallback } from 'react';
import RecordRTC from 'recordrtc';
import { useReactMediaRecorder } from 'react-media-recorder';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import say from 'say';
import {MyVideo} from './video/MyVideo';
import { Player, PlayerRef } from "@remotion/player";
import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Paper,
  TextField,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { makeStyles } from "@mui/styles";
import { CircularProgress } from "@mui/material";
const synth = window.speechSynthesis;

interface Message {
  message: string;
  isBot?: boolean;
  blobUrl?: string;
  audioUrl?: any;
  duration?: any;
  sentence?: any;
  width?: number;
  height?: number;
}

const useStyles = makeStyles((theme: { spacing: (arg0: number, arg1: number | undefined) => any; }) => ({
  paper: {
    padding: theme.spacing(3,0),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "calc(100% - 130px)",
    margin: theme.spacing(2, 0),
  },
  message: {
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(1,0),
  },
  avatar: {
    marginRight: theme.spacing(1,0),
  },
  input: {
    flexGrow: 1,
    marginRight: theme.spacing(2,0),
  },
  sendButton: {
    minWidth: "100px",
  },
}));

function ChatGPT() {
  const classes = useStyles();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async(event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input) {
      setMessages([...messages, { message: input, isBot: false }]);
     await sendMessageFromGpt(event);
      setInput("");
    }
  };

  const sendMessageFromGpt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input) {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.openai.com/v1/chat/completions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer OPENAI_API_KEY`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{"role": "user", "content": "summary of "+input+" in 3 lines in a single paragraph seperated by dots"}]
            }),
          }
        );
        const data = await response.json();
        const message = data.choices[0].message.content.trim();
        var totalDuration=0;
        const sentences = message.split(". ");
        const audioSrc = [];

        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];
          const response = await textToAudioSrc(sentence);
          audioSrc.push(response);
        
      
          totalDuration += (response as any)["duration"] + 1;
        }
        
        
                      
        const videoResponse = await fetch("https://api.pexels.com/videos/search?query="+input+"&per_page=1&orientation=landscape", {
           headers: {
             "Authorization": "JcP7hM8FulhBKhJpNGe5EdiwFVXaMTuSYBqN07ObPzZGvPATymKHZAbh",
             "Content-Type": "application/json"
           }
         });
         const Videodata = await videoResponse.json();

         let highestWidth = 0;
        let highestWidthIndex=0;
        for (let i=0;i<Videodata.videos[0].video_files.length;i++) {
          
          if (Videodata.videos[0].video_files[i].width > highestWidth) {
            highestWidth = Videodata.videos[0].video_files[i].width;
            highestWidthIndex=i;
          }
        }
    //   await downloadVideo(Videodata.videos[0].video_files[highestWidthIndex].link);
    console.log({
      "sentences":sentences.toString(),
      "urls":audioSrc.toString()
    });
        setMessages([...messages, { message: input }, { 
            message,
             isBot: true,
             blobUrl:Videodata.videos[0].video_files[highestWidthIndex].link,
             audioUrl:audioSrc,
             sentence:sentences,
             width:960,
             height:540,
             duration:totalDuration
            }]);
        setInput("");
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
  };

  interface CustomRequestInit extends RequestInit {
    timeout?: number;
  }
  
  
  const textToAudioSrc = async (text:string) => {
    const textToAudioResponse = await fetch("https://dandy-south-foxtail.glitch.me/getaudio?text="+text);
    const resString = (await textToAudioResponse.json());

    return resString;
  };
  
  async function downloadVideo(url: string) {
    try {
        console.log("getting blob "+url);

      const response = await fetch("https://vod-progressive.akamaized.net/exp=1680433383~acl=%2Fvimeo-prod-skyfire-std-us%2F01%2F4179%2F23%2F595899205%2F2804926777.mp4~hmac=ef49c0c030b758ca455e250045248f6d6cbd6b81c956c97b13785d44584fe052/vimeo-prod-skyfire-std-us/01/4179/23/595899205/2804926777.mp4");
      console.log("getting blob 1");
      const videoBlob = await response.blob();
      console.log("getting blob 2");
      const blobUrl = URL.createObjectURL(videoBlob);
      console.log("getting blob 3"); 
      console.log(blobUrl);
     // setVideoBlobUrl(blobUrl);
    } catch (error) {
      console.error(error);
    }
  }


  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;
    const words = value.trim().split(/\s+/); // split the input by spaces
    if (words.length <= 2) { // limit to 2 words
      setInput(value);
    }
  };
  const [isRecording, setIsRecording] = useState(false);
  const playerRef = useRef<PlayerRef>(null);
  const wait = (milliseconds:number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };
  const [showControls, setShowControls] = useState(true);

  const handleRecordClick = async (duration:number) => {
    try {
     // await wait(1000); // Wait for 1 second

      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: {mediaSource: "screen"},
        audio: true,
      });
  
      const recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm',
        timeSlice: 1000, // Record video in chunks of 1s
        disableLogs: true
      });

      recorder.startRecording();
      setShowControls(false);
      playerRef.current?.requestFullscreen();
      playerRef.current?.play();
      setTimeout(() => {
        setIsRecording(false);
        recorder.stopRecording(() => {
          playerRef.current?.exitFullscreen();
          setShowControls(true);

          const blob = recorder.getBlob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'recorded-video.webm';
          document.body.appendChild(link);
          link.click();
          link.remove();
        });
        stream.getTracks().forEach((track: { stop: () => any; }) => track.stop());
      }, duration); 
    } catch (error) {
      console.error("Error starting screen recording:", error);
    }
  
  }

  return (
    <Container maxWidth="md">
      <Box textAlign="center" m={2}>
        <ChatBubbleOutlineIcon fontSize="large" />
        <h1>ChatGPT</h1>
      </Box>
      <Paper className={classes.paper}>
        {messages.map((message, index) => (
          <Box key={index} className={classes.message}>
            {message.isBot ? (
             <Avatar className={classes.avatar} src="https://via.placeholder.com/40" />
            ) : null}
            <Box component={Paper} p={2}>

            {message.isBot ? (
            <div style={{ display: 'block', width: '100%', height: '100%' }}>
                    

<Player
ref={playerRef}

              component={MyVideo}
              durationInFrames={parseInt((message.duration! * 30).toString(), 10)}
              fps={30}
              controls={showControls}
              compositionWidth={message.width!}
              compositionHeight={message.height!}
              inputProps={{
                blobUrl: message.blobUrl!,
                sentence: message.sentence!,
                audioUrl: message.audioUrl!,
              }}
            />     


            <div style={{ textAlign: 'center', marginTop: '1rem' }} onClick={()=>{
              handleRecordClick(parseInt((message.duration! * 1000).toString(), 10));
            }}>
              <a
                download={`audio_${Date.now()}.mp3`}
                style={{
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  backgroundColor: '#f08a5d',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >

                <FontAwesomeIcon icon={faDownload} style={{ marginRight: '0.5rem' }} />
                Download Video
              </a>
            </div>
          </div>
          
          

            ) : (
<p>{message.message}</p>
            )}
              
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef}></div>
      </Paper>
      <form onSubmit={sendMessage}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              className={classes.input}
              variant="outlined"
              label="Type a message"
              value={input}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
          <Button
  className={classes.sendButton}
  variant="contained"
  color="primary"
  type="submit"
  disabled={loading}
>
  {loading ? <CircularProgress size={24} /> : "Send"}
</Button>

          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default ChatGPT;
