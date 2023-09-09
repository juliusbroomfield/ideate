import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

function VideoRecorder() {
    const webcamRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [videoSrc, setVideoSrc] = useState(null);
    
    const handleStartRecording = () => {
        setRecording(true);
        webcamRef.current.startRecording();
    };

    const handleStopRecording = () => {
        setRecording(false);
        const video = webcamRef.current.stopRecording();
        setVideoSrc(video);
    };

    const handleDownload = () => {
        if (videoSrc) {
            const link = document.createElement('a');
            link.href = videoSrc;
            link.download = 'recorded_video.webm';
            link.click();
        }
    };

    return (
        <div>
            <Webcam
                audio={true}
                ref={webcamRef}
                style={{ width: '50%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} // Adjust size to 50% and center it
            />
            <div style={{ textAlign: 'center' }}> {/* Center the buttons */}
                {recording ? (
                    <button onClick={handleStopRecording}>Stop Recording</button>
                ) : (
                    <button onClick={handleStartRecording}>Start Recording</button>
                )}
                {videoSrc && <button onClick={handleDownload}>Download Video</button>}
            </div>
        </div>
    );
}

export default VideoRecorder;

