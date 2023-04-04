import React from 'react';
import {spring} from 'remotion';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {  Video ,Audio, staticFile } from "remotion";
import {TextAnimation} from './slideInAnimation';

export const MyVideo: React.FC<{
	blobUrl: string;
	sentence: any;
	audioUrl: any;
}> = ({ blobUrl,sentence,audioUrl }) =>{

	let accumulatedDuration = 0;
	const sequenceList = audioUrl.map((audio:any, i:number) => {
	  const startFrom = 10 + parseInt((accumulatedDuration * 30).toString(), 10);
	  const durationInFrames = Math.ceil(audio["duration"] * 30);
	  accumulatedDuration += audio["duration"];
	
	  return (
		<Sequence from={startFrom} durationInFrames={durationInFrames} key={audio["url"]}>
		  <Audio src={audio["url"]} />
		  <TextAnimation text={sentence[i]} />
		</Sequence>
	  );
	});
	
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill >
				
            <Video src={blobUrl} />

			{sequenceList}
				
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
