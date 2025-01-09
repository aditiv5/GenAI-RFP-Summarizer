import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import unknownIcon from '../assets/icons/unknown.svg';

const QAComponent = ({ onClose, document }) => {
  const [userMessage, setUserMessage] = useState('');  // State to store user input
  const [messages, setMessages] = useState([]);  // State to store chat messages
  const [isMinimized, setIsMinimized] = useState(false); // State to track minimized status
  const chatContainerRef = useRef(null);  // Reference for chat container to auto-scroll
  const [loading, setLoading] = useState(false); // State for loading indicator

  // Function to format the response
  const formatResponse = (response) => {
    const formattedResponse = response.split('\n').map((line, index) => {
      // Check if the line starts with a numbered list (e.g., "1. item")
      // if (line.match(/^\d+\./)) {
      //   return (
      //     <ol key={index} className="text-sm lg:text-base pl-1">
      //       <li>{line}</li>
      //     </ol>
      //   );  // Numbered list (ol with li)
      // }
      
       // Check if the line starts with a numbered list (e.g., "1. item")
    if (line.match(/^\d+\./)) {
      // Split the line into the number and the rest of the item
      const parts = line.match(/^(\d+\.)\s*(.*)$/);
      if (parts) {
        return (
          <ol key={index} className="text-sm lg:text-base pl-1">
            <li>
              <strong>{parts[1]}</strong>{parts[2]}
            </li>
          </ol>
        );  // Numbered list (ol with li), with the number bolded
      }
    }
      // Check if the line starts with a bullet point (e.g., "* item"), but only if it's not part of a numbered list
      else if (line.match(/^[*-•]\s/) && !line.match(/^\d+\./)) {
        return (
          <ul key={index} className="text-sm lg:text-base pl-1">
            <li>{line}</li>
          </ul>
        );  // Bullet list (ul with li)
      }
      return (
        <p key={index} className="text-sm lg:text-base">{line}</p>
      );  // Regular text
    });

    return formattedResponse;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload
    if (userMessage.trim()) {
      // Add user's message to chat history
      setMessages((prevMessages) => [...prevMessages, { text: userMessage, sender: 'user' }]);
      setUserMessage('');  // Clear input field after submitting
      setLoading(true);

      try {
        let uniqueId = document.unique_id; // Default unique_id from the document
        let fileName = encodeURIComponent(document.name.split('.').slice(0, -1).join('.')); // Default file name extraction

        // If unique_id is not found in the document, extract from the URL
        if (!uniqueId && document.url) {
          const urlParts = document.url.split('/');
          if (urlParts.length > 5) {
            uniqueId = urlParts[5].split('_')[0]; // Extract unique_id from URL
            const fileNameWithParams = urlParts[urlParts.length - 1];
            const [fileNameWithExtension] = fileNameWithParams.split('?');
            const [fileNameWithoutExtension] = fileNameWithExtension.split('_');
            fileName = fileNameWithoutExtension.trim();
          } else {
            console.error('URL does not contain enough parts to extract unique_id.');
          }
        }

        if (!uniqueId) {
          throw new Error('Unable to find unique_id.');
        }

        // Define the API URL
        //const apiUrl = `https://e5aq51m6hc.execute-api.ap-south-1.amazonaws.com/dev/querychatbot?unique_id=${uniqueId}&query=${encodeURIComponent(userMessage)}`;
        const apiUrl = `https://qjmo6fdbn1.execute-api.ap-south-1.amazonaws.com/dev/querychatbot?unique_id=${uniqueId}&query=${encodeURIComponent(userMessage)}`;
        console.log('Using unique_id:', uniqueId);
        console.log('Query:', userMessage);

        // Fetch the chatbot's response
        const response = await axios.post(apiUrl);

        // Parse the body from the response
        const responseBody = JSON.parse(response.data.body);  // Parse the stringified JSON

        // Add bot's response to chat history
        if (responseBody && responseBody.answer) {
          const formattedAnswer = formatResponse(responseBody.answer);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: formattedAnswer, sender: 'bot' },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Sorry, I could not find an answer.', sender: 'bot' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching chatbot response:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Sorry, there was an error with the chatbot.', sender: 'bot' },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Auto-scroll chat container whenever new messages are added
  useEffect(() => {
    if (chatContainerRef.current && !isMinimized) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 w-[400px] lg:w-[500px] bg-white rounded-lg shadow-lg p-1 transition-all duration-300 ${isMinimized ? 'h-[60px]' : 'h-[700px]'}`}
    >
      {/* QA Chat Window */}
      <div className="w-full h-full border border-primary border-opacity-20 rounded-lg flex flex-col">
        <div className="flex h-[60px] items-center justify-start py-7 bg-[#22639c] text-white font-bold shadow-md">
          <img
            src="/genai/assets/q&a.png"
            //src="src/chat.svg"
            className="h-[34px] w-[34px] mx-[10px]"
            alt="user-avatar"
          />
          <span className="whitespace-nowrap">Q &amp; A</span>
          {/* Display document name if provided */}
          {document && document.name && (
            <span className="text-sm font-normal ml-2">- {document.name}</span>
          )}

          {/* Close and Minimize Button */}
          <div className="ml-auto flex items-center space-x-2">
            {/* Minimize Button */}
            <button
              className="text-white hover:text-gray-300 focus:outline-none"
              aria-label="Minimize chat"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              className="text-red-500 hover:text-red-300 focus:outline-none"
              aria-label="Close preview"
              onClick={onClose} // Close QA component when clicked
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Container */}
        {!isMinimized && (
          <div
            className="grow bg-white rounded-md my-2 lg:max-h-[800px] max-h-[350px] overflow-y-auto"
            ref={chatContainerRef}
          >
            <div className="chatarea-outer flex flex-col justify-start items-center h-full space-y-4">
              {/* Render messages or initial prompt */}
              {messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center text-center grow">
                  <div className="text-primary flex">
                    <svg
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-[30px] w-12 animate-pulse"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4"></path>
                      <path d="M9.5 9h.01"></path>
                      <path d="M14.5 9h.01"></path>
                      <path d="M9.5 13a3.5 3.5 0 0 0 5 0"></path>
                    </svg>
                    <span className="h-[30px] w-12 animate-pulse mr-2">...</span>
                  </div>
                  <span className="text-primary text-sm lg:text-base">
                    Ask me anything about the RFP/EOI
                  </span>
                </div>
              ) : (
                // Display chat messages
                messages.map((message, index) => (
                  <div key={index} className={`mb-2 px-2 text-sm lg:text-base rounded-lg max-w-[80%] py-1 ${message.sender === 'user' ? 'self-end bg-[#22639c] text-white' : 'self-start bg-gray-300 text-primary'}`}>
                    {message.text}
                  </div>
                ))
              )}

              {/* Show loading dots */}
              {loading && (
                <div className="flex items-center text-left ml-2">
                  <span className="animate-pulse text-primary text-6xl">...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input form */}
        {!isMinimized && (
          <form
            className="flex gap-2 items-center py-7 px-4 text-black shadow-md rounded-md w-full"
            onSubmit={handleSubmit}
          >
            <input
              className="intro-x login__input form-control py-3 px-4 block border border-primary rounded-md w-full placeholder:text-sm sm:placeholder:text-base lg:placeholder:text-lg xl:placeholder:text-xl"
              type="text"
              name="user-message"
              id="user-message"
              placeholder="Type your question here..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#22639c] text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m21.426 11.095-17-8A.999.999 0 0 0 3.03 4.242L4.969 12 3.03 19.758a.998.998 0 0 0 1.396 1.147l17-8a1 1 0 0 0 0-1.81zM5.481 18.197l.839-3.357L12 12 6.32 9.16l-.839-3.357L18.651 12l-13.17 6.197z"></path>
              </svg>
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default QAComponent;
