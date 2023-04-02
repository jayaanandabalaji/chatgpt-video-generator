import say from 'say';
import {MyVideo} from './video/MyVideo';
import { Player } from "@remotion/player";
import React, { useState, useRef } from "react";
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
  sentence?: string;
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
              Authorization: `Bearer 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`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{"role": "user", "content": "summary of "+input+" in 3 lines"}]

            }),
          }
        );
        const data = await response.json();
        const message = data.choices[0].message.content.trim();
        const sentences = message.split(". ");

                console.log("got sentence "+sentences[0]);

                const audioSrc = await textToAudioSrc(sentences[0]);
                       console.log(audioSrc);
                      
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
        setMessages([...messages, { message: input }, { 
            message,
             isBot: true,
             blobUrl:Videodata.videos[0].video_files[highestWidthIndex].link,
             sentence:sentences[0]
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
  
  const requestOptions: CustomRequestInit = {
    timeout: 10000, // 10 seconds
    // other options here
  };
  
  const textToAudioSrc = async (text:string) => {
    const textToAudioResponse = await fetch("http://localhost:3001/getaudio?text="+text, requestOptions);
    const resString = await textToAudioResponse.text();
    const response = await fetch(resString);
    const videoBlob = await response.blob();
    const blobUrl = URL.createObjectURL(videoBlob);
    console.log(blobUrl);

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
      setVideoBlobUrl(blobUrl);
    } catch (error) {
      console.error(error);
    }
  }

  const [videoBlobUrl, setVideoBlobUrl] = useState('');

  
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
             <Player
             component={MyVideo}
             durationInFrames={150}
             fps={30}
             controls
             compositionWidth={960}
             compositionHeight={540}
             inputProps={{
               blobUrl: message.blobUrl!,
               sentence:message.sentence!
             }}
           />
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
