export interface Question {
  id: number;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  answer: number;
}

export const QUESTIONS: Question[] = [
  {
    "id": 1,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q1: What is the optimal use case for Transformers?",
    "options": [
      "Using a centralized monolithic SQL database",
      "Hardcoding the logic directly in the frontend",
      "Relying entirely on manual human intervention",
      "Deploying scalable pipelines for Transformers"
    ],
    "answer": 3
  },
  {
    "id": 2,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q2: What is the optimal use case for CNNs?",
    "options": [
      "Deploying scalable pipelines for CNNs",
      "Ignoring the schema definition and validation",
      "Executing synchronous blocking operations on the main thread",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 0
  },
  {
    "id": 3,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q3: What is the optimal use case for RNNs?",
    "options": [
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread",
      "Using a basic switch-case statement without ML",
      "Deploying scalable pipelines for RNNs"
    ],
    "answer": 3
  },
  {
    "id": 4,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q4: What is the optimal use case for GANs?",
    "options": [
      "Deploying scalable pipelines for GANs",
      "Executing synchronous blocking operations on the main thread",
      "Relying entirely on manual human intervention",
      "Storing sensitive data in plaintext format"
    ],
    "answer": 0
  },
  {
    "id": 5,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q5: What is the optimal use case for Diffusion Models?",
    "options": [
      "Relying entirely on manual human intervention",
      "Deploying scalable pipelines for Diffusion Models",
      "Using a centralized monolithic SQL database",
      "Hardcoding the logic directly in the frontend"
    ],
    "answer": 1
  },
  {
    "id": 6,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q6: What is the optimal use case for Transformers?",
    "options": [
      "Bypassing standard security protocols for speed",
      "Ignoring the schema definition and validation",
      "Using a basic switch-case statement without ML",
      "Deploying scalable pipelines for Transformers"
    ],
    "answer": 3
  },
  {
    "id": 7,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q7: What is the optimal use case for CNNs?",
    "options": [
      "Deploying scalable pipelines for CNNs",
      "Bypassing standard security protocols for speed",
      "Using a basic switch-case statement without ML",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 0
  },
  {
    "id": 8,
    "topic": "AI Architect",
    "difficulty": "Easy",
    "question": "AI Architect Concept Q8: What is the optimal use case for RNNs?",
    "options": [
      "Using a basic switch-case statement without ML",
      "Using a centralized monolithic SQL database",
      "Bypassing standard security protocols for speed",
      "Deploying scalable pipelines for RNNs"
    ],
    "answer": 3
  },
  {
    "id": 9,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q9: What is the optimal use case for GANs?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread",
      "Deploying scalable pipelines for GANs"
    ],
    "answer": 3
  },
  {
    "id": 10,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q10: What is the optimal use case for Diffusion Models?",
    "options": [
      "Deploying scalable pipelines for Diffusion Models",
      "Ignoring the schema definition and validation",
      "Storing sensitive data in plaintext format",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 0
  },
  {
    "id": 11,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q11: What is the optimal use case for Transformers?",
    "options": [
      "Deploying scalable pipelines for Transformers",
      "Hardcoding the logic directly in the frontend",
      "Using a centralized monolithic SQL database",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 0
  },
  {
    "id": 12,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q12: What is the optimal use case for CNNs?",
    "options": [
      "Ignoring the schema definition and validation",
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread",
      "Deploying scalable pipelines for CNNs"
    ],
    "answer": 3
  },
  {
    "id": 13,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q13: What is the optimal use case for RNNs?",
    "options": [
      "Deploying scalable pipelines for RNNs",
      "Using a centralized monolithic SQL database",
      "Using standard legacy REST APIs without rate limiting",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 0
  },
  {
    "id": 14,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q14: What is the optimal use case for GANs?",
    "options": [
      "Relying solely on client-side validation",
      "Ignoring the schema definition and validation",
      "Relying entirely on manual human intervention",
      "Deploying scalable pipelines for GANs"
    ],
    "answer": 3
  },
  {
    "id": 15,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q15: What is the optimal use case for Diffusion Models?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "Deploying scalable pipelines for Diffusion Models",
      "Using a centralized monolithic SQL database",
      "Using a basic switch-case statement without ML"
    ],
    "answer": 1
  },
  {
    "id": 16,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q16: What is the optimal use case for Transformers?",
    "options": [
      "Deploying scalable pipelines for Transformers",
      "Relying entirely on manual human intervention",
      "Relying solely on client-side validation",
      "Ignoring the schema definition and validation"
    ],
    "answer": 0
  },
  {
    "id": 17,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q17: What is the optimal use case for CNNs?",
    "options": [
      "Ignoring the schema definition and validation",
      "Deploying scalable pipelines for CNNs",
      "Bypassing standard security protocols for speed",
      "Using a centralized monolithic SQL database"
    ],
    "answer": 1
  },
  {
    "id": 18,
    "topic": "AI Architect",
    "difficulty": "Medium",
    "question": "AI Architect Concept Q18: What is the optimal use case for RNNs?",
    "options": [
      "Using a basic switch-case statement without ML",
      "Ignoring the schema definition and validation",
      "Bypassing standard security protocols for speed",
      "Deploying scalable pipelines for RNNs"
    ],
    "answer": 3
  },
  {
    "id": 19,
    "topic": "AI Architect",
    "difficulty": "Hard",
    "question": "AI Architect Concept Q19: What is the optimal use case for GANs?",
    "options": [
      "Using standard legacy REST APIs without rate limiting",
      "Storing sensitive data in plaintext format",
      "Executing synchronous blocking operations on the main thread",
      "Deploying scalable pipelines for GANs"
    ],
    "answer": 3
  },
  {
    "id": 20,
    "topic": "AI Architect",
    "difficulty": "Hard",
    "question": "AI Architect Concept Q20: What is the optimal use case for Diffusion Models?",
    "options": [
      "Deploying scalable pipelines for Diffusion Models",
      "Using a centralized monolithic SQL database",
      "Hardcoding the logic directly in the frontend",
      "Relying entirely on manual human intervention"
    ],
    "answer": 0
  },
  {
    "id": 21,
    "topic": "AI Architect",
    "difficulty": "Hard",
    "question": "AI Architect Concept Q21: What is the optimal use case for Transformers?",
    "options": [
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread",
      "Hardcoding the logic directly in the frontend",
      "Deploying scalable pipelines for Transformers"
    ],
    "answer": 3
  },
  {
    "id": 22,
    "topic": "AI Architect",
    "difficulty": "Hard",
    "question": "AI Architect Concept Q22: What is the optimal use case for CNNs?",
    "options": [
      "Deploying scalable pipelines for CNNs",
      "Using a centralized monolithic SQL database",
      "Bypassing standard security protocols for speed",
      "Hardcoding the logic directly in the frontend"
    ],
    "answer": 0
  },
  {
    "id": 23,
    "topic": "AI Architect",
    "difficulty": "Hard",
    "question": "AI Architect Concept Q23: What is the optimal use case for RNNs?",
    "options": [
      "Storing sensitive data in plaintext format",
      "Ignoring the schema definition and validation",
      "Using standard legacy REST APIs without rate limiting",
      "Deploying scalable pipelines for RNNs"
    ],
    "answer": 3
  },
  {
    "id": 24,
    "topic": "AI Architect",
    "difficulty": "Hard",
    "question": "AI Architect Concept Q24: What is the optimal use case for GANs?",
    "options": [
      "Deploying scalable pipelines for GANs",
      "Bypassing standard security protocols for speed",
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 0
  },
  {
    "id": 25,
    "topic": "AI Architect",
    "difficulty": "Hard",
    "question": "AI Architect Concept Q25: What is the optimal use case for Diffusion Models?",
    "options": [
      "Deploying scalable pipelines for Diffusion Models",
      "Storing sensitive data in plaintext format",
      "Ignoring the schema definition and validation",
      "Relying solely on client-side validation"
    ],
    "answer": 0
  },
  {
    "id": 26,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q1: How do you implement JWT Auth securely?",
    "options": [
      "By securely enforcing JWT Auth",
      "Relying entirely on manual human intervention",
      "Hardcoding the logic directly in the frontend",
      "Storing sensitive data in plaintext format"
    ],
    "answer": 0
  },
  {
    "id": 27,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q2: How do you implement Redux State securely?",
    "options": [
      "By securely enforcing Redux State",
      "Bypassing standard security protocols for speed",
      "Hardcoding the logic directly in the frontend",
      "Ignoring the schema definition and validation"
    ],
    "answer": 0
  },
  {
    "id": 28,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q3: How do you implement Server-side Rendering securely?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "By securely enforcing Server-side Rendering",
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 1
  },
  {
    "id": 29,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q4: How do you implement Dockerization securely?",
    "options": [
      "Using a basic switch-case statement without ML",
      "By securely enforcing Dockerization",
      "Using a centralized monolithic SQL database",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 1
  },
  {
    "id": 30,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q5: How do you implement GraphQL securely?",
    "options": [
      "Using standard legacy REST APIs without rate limiting",
      "By securely enforcing GraphQL",
      "Using a basic switch-case statement without ML",
      "Using a centralized monolithic SQL database"
    ],
    "answer": 1
  },
  {
    "id": 31,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q6: How do you implement JWT Auth securely?",
    "options": [
      "By securely enforcing JWT Auth",
      "Relying entirely on manual human intervention",
      "Using standard legacy REST APIs without rate limiting",
      "Hardcoding the logic directly in the frontend"
    ],
    "answer": 0
  },
  {
    "id": 32,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q7: How do you implement Redux State securely?",
    "options": [
      "By securely enforcing Redux State",
      "Using standard legacy REST APIs without rate limiting",
      "Storing sensitive data in plaintext format",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 0
  },
  {
    "id": 33,
    "topic": "Full Stack Web Dev",
    "difficulty": "Easy",
    "question": "Full Stack Concept Q8: How do you implement Server-side Rendering securely?",
    "options": [
      "Using a basic switch-case statement without ML",
      "By securely enforcing Server-side Rendering",
      "Executing synchronous blocking operations on the main thread",
      "Using a centralized monolithic SQL database"
    ],
    "answer": 1
  },
  {
    "id": 34,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q9: How do you implement Dockerization securely?",
    "options": [
      "By securely enforcing Dockerization",
      "Relying solely on client-side validation",
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 0
  },
  {
    "id": 35,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q10: How do you implement GraphQL securely?",
    "options": [
      "Using a basic switch-case statement without ML",
      "Relying solely on client-side validation",
      "Using a centralized monolithic SQL database",
      "By securely enforcing GraphQL"
    ],
    "answer": 3
  },
  {
    "id": 36,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q11: How do you implement JWT Auth securely?",
    "options": [
      "Executing synchronous blocking operations on the main thread",
      "Storing sensitive data in plaintext format",
      "By securely enforcing JWT Auth",
      "Using a centralized monolithic SQL database"
    ],
    "answer": 2
  },
  {
    "id": 37,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q12: How do you implement Redux State securely?",
    "options": [
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread",
      "Using standard legacy REST APIs without rate limiting",
      "By securely enforcing Redux State"
    ],
    "answer": 3
  },
  {
    "id": 38,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q13: How do you implement Server-side Rendering securely?",
    "options": [
      "Relying solely on client-side validation",
      "By securely enforcing Server-side Rendering",
      "Executing synchronous blocking operations on the main thread",
      "Storing sensitive data in plaintext format"
    ],
    "answer": 1
  },
  {
    "id": 39,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q14: How do you implement Dockerization securely?",
    "options": [
      "Using standard legacy REST APIs without rate limiting",
      "Using a centralized monolithic SQL database",
      "Hardcoding the logic directly in the frontend",
      "By securely enforcing Dockerization"
    ],
    "answer": 3
  },
  {
    "id": 40,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q15: How do you implement GraphQL securely?",
    "options": [
      "Executing synchronous blocking operations on the main thread",
      "Hardcoding the logic directly in the frontend",
      "Relying entirely on manual human intervention",
      "By securely enforcing GraphQL"
    ],
    "answer": 3
  },
  {
    "id": 41,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q16: How do you implement JWT Auth securely?",
    "options": [
      "Using a centralized monolithic SQL database",
      "Bypassing standard security protocols for speed",
      "By securely enforcing JWT Auth",
      "Hardcoding the logic directly in the frontend"
    ],
    "answer": 2
  },
  {
    "id": 42,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q17: How do you implement Redux State securely?",
    "options": [
      "Relying entirely on manual human intervention",
      "Using standard legacy REST APIs without rate limiting",
      "Ignoring the schema definition and validation",
      "By securely enforcing Redux State"
    ],
    "answer": 3
  },
  {
    "id": 43,
    "topic": "Full Stack Web Dev",
    "difficulty": "Medium",
    "question": "Full Stack Concept Q18: How do you implement Server-side Rendering securely?",
    "options": [
      "Relying entirely on manual human intervention",
      "Ignoring the schema definition and validation",
      "Executing synchronous blocking operations on the main thread",
      "By securely enforcing Server-side Rendering"
    ],
    "answer": 3
  },
  {
    "id": 44,
    "topic": "Full Stack Web Dev",
    "difficulty": "Hard",
    "question": "Full Stack Concept Q19: How do you implement Dockerization securely?",
    "options": [
      "Executing synchronous blocking operations on the main thread",
      "By securely enforcing Dockerization",
      "Bypassing standard security protocols for speed",
      "Using a basic switch-case statement without ML"
    ],
    "answer": 1
  },
  {
    "id": 45,
    "topic": "Full Stack Web Dev",
    "difficulty": "Hard",
    "question": "Full Stack Concept Q20: How do you implement GraphQL securely?",
    "options": [
      "Using a basic switch-case statement without ML",
      "Using standard legacy REST APIs without rate limiting",
      "Bypassing standard security protocols for speed",
      "By securely enforcing GraphQL"
    ],
    "answer": 3
  },
  {
    "id": 46,
    "topic": "Full Stack Web Dev",
    "difficulty": "Hard",
    "question": "Full Stack Concept Q21: How do you implement JWT Auth securely?",
    "options": [
      "Using a basic switch-case statement without ML",
      "Using a centralized monolithic SQL database",
      "Bypassing standard security protocols for speed",
      "By securely enforcing JWT Auth"
    ],
    "answer": 3
  },
  {
    "id": 47,
    "topic": "Full Stack Web Dev",
    "difficulty": "Hard",
    "question": "Full Stack Concept Q22: How do you implement Redux State securely?",
    "options": [
      "Using standard legacy REST APIs without rate limiting",
      "Using a basic switch-case statement without ML",
      "Ignoring the schema definition and validation",
      "By securely enforcing Redux State"
    ],
    "answer": 3
  },
  {
    "id": 48,
    "topic": "Full Stack Web Dev",
    "difficulty": "Hard",
    "question": "Full Stack Concept Q23: How do you implement Server-side Rendering securely?",
    "options": [
      "By securely enforcing Server-side Rendering",
      "Using a centralized monolithic SQL database",
      "Ignoring the schema definition and validation",
      "Relying solely on client-side validation"
    ],
    "answer": 0
  },
  {
    "id": 49,
    "topic": "Full Stack Web Dev",
    "difficulty": "Hard",
    "question": "Full Stack Concept Q24: How do you implement Dockerization securely?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "Using standard legacy REST APIs without rate limiting",
      "Using a centralized monolithic SQL database",
      "By securely enforcing Dockerization"
    ],
    "answer": 3
  },
  {
    "id": 50,
    "topic": "Full Stack Web Dev",
    "difficulty": "Hard",
    "question": "Full Stack Concept Q25: How do you implement GraphQL securely?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "By securely enforcing GraphQL",
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 1
  },
  {
    "id": 51,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q1: In an automated workflow, how does an LLM handle data parsing?",
    "options": [
      "Executing synchronous blocking operations on the main thread",
      "Ignoring the schema definition and validation",
      "By utilizing robust methodologies for data parsing",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 2
  },
  {
    "id": 52,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q2: In an automated workflow, how does an LLM handle decision routing?",
    "options": [
      "Storing sensitive data in plaintext format",
      "Relying solely on client-side validation",
      "Using standard legacy REST APIs without rate limiting",
      "By utilizing robust methodologies for decision routing"
    ],
    "answer": 3
  },
  {
    "id": 53,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q3: In an automated workflow, how does an LLM handle error recovery?",
    "options": [
      "Using a centralized monolithic SQL database",
      "Relying solely on client-side validation",
      "Using standard legacy REST APIs without rate limiting",
      "By utilizing robust methodologies for error recovery"
    ],
    "answer": 3
  },
  {
    "id": 54,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q4: In an automated workflow, how does an LLM handle API integration?",
    "options": [
      "Ignoring the schema definition and validation",
      "Storing sensitive data in plaintext format",
      "By utilizing robust methodologies for API integration",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 2
  },
  {
    "id": 55,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q5: In an automated workflow, how does an LLM handle email drafting?",
    "options": [
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread",
      "By utilizing robust methodologies for email drafting",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 2
  },
  {
    "id": 56,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q6: In an automated workflow, how does an LLM handle data parsing?",
    "options": [
      "Relying entirely on manual human intervention",
      "Ignoring the schema definition and validation",
      "Executing synchronous blocking operations on the main thread",
      "By utilizing robust methodologies for data parsing"
    ],
    "answer": 3
  },
  {
    "id": 57,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q7: In an automated workflow, how does an LLM handle decision routing?",
    "options": [
      "By utilizing robust methodologies for decision routing",
      "Relying entirely on manual human intervention",
      "Bypassing standard security protocols for speed",
      "Hardcoding the logic directly in the frontend"
    ],
    "answer": 0
  },
  {
    "id": 58,
    "topic": "AI Automation",
    "difficulty": "Easy",
    "question": "AI Automation Concept Q8: In an automated workflow, how does an LLM handle error recovery?",
    "options": [
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread",
      "Using standard legacy REST APIs without rate limiting",
      "By utilizing robust methodologies for error recovery"
    ],
    "answer": 3
  },
  {
    "id": 59,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q9: In an automated workflow, how does an LLM handle API integration?",
    "options": [
      "By utilizing robust methodologies for API integration",
      "Executing synchronous blocking operations on the main thread",
      "Relying entirely on manual human intervention",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 0
  },
  {
    "id": 60,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q10: In an automated workflow, how does an LLM handle email drafting?",
    "options": [
      "Using a centralized monolithic SQL database",
      "By utilizing robust methodologies for email drafting",
      "Using standard legacy REST APIs without rate limiting",
      "Using a basic switch-case statement without ML"
    ],
    "answer": 1
  },
  {
    "id": 61,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q11: In an automated workflow, how does an LLM handle data parsing?",
    "options": [
      "Bypassing standard security protocols for speed",
      "By utilizing robust methodologies for data parsing",
      "Storing sensitive data in plaintext format",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 1
  },
  {
    "id": 62,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q12: In an automated workflow, how does an LLM handle decision routing?",
    "options": [
      "Relying entirely on manual human intervention",
      "By utilizing robust methodologies for decision routing",
      "Executing synchronous blocking operations on the main thread",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 1
  },
  {
    "id": 63,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q13: In an automated workflow, how does an LLM handle error recovery?",
    "options": [
      "Ignoring the schema definition and validation",
      "By utilizing robust methodologies for error recovery",
      "Using a centralized monolithic SQL database",
      "Relying entirely on manual human intervention"
    ],
    "answer": 1
  },
  {
    "id": 64,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q14: In an automated workflow, how does an LLM handle API integration?",
    "options": [
      "By utilizing robust methodologies for API integration",
      "Using standard legacy REST APIs without rate limiting",
      "Ignoring the schema definition and validation",
      "Using a centralized monolithic SQL database"
    ],
    "answer": 0
  },
  {
    "id": 65,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q15: In an automated workflow, how does an LLM handle email drafting?",
    "options": [
      "Executing synchronous blocking operations on the main thread",
      "Using standard legacy REST APIs without rate limiting",
      "Relying solely on client-side validation",
      "By utilizing robust methodologies for email drafting"
    ],
    "answer": 3
  },
  {
    "id": 66,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q16: In an automated workflow, how does an LLM handle data parsing?",
    "options": [
      "By utilizing robust methodologies for data parsing",
      "Using a basic switch-case statement without ML",
      "Ignoring the schema definition and validation",
      "Storing sensitive data in plaintext format"
    ],
    "answer": 0
  },
  {
    "id": 67,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q17: In an automated workflow, how does an LLM handle decision routing?",
    "options": [
      "Storing sensitive data in plaintext format",
      "By utilizing robust methodologies for decision routing",
      "Using a centralized monolithic SQL database",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 1
  },
  {
    "id": 68,
    "topic": "AI Automation",
    "difficulty": "Medium",
    "question": "AI Automation Concept Q18: In an automated workflow, how does an LLM handle error recovery?",
    "options": [
      "Relying entirely on manual human intervention",
      "By utilizing robust methodologies for error recovery",
      "Executing synchronous blocking operations on the main thread",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 1
  },
  {
    "id": 69,
    "topic": "AI Automation",
    "difficulty": "Hard",
    "question": "AI Automation Concept Q19: In an automated workflow, how does an LLM handle API integration?",
    "options": [
      "Storing sensitive data in plaintext format",
      "Using standard legacy REST APIs without rate limiting",
      "Executing synchronous blocking operations on the main thread",
      "By utilizing robust methodologies for API integration"
    ],
    "answer": 3
  },
  {
    "id": 70,
    "topic": "AI Automation",
    "difficulty": "Hard",
    "question": "AI Automation Concept Q20: In an automated workflow, how does an LLM handle email drafting?",
    "options": [
      "By utilizing robust methodologies for email drafting",
      "Bypassing standard security protocols for speed",
      "Using a centralized monolithic SQL database",
      "Relying solely on client-side validation"
    ],
    "answer": 0
  },
  {
    "id": 71,
    "topic": "AI Automation",
    "difficulty": "Hard",
    "question": "AI Automation Concept Q21: In an automated workflow, how does an LLM handle data parsing?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "By utilizing robust methodologies for data parsing",
      "Using a centralized monolithic SQL database",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 1
  },
  {
    "id": 72,
    "topic": "AI Automation",
    "difficulty": "Hard",
    "question": "AI Automation Concept Q22: In an automated workflow, how does an LLM handle decision routing?",
    "options": [
      "By utilizing robust methodologies for decision routing",
      "Bypassing standard security protocols for speed",
      "Using a basic switch-case statement without ML",
      "Relying entirely on manual human intervention"
    ],
    "answer": 0
  },
  {
    "id": 73,
    "topic": "AI Automation",
    "difficulty": "Hard",
    "question": "AI Automation Concept Q23: In an automated workflow, how does an LLM handle error recovery?",
    "options": [
      "By utilizing robust methodologies for error recovery",
      "Bypassing standard security protocols for speed",
      "Storing sensitive data in plaintext format",
      "Relying entirely on manual human intervention"
    ],
    "answer": 0
  },
  {
    "id": 74,
    "topic": "AI Automation",
    "difficulty": "Hard",
    "question": "AI Automation Concept Q24: In an automated workflow, how does an LLM handle API integration?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread",
      "By utilizing robust methodologies for API integration"
    ],
    "answer": 3
  },
  {
    "id": 75,
    "topic": "AI Automation",
    "difficulty": "Hard",
    "question": "AI Automation Concept Q25: In an automated workflow, how does an LLM handle email drafting?",
    "options": [
      "By utilizing robust methodologies for email drafting",
      "Using a centralized monolithic SQL database",
      "Hardcoding the logic directly in the frontend",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 0
  },
  {
    "id": 76,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q1: How does an autonomous agent manage its short-term memory?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "Relying entirely on manual human intervention",
      "Using a basic switch-case statement without ML",
      "By utilizing vector databases and prompting techniques for short-term memory"
    ],
    "answer": 3
  },
  {
    "id": 77,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q2: How does an autonomous agent manage its tool selection?",
    "options": [
      "By utilizing vector databases and prompting techniques for tool selection",
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread",
      "Hardcoding the logic directly in the frontend"
    ],
    "answer": 0
  },
  {
    "id": 78,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q3: How does an autonomous agent manage its goal decomposition?",
    "options": [
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread",
      "Storing sensitive data in plaintext format",
      "By utilizing vector databases and prompting techniques for goal decomposition"
    ],
    "answer": 3
  },
  {
    "id": 79,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q4: How does an autonomous agent manage its environment feedback?",
    "options": [
      "Using standard legacy REST APIs without rate limiting",
      "By utilizing vector databases and prompting techniques for environment feedback",
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 1
  },
  {
    "id": 80,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q5: How does an autonomous agent manage its self-reflection?",
    "options": [
      "By utilizing vector databases and prompting techniques for self-reflection",
      "Executing synchronous blocking operations on the main thread",
      "Bypassing standard security protocols for speed",
      "Using a basic switch-case statement without ML"
    ],
    "answer": 0
  },
  {
    "id": 81,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q6: How does an autonomous agent manage its short-term memory?",
    "options": [
      "By utilizing vector databases and prompting techniques for short-term memory",
      "Ignoring the schema definition and validation",
      "Executing synchronous blocking operations on the main thread",
      "Using a centralized monolithic SQL database"
    ],
    "answer": 0
  },
  {
    "id": 82,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q7: How does an autonomous agent manage its tool selection?",
    "options": [
      "By utilizing vector databases and prompting techniques for tool selection",
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread",
      "Bypassing standard security protocols for speed"
    ],
    "answer": 0
  },
  {
    "id": 83,
    "topic": "Agentic AI",
    "difficulty": "Easy",
    "question": "Agentic AI Concept Q8: How does an autonomous agent manage its goal decomposition?",
    "options": [
      "By utilizing vector databases and prompting techniques for goal decomposition",
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread",
      "Using a basic switch-case statement without ML"
    ],
    "answer": 0
  },
  {
    "id": 84,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q9: How does an autonomous agent manage its environment feedback?",
    "options": [
      "Using a centralized monolithic SQL database",
      "By utilizing vector databases and prompting techniques for environment feedback",
      "Using a basic switch-case statement without ML",
      "Ignoring the schema definition and validation"
    ],
    "answer": 1
  },
  {
    "id": 85,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q10: How does an autonomous agent manage its self-reflection?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "Executing synchronous blocking operations on the main thread",
      "Relying solely on client-side validation",
      "By utilizing vector databases and prompting techniques for self-reflection"
    ],
    "answer": 3
  },
  {
    "id": 86,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q11: How does an autonomous agent manage its short-term memory?",
    "options": [
      "Storing sensitive data in plaintext format",
      "Using standard legacy REST APIs without rate limiting",
      "Bypassing standard security protocols for speed",
      "By utilizing vector databases and prompting techniques for short-term memory"
    ],
    "answer": 3
  },
  {
    "id": 87,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q12: How does an autonomous agent manage its tool selection?",
    "options": [
      "Using a centralized monolithic SQL database",
      "By utilizing vector databases and prompting techniques for tool selection",
      "Relying solely on client-side validation",
      "Hardcoding the logic directly in the frontend"
    ],
    "answer": 1
  },
  {
    "id": 88,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q13: How does an autonomous agent manage its goal decomposition?",
    "options": [
      "By utilizing vector databases and prompting techniques for goal decomposition",
      "Relying entirely on manual human intervention",
      "Hardcoding the logic directly in the frontend",
      "Relying solely on client-side validation"
    ],
    "answer": 0
  },
  {
    "id": 89,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q14: How does an autonomous agent manage its environment feedback?",
    "options": [
      "Ignoring the schema definition and validation",
      "Using a basic switch-case statement without ML",
      "Bypassing standard security protocols for speed",
      "By utilizing vector databases and prompting techniques for environment feedback"
    ],
    "answer": 3
  },
  {
    "id": 90,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q15: How does an autonomous agent manage its self-reflection?",
    "options": [
      "Bypassing standard security protocols for speed",
      "Using a basic switch-case statement without ML",
      "By utilizing vector databases and prompting techniques for self-reflection",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 2
  },
  {
    "id": 91,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q16: How does an autonomous agent manage its short-term memory?",
    "options": [
      "By utilizing vector databases and prompting techniques for short-term memory",
      "Using standard legacy REST APIs without rate limiting",
      "Storing sensitive data in plaintext format",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 0
  },
  {
    "id": 92,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q17: How does an autonomous agent manage its tool selection?",
    "options": [
      "By utilizing vector databases and prompting techniques for tool selection",
      "Executing synchronous blocking operations on the main thread",
      "Storing sensitive data in plaintext format",
      "Using standard legacy REST APIs without rate limiting"
    ],
    "answer": 0
  },
  {
    "id": 93,
    "topic": "Agentic AI",
    "difficulty": "Medium",
    "question": "Agentic AI Concept Q18: How does an autonomous agent manage its goal decomposition?",
    "options": [
      "Bypassing standard security protocols for speed",
      "Using a basic switch-case statement without ML",
      "By utilizing vector databases and prompting techniques for goal decomposition",
      "Relying entirely on manual human intervention"
    ],
    "answer": 2
  },
  {
    "id": 94,
    "topic": "Agentic AI",
    "difficulty": "Hard",
    "question": "Agentic AI Concept Q19: How does an autonomous agent manage its environment feedback?",
    "options": [
      "By utilizing vector databases and prompting techniques for environment feedback",
      "Bypassing standard security protocols for speed",
      "Using a centralized monolithic SQL database",
      "Executing synchronous blocking operations on the main thread"
    ],
    "answer": 0
  },
  {
    "id": 95,
    "topic": "Agentic AI",
    "difficulty": "Hard",
    "question": "Agentic AI Concept Q20: How does an autonomous agent manage its self-reflection?",
    "options": [
      "By utilizing vector databases and prompting techniques for self-reflection",
      "Using a basic switch-case statement without ML",
      "Hardcoding the logic directly in the frontend",
      "Using a centralized monolithic SQL database"
    ],
    "answer": 0
  },
  {
    "id": 96,
    "topic": "Agentic AI",
    "difficulty": "Hard",
    "question": "Agentic AI Concept Q21: How does an autonomous agent manage its short-term memory?",
    "options": [
      "Using a centralized monolithic SQL database",
      "By utilizing vector databases and prompting techniques for short-term memory",
      "Hardcoding the logic directly in the frontend",
      "Relying entirely on manual human intervention"
    ],
    "answer": 1
  },
  {
    "id": 97,
    "topic": "Agentic AI",
    "difficulty": "Hard",
    "question": "Agentic AI Concept Q22: How does an autonomous agent manage its tool selection?",
    "options": [
      "By utilizing vector databases and prompting techniques for tool selection",
      "Relying solely on client-side validation",
      "Bypassing standard security protocols for speed",
      "Storing sensitive data in plaintext format"
    ],
    "answer": 0
  },
  {
    "id": 98,
    "topic": "Agentic AI",
    "difficulty": "Hard",
    "question": "Agentic AI Concept Q23: How does an autonomous agent manage its goal decomposition?",
    "options": [
      "Relying entirely on manual human intervention",
      "Hardcoding the logic directly in the frontend",
      "By utilizing vector databases and prompting techniques for goal decomposition",
      "Relying solely on client-side validation"
    ],
    "answer": 2
  },
  {
    "id": 99,
    "topic": "Agentic AI",
    "difficulty": "Hard",
    "question": "Agentic AI Concept Q24: How does an autonomous agent manage its environment feedback?",
    "options": [
      "Relying entirely on manual human intervention",
      "Executing synchronous blocking operations on the main thread",
      "Relying solely on client-side validation",
      "By utilizing vector databases and prompting techniques for environment feedback"
    ],
    "answer": 3
  },
  {
    "id": 100,
    "topic": "Agentic AI",
    "difficulty": "Hard",
    "question": "Agentic AI Concept Q25: How does an autonomous agent manage its self-reflection?",
    "options": [
      "Hardcoding the logic directly in the frontend",
      "By utilizing vector databases and prompting techniques for self-reflection",
      "Using a centralized monolithic SQL database",
      "Using a basic switch-case statement without ML"
    ],
    "answer": 1
  }
];
