import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import '../App.css';
import play from '../assets/play.png'


export default function Ide() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');
  const [isOutputVisible, setIsOutputVisible] = useState(false);

  const [gptCode, setGptCode] = useState('');

  const fetchGptCode = async () => {
    try {
        const response = await axios.get('/textgpt'); // adjust the route if necessary
        if (response.data.code) {
            setGptCode(response.data.code);
            setCode(response.data.code);  // set the fetched code as the value in the IDE
        } else {
            console.error("Failed to fetch GPT generated code.");
        }
    } catch (error) {
        console.error(error);
    }
}


  const toggleOutput = () => {
    setIsOutputVisible(!isOutputVisible);
};




  const languageModes = {
    'python': 'python',
    'javascript': 'javascript',
    'java': 'java',
    'c_cpp': 'cpp'

    // add more languages here
  }

  const languageIDs = {
    'python': 71,
    'javascript': 63,
    'java': 62,
    'c_cpp': 54
    // add more languages here
  }

  const handleCodeChange = value => {
    setCode(value);
  };

  const handleRunClick = async () => {
    try {
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions', 
        {
          source_code: code,
          language_id: languageIDs[language],
        },
        {
          headers: {
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'x-rapidapi-key': 'fd041090camsh30eb8815740c517p1e7f35jsnd1cb58107e5d',
            'Content-Type': 'application/json',
          },
        }
      );
      
      const token = response.data.token;
      let result = await getResult(token);
      setOutput(result.stdout || result.stderr);
    } catch (err) {
      console.error(err);
    }
  };

  const getResult = async token => {
    while (true) {
      const response = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        {
          headers: {
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'x-rapidapi-key': 'fd041090camsh30eb8815740c517p1e7f35jsnd1cb58107e5d'
          },
        }
      );
  
      if (response.data.status.id > 2) {
        return {
          stdout: response.data.stdout,
          stderr: response.data.stderr
        };
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleLanguageChange = langKey => {
    setLanguage(langKey);
  }
  

  return (
    <div className='ide__container'>
      <div className="dropdown">
  <button className="dropdown-button">
    {languageModes[language]} <i className="arrow-down"></i>
  </button>
  <div className="dropdown-content">
    {Object.keys(languageModes).map(langKey => (
      <a key={langKey} href="#" onClick={() => handleLanguageChange(langKey)}>
        {languageModes[langKey]}
      </a>
    ))}
  </div>
</div>
      <Editor
        height="400px"
        width="800px"
        borderRadius="5px"
        defaultLanguage={languageModes[language]}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          borderRadius: 10
      }}
      />
      <div className='console'>
    <div 
        className={`console-output ${isOutputVisible ? 'visible' : ''}`} 
        style={{
            backgroundColor: '', 
            color: '#000',
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'Courier, monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: isOutputVisible ? 'auto' : '0'
        }}
    >
        {isOutputVisible && output}
    </div>

    <div className="console-controls">
        <span className="console-label" onClick={toggleOutput}>
            Console {isOutputVisible ? '▲' : '▼'}
        </span>

        <button className='ide__btn' onClick={handleRunClick}>
            Run
        </button>
    </div>
</div>




    </div>
    
  );
}

