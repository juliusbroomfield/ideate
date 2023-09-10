import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import '../App.css';

export default function Ide() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('python');

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

  const handleLanguageChange = e => {
    setLanguage(e.target.value);
  }

  return (
    <div className='ide__container'>
      <div className='ide__top'> <select className='ide__dropdown' onChange={handleLanguageChange}>
        <option className='ide__drop' value="python">Python</option>
        <option className='ide__drop' value="javascript">JavaScript</option>
        <option className='ide__drop' value="java">Java</option>
        <option className='ide__drop' value="c_cpp">C++</option>
      </select>
      <button className='ide__btn' onClick={handleRunClick}>Run</button></div>
      <Editor
        height="500px"
        width="800px"
        borderRadius="5px"
        defaultLanguage={languageModes[language]}
        defaultValue="def hello():"
        onChange={handleCodeChange}
        theme="vs-dark"
        options={{
          fontSize: 20,
          borderRadius: 10
      }}
      />
      <div style={{
        backgroundColor: '#1e1e1e', 
        color: '#CCC',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '10px',
        fontFamily: 'Courier, monospace',
        whiteSpace: 'pre-wrap'
      }}>Output: {output}</div>

    </div>
    
  );
}