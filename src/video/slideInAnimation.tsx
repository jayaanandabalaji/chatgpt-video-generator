import { useState } from 'react';
import { useVideoConfig,  } from 'remotion';
import {interpolate, useCurrentFrame,Sequence} from 'remotion';

export const TextAnimation: React.FC<{
	text: string;
}> = ({ text }) => {

    const { width } = useVideoConfig();

  const divStyle: React.CSSProperties = {
    fontSize: width/32,
    fontFamily: 'SF Pro Text, Helvetica, Arial, sans-serif',
    textAlign: 'center',
    position: 'absolute',
    left:20,
    bottom: 20,
    color:'#FCF7F4',
    fontWeight:'bold',
    padding:'20px',
    backgroundColor:'rgba(153,0,18,0.5)'
  };
  const frame = useCurrentFrame();
  const width1 = interpolate(frame, [0, 20], [0, 80],{
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const maxCharactersPerLine = width/32;
  const visibleText = frame >= 20 ? text : text.slice(0, Math.floor(maxCharactersPerLine * 3.5));
  const totalCharacters = visibleText.length;
  const totalLines = Math.ceil(totalCharacters / maxCharactersPerLine);
    
  return (
    
    <div
    style={{...divStyle,width: `${width1}%`  }}
     >
   {frame >= 20 && (
        <span style={{}}>
          {text}
        </span>
      )}
       {frame < 20 && (
        <span style={{}}>
        {new Array(totalLines).fill(<br />)}
      </span>
      )}
  </div>
  );
};
