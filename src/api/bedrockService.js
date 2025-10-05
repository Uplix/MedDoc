// src/api/bedrockService.js (Final Version)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const question = (prompt) => {
  // Create a simpler payload object.
  // No need to stringify the inner 'body' anymore.
  const payload = {
    prompt: prompt // Send the prompt directly
  };
  return apiClient.post('/api', payload);
};


// EXAMPLE:

// import React, { useState } from 'react';
// import { understandRequest } from './api/bedrockService';

// function App() {
//   const [prompt, setPrompt] = useState('');
//   const [response, setResponse] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!prompt) return;

//     setIsLoading(true);
//     setResponse('');
//     try {
//       const res = await understandRequest(prompt);
      
//       // --- THIS IS THE FIX ---
//       // 'res.data' is already the parsed JavaScript object.
//       // We no longer need to parse it or access a '.body' property.
//       const modelResult = res.data; 
      
//       setResponse(modelResult.result);

//     } catch (error) {
//       console.error("Failed to get response:", error);
//       setResponse("An error occurred.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Ask Bedrock AI</h1>
//       <form onSubmit={handleSubmit}>
//         <textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="What do you want to know?"
//         />
//         <button type="submit" disabled={isLoading}>
//           {isLoading ? 'Thinking...' : 'Submit'}
//         </button>
//       </form>
//       {response && (
//         <div className="response-container">
//           <h2>Response:</h2>
//           <p>{response}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;