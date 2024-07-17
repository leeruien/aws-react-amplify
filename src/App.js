import './App.css';
import { useState, useEffect, useRef} from 'react';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

function App(){
  //initialisation of state
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false); //default was false
  const lastMessage = useRef(null);
  //send greeting message
  useEffect(() => {
    sendGreetingMessage();
  }, []);
  const sendGreetingMessage = () => { 
    const greetingMessage = {
        text: "Hello! How can I assist you?",
        sender: 'bot'
    };
    setMessages([greetingMessage]);
  };
  //handles the message/question sent by the user
  const handleUserMessage = async (userMessage) => { 
    const userMessageObj = { 
      text: userMessage,
      sender: 'user'
    };
    const userMessageString = typeof userMessage === 'string' ? userMessage : String(userMessage);
    console.log('after payload')
      // change api endpoint url ip to public ipv4 address of chromadb ec2 instance 
      //https://nhc6dafwmk.execute-api.ap-southeast-1.amazonaws.com/question_input 
      //http://54.169.228.16:8080/api
    const response = await fetch('http://52.221.210.138:80/api', { 
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify({
        input_text: userMessageString }),
      headers: {
          'Content-Type': 'application/json'
    }
    }).catch(function (error) {
        console.log("Error comunicating to server", error.response);
    })

    console.log("after flask api")      
    console.log('API Response: success', response.body);
    const responseData = await response.json()
    const responseBody = JSON.parse(responseData.body);
    console.log("response body", responseBody["generated_text"])
    setIsWaitingForResponse(true);
    setMessages(prevMessages => [...prevMessages, userMessageObj]);    
    //get generated text
    let answer = responseBody.generated_text || '';
    
    console.log("this is answer", answer)
    // replace special characters in strings   
    answer = answer.replaceAll(/=/g, '')
                    .replace(/\[.*?\]/g, '')
                    .replace(/\{.*?\}/g, '')
                    .replaceAll(/^\s*>\s*/g, '')
                    .replaceAll(/[[\]{}"]|/g, '').trim();

    console.log("this is answer 2", answer)  
    // Ensure answer does not start with a special character
    while (answer.charAt(0) === '.' || 
       answer.charAt(0) === '=' || 
       answer.charAt(0) === '#' ||
       answer.charAt(0) === ',' || 
       answer.charAt(0) === '-' || 
       answer.charAt(0) === ':'|| 
       answer.charAt(0) === '>'||  
       answer.charAt(0) === ';') {
    answer = answer.substr(1);
    answer = answer.trim();
    }  
    let lastSentence = answer.search(/([.!?])(?=[^.!?]*$)/);

    // Keep everything up to and including the last complete sentence
    if (lastSentence !== -1) {  
      answer = answer.substring(0, lastSentence + 1);
      answer = answer.trim();
    }    
    console.log('before bot reply');
    const botReply={
      text: answer, 
      sender: 'bot'
      };
    console.log('after bot reply');
    
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, botReply]); 
      setIsWaitingForResponse(false);   
    }, 1000);   
   }
  
  const handleRefresh=()=>{
    setMessages([]);
    sendGreetingMessage();
  };

  useEffect(() => {
    if(lastMessage) {
      lastMessage.current.addEventListener('DOMNodeInserted', event => {
        const { currentTarget: target } = event;
        target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
      });
    }
  }, [])
  
  
  return(
    <div className='center-border' style={{justifyContent:'space-between'}}>    
      <div className="header-border" >
        <button className='heading-container'onClick={handleRefresh} style={{display: 'inline-block', marginRight: '20px'}}><FontAwesomeIcon icon={ faRefresh } /></button>
        <h1 className='heading-container'style={{textAlign: 'center', display:'inline-block'}}>AI Chatbot</h1>     
      </div>
        <div className='message-container' ref={lastMessage}>   
          <ChatForm handleUserMessage={handleUserMessage} messages={messages} isWaitingForResponse={isWaitingForResponse} />  
          {messages.map((message, index)=>(
            <div key={index} className={`message ${message.sender === 'bot' ? 'bot':'user'}` }>              
              {message.sender === 'bot' && (<img width="35" height="40" className='bot-avatar'  src="https://img.icons8.com/fluency/48/retro-robot.png" alt="bot-avatar"></img>)}
              {message.sender !== 'bot' && (<img className='user-avatar'  src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="user-avatar"></img>)}
              <div className='message-box'>  
                {message.text}
              </div>
            </div>
          ))}
        </div>                  
    </div>        
  );
}

// function to handle input box 
function ChatForm({handleUserMessage, isWaitingForResponse}){  
  const [input, setInput] = useState('');
  let handleSubmit = null;
  handleSubmit = (e) => { 
    e.preventDefault();
    if (!input.trim()) return;
    handleUserMessage(input);
    setInput('');
  };

  const handleChange = (e) =>{
    setInput(e.target.value);
  };

  return (
    <form id="chat-form" onSubmit={handleSubmit}>
     <div className='input-container'>
        <input type="text" placeholder='Type here...' 
        value={input} onChange={handleChange}/>
        <button disabled={isWaitingForResponse || input.trim()===''
       } style={{alignContent:'flex-end'}} className='input' ><FontAwesomeIcon icon = {faPaperPlane}  size="2x"/></button>        
      </div>
    </form>
  );
}
export default App;