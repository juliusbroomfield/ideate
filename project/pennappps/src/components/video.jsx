import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import '../App.css';
import Ide from './Ide';
import github from '../assets/github-mark-white.svg'
import axious from "axious";

function VideoRecorder() {
    const webcamRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [ideContent, setIdeContent] = useState("");
    

    const handleStartRecording = () => {
        const stream = webcamRef.current.stream;
        const newMediaRecorder = new MediaRecorder(stream);

        newMediaRecorder.ondataavailable = handleDataAvailable;
        newMediaRecorder.start(10); // Collect 10ms of data

        setMediaRecorder(newMediaRecorder);
        setRecording(true);
    };

    const handleDataAvailable = (event) => {
        if (event.data.size > 0) {
            setRecordedChunks((prev) => prev.concat([event.data]));
        }
    };

    const [generatedCode, setGeneratedCode] = useState('');

    const handleStopRecording = async () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
            
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            
            // Send blob to backend
            let formData = new FormData();
            formData.append('file', blob);
    
            const response = await fetch('http://localhost:8080/video', {
    method: 'POST',
    body: formData,
});

            const data = await response.json();
    
            if (data && data.translated_code) {
                setGeneratedCode(data.translated_code);
            }
        }
    };
    

    const handleDownload = () => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'react-webcam-record.webm';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        }
    };

    return (
        <div className="App">
            <div className="nav">
                Ideation
            </div>
            <div className="container">
                <div className="signin-content video-page">
                    <div className='video-container'>
                        <Webcam
                            audio={true}
                            ref={webcamRef}
                            style={{ width: '100%', borderRadius: '10px', marginBottom: '1.5rem', }} 
                        />
                         <div className="signin-footer">
                        {recording ? (
                            <button className="signin-button" onClick={handleStopRecording}>Stop Recording</button>
                        ) : (
                            <button className="signin-button" onClick={handleStartRecording}>Start Recording</button>
                        )}
                        {recordedChunks.length > 0 && <button className="signin-button download" onClick={handleDownload}>Download Video</button>}
                    </div>
                    </div>
                    <div>
                        <Ide />
                    </div>
                </div>
    
                </div>
                <button className='img-link'>
    <img className='img' src={github} alt="Publish to Github" />
</button>

            </div>
    );
}

export default VideoRecorder;
