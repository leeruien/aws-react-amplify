import './App.css';
import { useState, useEffect, useRef} from 'react';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { API } from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

function App(){
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false); //default was false
  const lastMessage = useRef(null);
  useEffect(() => {
    sendGreetingMessage();
  }, []);
  const sendGreetingMessage = () => { //default greeting message
    const greetingMessage = {
        text: "Hello! How can I assist you?",
        sender: 'bot'
    };
    setMessages([greetingMessage]);
  };
  const handleUserMessage = async (userMessage) => { //this functionmakes a post request with values from our state in the border, url is to the end point in the api gateway
    const userMessageObj = { //add async in front of user message
      text: userMessage,
      sender: 'user'
    };
    // send user's message to the api end point
    try {
      const response = await API.post('qnembed-API', '/question', {
        body: userMessageObj
      });
        //return response.data; // Return response data if you need it
    } catch (error) {
        console.error('Error sending user message to API:', error);
        // Display error message to user or handle the error appropriately
        throw error; // Throw error to be handled by the caller if needed
    }
    
    //
    setIsWaitingForResponse(true);
    setMessages(prevMessages => [...prevMessages, userMessageObj]);    
    //bot reply placeholder for now till i get further api information
    const botReply={
      text: `You said: ${userMessage}. How can I help you?`, // insert here
      sender: 'bot'
      };
      /*
      const botReply = async() => {
        try{
          const response = await fetch('https://i1xsjzkri4.execute-api.us-east-1.amazonaws.com/default/serverlessAppFunction'
                  ) 
                  if (response.ok) {
                    throw new Error('Failed to fetch bot reply');}//link change to the url of api gateway, after deploying
                  const data = await response.json();
                  return data; //return response data
        } catch (error) {
          console.error('Error fetching data:', error);
          throw error;
        }
        
      };
      */
    
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, botReply]); 
      setIsWaitingForResponse(false);//update state      
    }, 1000);   
    
    /*const {message} = this.state;
    await axios.post('https://i1xsjzkri4.execute-api.us-east-1.amazonaws.com/default/serverlessAppFunction', {key1: `${message}`}); 
    setTimeout(async () => {
      try{
        const response = await botReply();
        if (response){
          setMessages(prevMessages => [...prevMessages, response]);
        }
      } catch (error) { //error handling
        console.error('Error updating data:', error);
      } finally {
        setIsWaitingForResponse(false);
      }
    }, 1000);*/
    
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