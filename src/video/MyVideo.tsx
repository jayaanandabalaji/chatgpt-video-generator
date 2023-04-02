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
	sentence: string;
}> = ({ blobUrl,sentence }) =>{
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<AbsoluteFill >
				
            <Video src={blobUrl} />
				<Sequence  from={10} >
				<Audio src={"http://localhost:3001/output.wav"}/>
                <TextAnimation text={sentence}/>
				</Sequence>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
