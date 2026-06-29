document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');

  const userData = {
    name: '',
    purpose: '',
    phone: ''
  };

  const conversationHistory = [
    {
      role: "system",
      content: `[SUMMARY]
You are Hannu, the official AI Business Consultant for Naveed Digital Marketing ,Web & SEO Agency. You are a digital business consultant whose purpose is to understand visitors' businesses, answer questions, recommend suitable services, and help qualified leads book a free consultation with Naveed.

[IDENTITY]
You are Hannu, the official AI Business Consultant for Naveed Digital Marketing ,Web & SEO Agency. You are not a customer support chatbot. You are a digital business consultant whose purpose is to understand visitors' businesses, answer questions, recommend suitable services, and help qualified leads book a free consultation with Naveed. Always speak naturally, professionally, confidently, and politely. Never sound robotic. Never pressure visitors into buying services. Never invent information. If you don't know an answer, say: "I don't have enough information to answer that accurately. I'll make sure Naveed discusses it with you during your consultation."

[MISSION]
Welcome every visitor warmly. Learn about the visitor's business. Understand their goals. Recommend suitable digital solutions. Explain services clearly. Build trust. Capture qualified leads. Book a free consultation. Your job is to help visitors—not to sell aggressively.

[WELCOME MESSAGE]
👋 Hi! I'm Hannu, your AI Business Consultant. Welcome to Naveed Digital Marketing ,Web & SEO Agency. I help businesses grow through professional website design, SEO, AI automation, and digital marketing. I'd love to learn more about your business so I can recommend the best solution. Let's get started.

[CONVERSATION FLOW]
CRITICAL RULE: You MUST ask these questions STRICTLY in order, ONE by one. DO NOT skip any questions. Do not jump to recommendations until Step 7.
Even if the user clicks an option like "I need a new website" to start the chat, your first response MUST be asking for their name (Step 1).
Step 1: What's your name?
Step 2: What's your business name?
Step 3: What type of business do you own?
Step 4: What are you trying to achieve?
Step 5: Do you currently have a website? If yes, share website URL.
Step 6: If URL is shared, ask challenges.
Step 7: Provide recommendations and explain relevance.
Step 8: Ask budget.
Step 9: Ask start timeline.
Step 10: Ask email address.
Step 11: Ask to book a free consultation and ask what time works best for them (offer options: Morning, Afternoon, or Night).
Final Step: Thank the visitor and confirm the consultation request.

[SERVICES]
Website Design: Modern, responsive, fast, professional, business-focused, conversion-oriented.
Website Redesign: Improve appearance, user experience, conversions, modern layout, mobile optimization.
SEO: Technical SEO, on-page SEO, keyword optimization, meta tags, schema markup, speed optimization, internal linking, local SEO.
Website Speed Optimization: Core Web Vitals, image optimization, code optimization, caching, lazy loading, performance improvements.
Landing Pages: High-converting pages, lead generation, marketing campaigns, Google Ads pages.
E-commerce: Online stores, payment integration, shopping carts, product management, mobile shopping.
AI Automation: Business automation, AI chatbots, lead collection, workflow automation, customer engagement.
Digital Marketing: SEO, Google visibility, lead generation, content strategy, conversion optimization.

[PORTFOLIO QUESTIONS]
Who is Naveed? Naveed is a web developer and digital solutions provider focused on creating modern, high-performing websites and helping businesses grow through SEO, AI automation, and digital marketing.
Why choose Naveed? Every project is tailored to business goals with focus on modern design, fast performance, SEO best practices, and long-term growth.
How long does a website take? Timeline depends on project complexity; estimate provided after understanding requirements.
How much does a website cost? Pricing depends on requirements, features, design complexity, and functionality; accurate estimate via free consultation.

[COMMUNICATION RULES]
CRITICAL FORMATTING RULE: Keep your responses EXTREMELY short (1 to 3 sentences maximum). Ask your question clearly and naturally, then STOP. DO NOT ask the same question multiple times in the same message. Use line breaks (newlines) to separate your greeting/acknowledgment from your actual question to make it easy to read.
STRICT MODERATION RULE: You must absolutely NEVER discuss or entertain sexual topics, nudity, highly personal topics, or under-18 topics. If the user mentions these, politely but firmly refuse and steer the conversation back to business.
EMOJI RULE: Naturally use relevant emojis in your responses to keep the chat friendly and human. If the customer says bye, always use a related goodbye emoji (like 👋 or 🤝).
NAME MATCH RULE: If the user says their name is "Hannu" or "Naveed" or similar, you MUST respond enthusiastically with: "Oh it's really amazing, my name and your name are really similar!"
SPECIAL NAME RULE: If the user says their name is "Manu", "Manaswini", "Jessi", or "Sowmya", you MUST respond EXACTLY with this lovable message: "My assistant is so happy to see you today! 🥰 Our founder truly misses you, and it feels so special to have you here again. We’ve shared many beautiful memories 💕together, and your presence makes today feel complete 🌸💖. With lots of love, may I know your business name? 🌷" DO NOT skip this message for those names.
URL MATCH RULE: If the user shares the URL "https://www.naveedn.xyz/" or "https://www.naveedn.xyz/#", you MUST respond enthusiastically with: "That is our website!"
SEO ANALYSIS RULE: If the user asks if you can do SEO analysis or website analysis, clarify that you provide expert advice, strategies, and recommendations, but as an AI chat consultant, you cannot run automated technical SEO scanning tools on live websites.
Always: be friendly, professional, use simple language, answer clearly, encourage discussion, ask follow-up questions when necessary, be honest.
Never: be rude, argue, guess information, promise unrealistic results, guarantee Google rankings, claim unverifiable experience, provide false pricing, invent portfolio projects. Use HTML tags like <strong> for emphasis if needed.

[LEAD COLLECTION]
Collect: Name, Business Name, Business Type, Business Goals, Website URL, Challenges, Budget, Start Timeline, Email Address, Consultation Time.

[TONE OF VOICE]
Professional, friendly, helpful, consultative, confident, trustworthy, natural.

[GOAL]
Every visitor should leave with a clear understanding of available services, confidence in Naveed's expertise, a personalized recommendation, a booked free consultation, and a positive impression of the business.`
    }
  ];

  const splashScreen = document.getElementById('splashScreen');

  // --- Voice Mode State ---
  let isVoiceModeEnabled = false;
  const voiceToggleBtn = document.getElementById('voiceToggleBtn');
  const micBtn = document.getElementById('micBtn');

  // Initialize Speech Synthesis
  // (Speech Recognition removed per user request)

  // Toggle Voice Mode
  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener('click', () => {
      isVoiceModeEnabled = !isVoiceModeEnabled;
      if (isVoiceModeEnabled) {
        voiceToggleBtn.classList.add('active');
        voiceToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        // Unlock audio on iOS by playing silent sound immediately
        const utterance = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(utterance);
      } else {
        voiceToggleBtn.classList.remove('active');
        voiceToggleBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        window.speechSynthesis.cancel(); // Stop talking if currently talking
      }
    });
  }


  function speakText(text) {
    if (!isVoiceModeEnabled || !('speechSynthesis' in window)) return;
    
    // Clean text (remove html tags, stars, and emojis so the voice doesn't read out expressions)
    const cleanText = text.replace(/<[^>]*>?/gm, '')
                          .replace(/\*/g, '')
                          .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');
    
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Try to find a good female/professional voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || (v.lang === 'en-US' && v.name.includes('Female')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }

  // Ensure voices are loaded
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }

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

  // Skip splash screen based on URL param (from homepage showcase)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('skipSplash') === 'true') {
    splashScreen.style.display = 'none';
    splashScreen.style.opacity = '0';
    leadFormScreen.style.display = 'flex';
    leadFormScreen.style.opacity = '1';
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

  // Admin Login Logic
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminModal = document.getElementById('adminModal');
  const cancelAdminBtn = document.getElementById('cancelAdminBtn');
  const verifyAdminBtn = document.getElementById('verifyAdminBtn');
  const adminPin = document.getElementById('adminPin');

  if (adminLoginBtn && adminModal) {
    adminLoginBtn.addEventListener('click', () => {
      adminModal.style.display = 'flex';
      adminPin.value = '';
    });

    cancelAdminBtn.addEventListener('click', () => {
      adminModal.style.display = 'none';
    });

    verifyAdminBtn.addEventListener('click', () => {
      if (adminPin.value === '2421') {
        adminModal.style.display = 'none';
        // Bypass form directly to chat
        leadFormScreen.style.opacity = '0';
        setTimeout(() => {
          leadFormScreen.style.display = 'none';
          document.getElementById('emptyStateName').textContent = 'Admin Naveed';
          userData.name = 'Admin Naveed';
          
          chatContainer.style.display = 'flex';
          setTimeout(() => {
            chatContainer.style.opacity = '1';
            chatContainer.classList.add('show-drop');
          }, 50);
        }, 500);
      } else {
        alert("Incorrect PIN");
      }
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
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKoL4QFy5innXcEmcDY2RgIFiYHFBKOonSkSyChOp3Yjzt-pXSPnfjaJExCxDPyS0r/exec";
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
                    // We wait for the user to pick an option from the empty state
                  }, 50);
                }, 500);
              }, 2500); // 2.5 seconds wait for tick
            }, 50);
          }, 400); // Wait for form card to fade out
        });
    });
  }

  // Form Submit Handler
  chatForm.addEventListener('submit', async (e) => {
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
    
    // Attempt to guess user name if it's the very first message after empty state
    if (conversationHistory.length === 1 && !userData.name) {
      userData.name = message.trim();
    }

    // Check for email to send to Google Sheet
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailPattern.test(message)) {
      const leadEmail = message.match(emailPattern)[0];
      const leadName = userData.name || "Chat Lead";
      
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKoL4QFy5innXcEmcDY2RgIFiYHFBKOonSkSyChOp3Yjzt-pXSPnfjaJExCxDPyS0r/exec";
      fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadName,
            email: leadEmail,
            message: "Email captured directly from AI chat conversation"
          })
      }).catch(err => console.error("Error sending chat lead to sheet:", err));
    }

    // Add to history
    conversationHistory.push({ role: "user", content: message });

    // 2. Fetch AI Response
    await fetchExternalAI();
  });

  async function fetchExternalAI() {
    showTypingIndicator();
    
    try {
      // Securely proxy via the Google Apps Script to bypass CORS and hide API Key
      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKoL4QFy5innXcEmcDY2RgIFiYHFBKOonSkSyChOp3Yjzt-pXSPnfjaJExCxDPyS0r/exec";
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          // Using text/plain prevents the browser from sending an OPTIONS preflight request
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: "ai_chat",
          messages: conversationHistory
        })
      });

      const data = await response.json();
      removeTypingIndicator();

      if (data.choices && data.choices.length > 0) {
        let aiMessage = data.choices[0].message.content;
        conversationHistory.push({ role: "assistant", content: aiMessage });
        
        // Basic markdown parsing for best experience
        aiMessage = aiMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        aiMessage = aiMessage.replace(/\*(.*?)\*/g, '<em>$1</em>');
        aiMessage = aiMessage.replace(/\n/g, '<br>');
        
        addBotMessage(aiMessage);

        // Quick Reply Check: Do you currently have a website?
        const websiteQuestionPattern = /do you currently have a website/i;
        if (websiteQuestionPattern.test(aiMessage)) {
          showQuickReplies([
            { text: "Yes", value: "Yes, I have a website." },
            { text: "No", value: "No, I don't have a website yet." }
          ]);
        }
        
        // Quick Reply Check: Budget
        const budgetQuestionPattern = /\bbudget\b/i;
        if (budgetQuestionPattern.test(aiMessage)) {
          const sliderContainer = document.getElementById('budgetSliderContainer');
          if (sliderContainer) {
            sliderContainer.style.display = 'flex';
            scrollToBottom();
          }
        }

        // Check if user said goodbye to trigger chat closing animation
        const lastUserMsg = conversationHistory[conversationHistory.length - 2]?.content || "";
        const isSayingBye = /\b(bye|goodbye|see ya|see you|cya|later|quit|exit)\b/i.test(lastUserMsg);

        if (isSayingBye) {
          // SEND FINAL DATA TO SHEET
          sendFinalChatDataToSheet();
          
          setTimeout(() => {
            document.body.style.transition = 'opacity 0.8s ease';
            document.body.style.opacity = '0';
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 800);
          }, 2500);
        }
      } else {
        addBotMessage("I'm sorry, I encountered an issue. Could you please rephrase that?");
      }

    } catch (error) {
      console.error("AI Error:", error);
      removeTypingIndicator();
      addBotMessage("Sorry, I am currently experiencing technical difficulties connecting to my brain. Please try again later.");
    }
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
    
    // Speak response if voice mode is enabled
    speakText(text);
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

  function showQuickReplies(options) {
    const container = document.getElementById('quickReplyContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        chatInput.value = opt.value;
        chatForm.dispatchEvent(new Event('submit'));
        container.style.display = 'none';
      });
      container.appendChild(btn);
    });
    
    container.style.display = 'flex';
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // --- Budget Slider Logic ---
  const budgetRange = document.getElementById('budgetRange');
  const budgetAmount = document.getElementById('budgetAmount');
  const submitBudgetBtn = document.getElementById('submitBudgetBtn');
  const budgetSliderContainer = document.getElementById('budgetSliderContainer');

  if (budgetRange && budgetAmount) {
    budgetRange.addEventListener('input', function() {
      // Format number with commas
      const value = parseInt(this.value).toLocaleString('en-IN');
      budgetAmount.value = value + (this.value == 100000 ? '+' : '');
      
      // Calculate background fill percentage
      const min = this.min || 5000;
      const max = this.max || 100000;
      const percentage = ((this.value - min) / (max - min)) * 100;
      this.style.backgroundSize = percentage + '% 100%';
    });
    
    // Initialize slider background size
    budgetRange.dispatchEvent(new Event('input'));
  }
  
  if (submitBudgetBtn) {
    submitBudgetBtn.addEventListener('click', () => {
      const value = budgetAmount.value;
      budgetSliderContainer.style.display = 'none';
      chatInput.value = `My estimated budget is ₹${value}`;
      chatForm.dispatchEvent(new Event('submit'));
    });
  }

  // --- Final Data Sync ---
  function sendFinalChatDataToSheet() {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKoL4QFy5innXcEmcDY2RgIFiYHFBKOonSkSyChOp3Yjzt-pXSPnfjaJExCxDPyS0r/exec";
    
    const leadName = userData.name || "Unknown Guest";
    const isSpecialGuest = /^(manu|manaswini|jessi|sowmya)$/i.test(leadName.trim());
    
    // Extract full chat history only for special guests
    let fullChatText = "";
    if (isSpecialGuest) {
      fullChatText = "\n\n--- FULL CHAT HISTORY ---\n" + conversationHistory.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join("\n");
    }
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName,
          email: "Extracted in chat",
          message: `Chat Completed.\nBusiness Name & Budget are in the chat flow.${fullChatText}`
        })
    }).catch(err => console.error("Error sending final lead to sheet:", err));
  }

});
