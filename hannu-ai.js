document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  // State Machine Variables
  let currentStep = 0;
  const userData = {
    name: '',
    businessName: '',
    businessType: '',
    goals: '',
    website: '',
    challenges: '',
    budget: '',
    timeline: '',
    email: '',
    consultationTime: ''
  };

  // Knowledge Base
  const portfolioQA = [
    {
      keywords: ['who is naveed', 'who are you', 'who created you'],
      answer: "Naveed is a web developer and digital solutions provider focused on creating modern, high-performing websites and helping businesses grow through SEO, AI automation, and digital marketing."
    },
    {
      keywords: ['why choose naveed', 'why hire naveed', 'why work with you'],
      answer: "Every project is tailored to business goals with a focus on modern design, fast performance, SEO best practices, and long-term growth."
    },
    {
      keywords: ['how long does a website take', 'timeline for website', 'how long to build'],
      answer: "Timeline depends on project complexity; an accurate estimate is provided after understanding your specific requirements."
    },
    {
      keywords: ['how much does a website cost', 'pricing', 'price', 'cost'],
      answer: "Pricing depends on requirements, features, design complexity, and functionality. We can provide an accurate estimate via a free consultation."
    }
  ];

  const servicesMap = {
    website: "Website Design & Redesign (Modern, responsive, fast, and conversion-oriented)",
    seo: "SEO (Technical SEO, keyword optimization, and speed optimization)",
    marketing: "Digital Marketing & Landing Pages (Lead generation and conversion optimization)",
    automation: "AI Automation (Business automation, AI chatbots, and workflow automation)"
  };

  const splashScreen = document.getElementById('splashScreen');
  const leadFormScreen = document.getElementById('leadFormScreen');
  const preChatForm = document.getElementById('preChatForm');
  const chatContainer = document.getElementById('chatContainer');
  const startChatBtn = document.getElementById('startChatBtn');

  // Interactive Glow Effect
  const splashCardMain = document.querySelector('#splashScreen .splash-card');
  const splashGlow = document.querySelector('.splash-glow');
  
  if (splashCardMain && splashGlow) {
    splashCardMain.addEventListener('mousemove', (e) => {
      const rect = splashCardMain.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Center of 600x600 glow is 300x300, offset to make it follow cursor
      splashGlow.style.top = '0';
      splashGlow.style.left = '0';
      splashGlow.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
    });
    
    splashCardMain.addEventListener('mouseleave', () => {
      // Reset to original centered position
      splashGlow.style.top = '-10%';
      splashGlow.style.left = '50%';
      splashGlow.style.transform = `translateX(-50%)`;
    });
  }

  // 1. Splash Screen Button -> Show Lead Form
  if (startChatBtn) {
    startChatBtn.addEventListener('click', () => {
      splashScreen.style.opacity = '0';
      setTimeout(() => {
        splashScreen.style.display = 'none';
        
        leadFormScreen.style.display = 'flex';
        setTimeout(() => {
          leadFormScreen.style.opacity = '1';
        }, 50);
      }, 500);
    });
  }

  // 2. Lead Form Submit -> Start Chat
  if (preChatForm) {
    preChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('startChatSubmitBtn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Starting... <i class="fa-solid fa-spinner fa-spin"></i>';
      submitBtn.disabled = true;
      
      // Save data
      userData.name = document.getElementById('leadName').value.trim();
      userData.purpose = document.getElementById('leadPurpose').value;
      userData.phone = `(${document.getElementById('leadCountryCode').value}) ${document.getElementById('leadPhone').value.trim()}`;
      
      // Send directly to Google Sheet
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyE-x5OgTAygPEJL9WWrVsyFM8zZ9JST-eTHAebuIVdGR6aMdXmRXYeitRYtzOX8kpr/exec";
      const formData = {
          name: userData.name,
          phone: userData.phone,
          message: `Purpose: ${userData.purpose}\nStatus: Started Hannu AI Chat`
      };
      
      fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      }).catch(err => console.error("Error sending lead to sheet:", err))
        .finally(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          
          // Start chat at step 1 (Empty State)
          currentStep = 1;
          
          const leadFormCard = document.getElementById('leadFormCard');
          const formSuccessCard = document.getElementById('formSuccessCard');
          
          // Hide form card, show success card
          leadFormCard.style.opacity = '0';
          setTimeout(() => {
            leadFormCard.style.display = 'none';
            
            formSuccessCard.style.display = 'flex';
            setTimeout(() => {
              formSuccessCard.style.opacity = '1';
              
              // Wait 2.5s for success animation to play
              setTimeout(() => {
                // Hide entire splash screen, show chat
                leadFormScreen.style.opacity = '0';
                setTimeout(() => {
                  leadFormScreen.style.display = 'none';
                  
                  // Set name in empty state
                  document.getElementById('emptyStateName').textContent = userData.name;
                  
                  chatContainer.style.display = 'flex';
                  setTimeout(() => {
                    chatContainer.style.opacity = '1';
                    chatContainer.classList.add('show-drop');
                    // We don't type a message here anymore, we wait for the user to pick an option from the empty state
                  }, 50);
                }, 500);
              }, 2500); // 2.5 seconds wait for tick
            }, 50);
          }, 400); // Wait for form card to fade out
        });
    });
  }

  // Form Submit Handler
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Hide empty state if it is visible
    const emptyState = document.getElementById('chatEmptyState');
    if (emptyState && emptyState.style.display !== 'none') {
      emptyState.style.display = 'none';
    }

    // 1. Add user message to UI
    addUserMessage(message);
    chatInput.value = '';

    // 2. Check if it's a general question (Knowledge base interception)
    const isGeneralQuestion = checkKnowledgeBase(message);
    
    if (isGeneralQuestion) {
      // If it was a general question, answer it, then ask the current step question again
      setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          askNextQuestion(); // Re-ask the current step
        }, 1200);
      }, 2500); // Wait for the bot to finish answering the general question
      return;
    }

    // 3. Process normal flow (Current static logic)
    processUserInput(message);

    /* 
      =========================================================
      [FUTURE API INTEGRATION SLOT]
      When you get your API Key (e.g. OpenAI), you can replace
      the `processUserInput(message)` call above with this:
      
      const API_KEY = "YOUR_API_KEY_HERE";
      fetchExternalAI(message, API_KEY);
      =========================================================
    */
  });

  // Placeholder function for future API integration
  async function fetchExternalAI(userMessage, apiKey) {
    // Example: fetch('https://api.openai.com/v1/chat/completions', { ... })
    // Then call: addBotMessage(apiResponseText);
  }

  function processUserInput(message) {
    // Special case for Empty State (Step 1)
    if (currentStep === 1) {
      userData.goals = message; // Capture the intent from the suggestion pill
      
      setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          addBotMessage(`Great! I can definitely help you with that.`);
          
          setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
              removeTypingIndicator();
              addBotMessage(`To give you the best recommendations, what's your business name?`);
            }, 1000);
          }, 800);
        }, 1200);
      }, 500);
      
      currentStep = 2;
      return; // Early return because we manually triggered the next questions
    }
  
    // Save data based on current step
    switch (currentStep) {
      case 2:
        userData.businessName = message;
        break;
      case 3:
        userData.businessType = message;
        break;
      case 4:
        // We skip 4 now, but just in case
        userData.goals = message;
        break;
      case 5:
        userData.website = message;
        break;
      case 6:
        userData.challenges = message;
        break;
      case 7:
        // Step 7 was budget
        userData.budget = message;
        break;
      case 8:
        userData.timeline = message;
        break;
      case 9:
        // Skipped because we collected phone in the lead form
        break;
      case 10:
        userData.consultationTime = message;
        break;
    }

    // Determine next step
    if (currentStep === 5) {
      const msgLower = message.toLowerCase();
      if (msgLower.includes('no') || msgLower.includes("don't have")) {
        currentStep = 7; // Skip challenges, go to recommendations + budget
      } else {
        currentStep = 6; // Ask challenges
      }
    } else if (currentStep === 6) {
      currentStep = 7;
    } else {
      currentStep++;
      
      // Skip step 4 (Goals) since we already collected it via Empty State pills
      if (currentStep === 4) {
        currentStep = 5;
      }
      
      // Skip step 9 (Phone Number) since we already collected it in the form
      if (currentStep === 9) {
        currentStep = 10;
      }
    }

    // Proceed to next question
    setTimeout(() => {
      showTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        askNextQuestion();
      }, 1200);
    }, 500);
  }

  function askNextQuestion() {
    switch (currentStep) {
      case 1:
        addBotMessage("What's your name?");
        break;
      case 2:
        addBotMessage(`What's your business name?`);
        break;
      case 3:
        addBotMessage("Great! What type of business do you own? (e.g., Dental clinic, E-commerce, Local service)");
        break;
      case 4:
        addBotMessage("Got it. What are you trying to achieve right now? (e.g., Get more leads, rank higher on Google, sell products online)");
        break;
      case 5:
        addBotMessage("Do you currently have a website? If yes, please share the website URL.");
        break;
      case 6: // Asked challenges, now give recommendation and ask budget
        addBotMessage("What challenges are you facing with your current website? (e.g., Low traffic, slow speed, poor design)");
        break;
      case 7:
        // Provide recommendations and ask budget
        let recText = "Based on what you've shared, I highly recommend our ";
        const goalsLower = userData.goals.toLowerCase();
        
        if (goalsLower.includes('lead') || goalsLower.includes('traffic') || goalsLower.includes('rank') || goalsLower.includes('google')) {
          recText += servicesMap.seo + " and " + servicesMap.marketing;
        } else if (goalsLower.includes('automate') || goalsLower.includes('time')) {
          recText += servicesMap.automation;
        } else {
          recText += servicesMap.website + " and " + servicesMap.seo;
        }
        
        recText += ". Naveed can tailor this exactly to your needs.";
        addBotMessage(recText);
        
        setTimeout(() => {
          showTypingIndicator();
          setTimeout(() => {
            removeTypingIndicator();
            addBotMessage("What is your estimated budget for this project?");
          }, 1200);
        }, 1500);
        break;
      case 8:
        addBotMessage("When are you looking to start? (e.g., Immediately, Next month, Just exploring)");
        break;
      case 9:
        addBotMessage("Could you please provide a phone number so Naveed can text or call you?");
        break;
      case 10:
        addBotMessage("What is the best time and day for a free 15-minute consultation with Naveed?");
        break;
      case 11:
        addBotMessage(`Thank you, ${userData.name}! I've recorded all your details. Naveed will review your requirements for ${userData.businessName} and email you shortly at ${userData.email} to confirm your consultation time. Have a great day!`);
        console.log("Collected Lead Data:", userData);
        
        // Disable input
        chatInput.disabled = true;
        chatInput.placeholder = "Consultation requested!";
        document.getElementById('sendBtn').disabled = true;
        break;
    }
  }

  function checkKnowledgeBase(message) {
    const msgLower = message.toLowerCase();
    
    // Check predefined portfolio questions
    for (const qa of portfolioQA) {
      for (const keyword of qa.keywords) {
        if (msgLower.includes(keyword)) {
          setTimeout(() => {
            showTypingIndicator();
            setTimeout(() => {
              removeTypingIndicator();
              addBotMessage(qa.answer);
            }, 1500);
          }, 500);
          return true;
        }
      }
    }

    // Check if it's a question we don't know (but only if they use question words and it's not a normal flow answer)
    const questionWords = ['who', 'what', 'where', 'when', 'why', 'how', 'can you'];
    const isQuestion = questionWords.some(w => msgLower.startsWith(w)) || msgLower.includes('?');
    
    // Allow normal answers to pass even if they look like questions, unless they specifically ask about Naveed/services outside the flow
    if (isQuestion && msgLower.includes('naveed') && !msgLower.includes(userData.name.toLowerCase())) {
      setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          addBotMessage("I don't have enough information to answer that accurately. I'll make sure Naveed discusses it with you during your consultation.");
        }, 1500);
      }, 500);
      return true;
    }

    return false;
  }

  // --- UI Helpers ---

  function addBotMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot-message';
    msgDiv.innerHTML = `
      <div class="message-avatar bot-avatar" style="overflow: hidden; padding: 0; background: none;">
        <video autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
          <source src="images/Hannu's AI background.mp4" type="video/mp4">
        </video>
      </div>
      <div class="message-content">
        <p>${text}</p>
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user-message';
    msgDiv.innerHTML = `
      <div class="message-avatar user-avatar"><i class="fa-solid fa-user"></i></div>
      <div class="message-content">
        <p>${text}</p>
      </div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator-wrap';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = `
      <div class="typing-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    chatMessages.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

});
