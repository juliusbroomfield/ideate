import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

function VideoRecorder() {
    const webcamRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);

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

    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
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
        <div>
            <Webcam
                audio={true}
                ref={webcamRef}
                style={{ width: '50%', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} 
            />
            <div style={{ textAlign: 'center' }}>
                {recording ? (
                    <button onClick={handleStopRecording}>Stop Recording</button>
                ) : (
                    <button onClick={handleStartRecording}>Start Recording</button>
                )}
                {recordedChunks.length > 0 && <button onClick={handleDownload}>Download Video</button>}
            </div>
        </div>
    );
}

export default VideoRecorder;
