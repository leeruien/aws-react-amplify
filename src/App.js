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
        const response = await fetch('http://13.212.151.156:8080/api', { 
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
      console.log('API Response: success', response.ok);
      console.log('API Response: success', response.data);
      const responseData = await response.json()
      console.log('API Response: success', responseData);    
    setIsWaitingForResponse(true);
    setMessages(prevMessages => [...prevMessages, userMessageObj]);    
    //get generated text
    let answer = responseData.generated_text || '';
    console.log("this is answer", answer)
    // replace special characters in strings   
    answer = answer.replaceAll(/=/g, '')
                    // .replaceAll(/[\r\n]+/g, ' ')
                    // .replaceAll(/\*/g, '')
                    // .replaceAll(/-/g, '')
                    // .replaceAll(/".\n"/g, '')
                    // .replaceAll(/"outputs":\s*\[|\],?\s*"inputs":\s*\[|\]\s*{/g, '')
                    // .replaceAll(/{"inputs":\s*\[.*?\]}|{"outputs":\s*\[.*?\]}/g, '')
                    // .replaceAll(/{"inputs":\s*\[.*?\}|{"outputs":\s*\[.*?\]}/g, '')
                    .replace(/\[.*?\]/g, '')
                    .replace(/\{.*?\}/g, '')
                    // .replaceAll(/\bassistant\b/gi, '')
                    // .replaceAll(/!|\|+/g, '')
                    .replaceAll(/^\s*>\s*/g, '')
                    .replaceAll(/[[\]{}"]|/g, '').trim();

    console.log("this is answer 2", answer)  
    while (answer.charAt(0) === '.' || 
       answer.charAt(0) === '=' || 
       answer.charAt(0) === ',' || 
       answer.charAt(0) === '-' || 
       answer.charAt(0) === ':'|| 
       answer.charAt(0) === '>'||  
       answer.charAt(0) === ';') {
    answer = answer.substr(1);
    answer = answer.trim();
    }  
  let lastSentence = answer.search(/([.!?])(?=[^.!?]*$)/);

  if (lastSentence !== -1) {
    // Keep everything up to and including the last complete sentence
    answer = answer.substring(0, lastSentence + 1);
    answer = answer.trim();
  }


    // let sentences = answer.split(/(?<=[.!?])\s+/); //sentences is array 
    
    // //remove the truncated part of answer
    // if (sentences.length > 0 && !/[.!?]$/.test(sentences[sentences.length - 1])) {
    //   sentences.pop();
    // } 
  
    // let botAnswer = sentences.join(' ').trim();
    // console.log("this is botanswer", botAnswer)
    
    console.log('before bot reply');
    // console.log(typeof botAnswer)
    const botReply={
      text: answer, // insert here
      sender: 'bot'
      };
    console.log('after bot reply');
    
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, botReply]); 
      setIsWaitingForResponse(false);//update state      
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
        {/* <img width="40" height="40" src="https://img.icons8.com/stickers/100/chatbot.png" alt="chatbot"/>              */}
          <div className='message-container' ref={lastMessage}>   
          <ChatForm handleUserMessage={handleUserMessage} messages={messages} isWaitingForResponse={isWaitingForResponse} />  
          {messages.map((message, index)=>(
            <div key={index} className={`message ${message.sender === 'bot' ? 'bot':'user'}` }>              
              {message.sender === 'bot' && (<img className='bot-avatar' src="https://img.icons8.com/color/36/000000/administrator-male.png" alt="bot-avatar"></img>)}
              {message.sender !== 'bot' && (<img className='user-avatar' src="https://img.icons8.com/office/36/000000/person-female.png" alt="user-avatar"></img>)}
              <div className='message-box'>  
                {message.text}
              </div>
            </div>
          ))}
          </div>     
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