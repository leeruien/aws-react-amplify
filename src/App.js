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
    //try {
      // const payload = {
      //   body: JSON.stringify({ input_text: userMessageString }) 
      // };
      console.log('after payload')
      /*
       const response = await axios.post(
         'https://vqu1ejiuvl.execute-api.ap-southeast-1.amazonaws.com/qnembed', 
        payload
       ); 
       ;*/
       // send user's message to the api end point
       await
        fetch(' https://nhc6dafwmk.execute-api.ap-southeast-1.amazonaws.com/question_input', {
            mode: 'cors',
            method: 'POST',
             body: JSON.stringify({
               input_text: userMessageString }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(function (error) {
            console.log("Error comunicating to server");
        })
        console.log("after posting api")
        
        const response = await fetch('http://13.214.193.133:8080/api', {
            mode: 'cors',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(function (error) {
            console.log("Error comunicating to server", error.response);
        })
        console.log("after flask api")
      // if (!response.ok) {
      //     throw new Error('Failed to send message: ' + response.statusText);
      // }
      
      console.log('API Response: success', response.ok);
      console.log('API Response: success', response.data);
      const responseData = await response.json()
      console.log('API Response: success', responseData);
        //return response.data; // Return response data if you need it
    // } catch (error) {
    //     console.error('Error sending user message to API:', error);
    //     console.error('Error response from API:', error.response);
    //     // Display error message to user or handle the error appropriately
    //     throw error; // Throw error to be handled by the caller if needed
    // }
    
    // if api gateway returns after done dont process the message
    
    setIsWaitingForResponse(true);
    setMessages(prevMessages => [...prevMessages, userMessageObj]);    
    //get generated text
    let answer = responseData.generated_text || '';
    console.log("this is answer", answer)
    //replace special characters with space
    if (answer.charAt(0) === '.' || answer.charAt(0) === '=' || answer.charAt(0) === ',') {
      answer = answer.substr(1);
    }    
    answer = answer.replaceAll(/=/g, '')
                    .replaceAll(/[\r\n]+/g, ' ')
                    .replaceAll(/\*/g, '')
                    .replaceAll(/".\n"/g, '')
                    .replaceAll(/"outputs":\s*\[|\],?\s*"inputs":\s*\[|\]\s*{/g, '')
                    .replaceAll(/{"inputs":\s*\[.*?\]}|{"outputs":\s*\[.*?\]}/g, '')
                    .replaceAll(/{"inputs":\s*\[.*?\}|{"outputs":\s*\[.*?\]}/g, '')
                    .replaceAll(/<|eot_id|><|start_header_id|>assistant<|end_header_id|>/g, '')
                    .replaceAll(/<|eot_id|><|start_header_id|>assistant/g, '')
                    .replace(/\[.*?\]/g, '')
                    .replaceAll(/\bassistant\b/gi, '')
                    .replaceAll(/!|\|+/g, '')
                    .replaceAll(/[[\]{}"]|/g, '').trim();

    console.log("this is answer 2", answer)    
    let sentences = answer.split(/(?<=[.!?])\s+/); //sentences is array 
    
    //remove the truncated part of answer
    if (sentences.length > 0 && !/[.!?]$/.test(sentences[sentences.length - 1])) {
      sentences.pop();
    } 
  
    let botAnswer = sentences.join(' ').trim();
    if (botAnswer.charAt(0) === '.' || botAnswer.charAt(0) === '=' || botAnswer.charAt(0) === ',' || botAnswer.charAt(0) === '-') {
      botAnswer = botAnswer.substr(1);
    } 
    
    console.log('before bot reply');
    console.log(typeof botAnswer)
    const botReply={
      text: botAnswer, // insert here
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
      <div className="header-border">
        <button className='heading-container'onClick={handleRefresh} style={{display: 'inline-block', marginRight: '20px'}}><FontAwesomeIcon icon={ faRefresh } /></button>
        <h1 className='heading-container'style={{textAlign: 'center', display:'inline-block'}}>Ask me anything!</h1>                         
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

function ChatForm({handleUserMessage, isWaitingForResponse}){  
  const [input, setInput] = useState('');
  let handleSubmit = null;
  handleSubmit = (e) => { //function passed down, calls handleUserMessage
    e.preventDefault();
    if (!input.trim()) return;
    handleUserMessage(input);
    setInput('');
    //setIsWaitingForResponse(true);
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