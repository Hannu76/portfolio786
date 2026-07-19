document.addEventListener('DOMContentLoaded', () => {
    // Prevent horizontal scroll jumping on reload or widget initialization
    window.addEventListener('load', () => {
        if (window.scrollX > 0) {
            window.scrollTo(0, window.scrollY);
        }
        if (typeof AOS !== 'undefined') {
            AOS.refresh(); // Recalculate triggers when all images/fonts/videos are fully loaded
        }
    });
    window.addEventListener('resize', () => {
        if (typeof AOS !== 'undefined') {
            AOS.refresh(); // Recalculate triggers on orientation change / resize
        }
    });
    window.addEventListener('scroll', () => {
        if (window.scrollX > 0) {
            window.scrollTo(0, window.scrollY);
        }
    });

    // Hero Video Audio Autoplay Policy Handler
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // Subtitle Sync Controller (Digital Marketing, SEO Specialist, Web Developer)
        const subtitleEl = document.querySelector('.hero-video-subtitle');
        if (subtitleEl) {
            heroVideo.addEventListener('timeupdate', () => {
                const time = heroVideo.currentTime;
                let text = "";
                
                // 10s video duration split into 3 keywords
                if (time >= 0 && time < 3.5) {
                    text = "Digital Marketing Specialist";
                } else if (time >= 3.5 && time < 7.0) {
                    text = "SEO Strategist";
                } else {
                    text = "Web Designer";
                }
                
                if (subtitleEl.textContent !== text) {
                    subtitleEl.style.opacity = 0;
                    subtitleEl.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        subtitleEl.textContent = text;
                        subtitleEl.style.opacity = 1;
                        subtitleEl.style.transform = 'translateY(0)';
                    }, 200);
                }
            });
            // Initial transition show
            setTimeout(() => {
                subtitleEl.style.opacity = 1;
                subtitleEl.style.transform = 'translateY(0)';
            }, 500);
        }

        // Hero Video Load/Play Sequencing
        const triggerVideoReady = () => {
            if (!document.body.classList.contains('video-ready')) {
                document.body.classList.add('video-ready');
            }
        };

        // Trigger as soon as the video starts playing
        heroVideo.addEventListener('playing', triggerVideoReady);
        heroVideo.addEventListener('loadeddata', triggerVideoReady);
        heroVideo.addEventListener('canplay', triggerVideoReady);

        // Fallback: If video takes longer than 1.2s to load, trigger anyway to avoid stuck state
        setTimeout(triggerVideoReady, 1200);

        // Setup Audio Suggestion Bubble dismiss logic
        const audioSuggestion = document.getElementById('audioSuggestion');
        const closeSuggestion = document.getElementById('closeSuggestion');

        const dismissAudioSuggestion = () => {
            if (audioSuggestion && !audioSuggestion.classList.contains('fade-out')) {
                audioSuggestion.classList.add('fade-out');
                setTimeout(() => {
                    audioSuggestion.remove();
                }, 400);
            }
        };

        if (closeSuggestion) {
            closeSuggestion.addEventListener('click', (e) => {
                e.stopPropagation();
                dismissAudioSuggestion();
            });
        }

        // Show the audio suggestion bubble with a 1-second (1000ms) delay
        setTimeout(() => {
            if (audioSuggestion && heroVideo.muted && !audioSuggestion.classList.contains('fade-out')) {
                audioSuggestion.classList.add('show');
                // Automatically dismiss after 1 second (1000ms)
                setTimeout(() => {
                    dismissAudioSuggestion();
                }, 1000);
            }
        }, 1000);

        let wasMutedByUser = true; // Track user preference, default to muted/starts muted

        // Start muted to ensure the video plays instantly on all browsers without any block
        heroVideo.muted = true;
        heroVideo.play().then(() => {
            console.log("Video started playing muted instantly on load.");
            updateButtonState();
            setTimeout(triggerVideoReady, 100);
        }).catch(err => {
            console.log("Muted autoplay failed:", err);
            triggerVideoReady();
        });

        // Create a floating unmute control button
        const soundBtn = document.createElement('button');
        soundBtn.className = 'sound-toggle-btn';
        soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
        soundBtn.setAttribute('aria-label', 'Toggle Audio');
        
        // Add to the hero center media container
        const mediaContainer = document.querySelector('.hero-center-media');
        if (mediaContainer) {
            mediaContainer.appendChild(soundBtn);
        } else {
            document.body.appendChild(soundBtn);
        }

        const updateButtonState = () => {
            if (heroVideo.muted) {
                soundBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                soundBtn.classList.remove('playing');
            } else {
                soundBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                soundBtn.classList.add('playing');
            }
        };

        soundBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            heroVideo.muted = !heroVideo.muted;
            wasMutedByUser = heroVideo.muted;
            if (!heroVideo.muted) {
                heroVideo.play();
            }
            updateButtonState();
            dismissAudioSuggestion();
            cleanupInteractionListeners();
        });

        // Control loop count to exactly 3 times with a 2-second gap between plays
        let loopCount = 1;
        let isWaitingForNextPlay = false;

        heroVideo.addEventListener('ended', () => {
            if (loopCount < 3) {
                loopCount++;
                isWaitingForNextPlay = true;
                console.log(`Video completed play ${loopCount - 1} of 3. Waiting 2 seconds before play ${loopCount}...`);
                setTimeout(() => {
                    isWaitingForNextPlay = false;
                    heroVideo.currentTime = 0;
                    heroVideo.play().catch(err => console.log("Loop play failed:", err));
                }, 2000);
            } else {
                console.log("Video completed all 3 plays. Stopping.");
            }
        });

        // Hero section sound interactions (Single click anywhere in hero to unmute, double click to mute)
        const heroSectionElement = document.getElementById('home');
        if (heroSectionElement) {
            let heroClickTimeout;

            heroSectionElement.addEventListener('click', (e) => {
                // Ignore click events on links, buttons, close button, or soundBtn to avoid interfering with actions
                if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.suggestion-close') || e.target.closest('.sound-toggle-btn')) {
                    return;
                }
                
                e.stopPropagation();
                clearTimeout(heroClickTimeout);
                heroClickTimeout = setTimeout(() => {
                    if (heroVideo.muted) {
                        heroVideo.muted = false;
                        wasMutedByUser = false;
                        if (heroVideo.paused && loopCount <= 3) {
                            heroVideo.play().catch(err => console.log("Play failed:", err));
                        }
                        updateButtonState();
                        dismissAudioSuggestion();
                    }
                }, 250);
            });

            heroSectionElement.addEventListener('dblclick', (e) => {
                if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.suggestion-close') || e.target.closest('.sound-toggle-btn')) {
                    return;
                }
                
                e.stopPropagation();
                clearTimeout(heroClickTimeout); // Prevent single click action
                heroVideo.muted = true;
                wasMutedByUser = true;
                updateButtonState();
            });

            // Touchstart for mobile in hero section (single tap to unmute, double tap to mute)
            let heroLastTap = 0;
            heroSectionElement.addEventListener('touchstart', (e) => {
                if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.suggestion-close') || e.target.closest('.sound-toggle-btn')) {
                    return;
                }
                
                const currentTime = new Date().getTime();
                const tapLength = currentTime - heroLastTap;
                if (tapLength < 300 && tapLength > 0) {
                    e.stopPropagation();
                    e.preventDefault(); // Prevent default zoom
                    clearTimeout(heroClickTimeout); // Prevent single tap
                    heroVideo.muted = true;
                    wasMutedByUser = true;
                    updateButtonState();
                } else {
                    clearTimeout(heroClickTimeout);
                    heroClickTimeout = setTimeout(() => {
                        if (heroVideo.muted) {
                            heroVideo.muted = false;
                            wasMutedByUser = false;
                            if (heroVideo.paused && loopCount <= 3) {
                                heroVideo.play().catch(err => console.log("Play failed:", err));
                            }
                            updateButtonState();
                            dismissAudioSuggestion();
                        }
                    }, 250);
                }
                heroLastTap = currentTime;
            }, { passive: false });
        }

        updateButtonState(); // Initialize button state with correct muted/unmuted icon on load

        // Auto mute on scroll out of hero section, unmute on scroll back in
        const heroSection = document.getElementById('home');
        if (heroSection && typeof IntersectionObserver !== 'undefined') {
            const observerOptions = {
                root: null,
                threshold: 0.15 // trigger when at least 15% of the hero section is visible
            };

            const videoVisibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // User scrolled back into the hero section
                        if (!wasMutedByUser) {
                            heroVideo.muted = false;
                        }
                        if (!isWaitingForNextPlay && !heroVideo.ended && loopCount <= 3) {
                            heroVideo.play().catch(err => console.log(err));
                        }
                        updateButtonState();
                    } else {
                        // User scrolled away from the hero section (exiting home page)
                        heroVideo.muted = true;
                        heroVideo.pause(); // pause playback to save CPU when offscreen
                        updateButtonState();
                    }
                });
            }, observerOptions);

            videoVisibilityObserver.observe(heroSection);
        }
    }

    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 400, // Snappy, clean and fresh rising animations
            easing: 'ease-out-cubic', // Fresh and smooth easing
            offset: 20, // Snappy trigger offset to reveal elements earlier
            once: true, // Animates only once to prevent scrolling lag on mobile
            disable: false, // Enabled on mobile as requested
            disableMutationObserver: false // MUST be false so AOS watches layout changes and updates trigger offsets
        });
    }

    // Hamburger Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('active');
                
                // Toggle active state visually
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    // Contact Modal Logic
    const contactBtns = document.querySelectorAll('.callModalBtn');
    const modalBg = document.getElementById('contactModalBg');
    const closeBtn = document.getElementById('closeModalBtn');

    if (modalBg && closeBtn) {
        contactBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                modalBg.classList.add('active');
            });
        });

        closeBtn.addEventListener('click', () => {
            modalBg.classList.remove('active');
        });

        modalBg.addEventListener('click', (e) => {
            if (e.target === modalBg) {
                modalBg.classList.remove('active');
            }
        });
    }

    // --- Preloaded Sound Effects for Instant, Zero-Latency Playback ---
    const bookAudio = new Audio('sounds/BOOK.wav');
    bookAudio.preload = 'auto';
    const scfiAudio = new Audio('sounds/Scfi.wav');
    scfiAudio.preload = 'auto';
    const clickAudio = new Audio('sounds/click.wav');
    clickAudio.preload = 'auto';
    const mixkitAudio = new Audio('sounds/mixkit-fast-double-click-on-mouse-275.wav');
    mixkitAudio.preload = 'auto';

    const playBookConsultSound = () => {
        try {
            const sound = bookAudio.cloneNode();
            sound.play().catch(err => console.log('Book audio play blocked/failed:', err));
        } catch (e) {
            console.log('Error playing book audio:', e);
        }
    };

    const playHannuAiSound = () => {
        try {
            const sound = scfiAudio.cloneNode();
            sound.play().catch(err => console.log('Hannu AI audio play blocked/failed:', err));
        } catch (e) {
            console.log('Error playing Hannu AI audio:', e);
        }
    };

    const playViewWorkSound = () => {
        try {
            const sound = clickAudio.cloneNode();
            sound.play().catch(err => console.log('View work audio play blocked/failed:', err));
        } catch (e) {
            console.log('Error playing view work audio:', e);
        }
    };

    const playMixkitSound = () => {
        try {
            const sound = mixkitAudio.cloneNode();
            sound.play().catch(err => console.log('Mixkit audio play blocked/failed:', err));
        } catch (e) {
            console.log('Error playing mixkit audio:', e);
        }
    };

    // Global Pointerdown & Click Sound Delegation for Instant Synchronization
    const handleSoundTrigger = (e) => {
        // Exclude social media icon clicks (`.social-3d-btn`, `.social-icon-btn`, or social media links)
        if (e.target.closest('.social-3d-btn, .social-icon-btn, a[href*="linkedin.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="facebook.com"], a[href*="github.com"]')) {
            return;
        }

        const interactiveEl = e.target.closest('button, .button, .uiverse-ai-btn, .consultationModalBtn, .view-work-btn, .btn-card-explore, .project-3d-card, .Subscribe-btn, [role="button"]');
        if (!interactiveEl) return;

        // Exclude normal navigation items (Home, Services, etc.) and regular buttons per user request
        if (interactiveEl.closest('.nav-item, .hamburger-menu, .site-header')) {
            return;
        }

        // Strictly remove sound from Services Section ("Learn More" / exploration buttons)
        if (interactiveEl.closest('#services, .services-section, .services-grid, .services-sec')) {
            return;
        }

        const text = interactiveEl.textContent.toLowerCase();
        const href = interactiveEl.getAttribute('href') || '';
        const inContactSection = interactiveEl.closest('#contact, .contact-sec, .subscribe-box-outer');
        const inProjectsSection = interactiveEl.closest('#projects, .featured-project-sec, .projects-grid');
        const inHeroSection = interactiveEl.closest('#home, .hero, .hero-section');

        // 1. Hannu AI buttons
        if (interactiveEl.matches('#hannuAiBtn, .uiverse-ai-btn') || href.includes('hannu-ai.html') || text.includes("hannu's ai")) {
            playHannuAiSound();
        }
        // 2. Contact Section & Projects Section buttons & Subscribe button -> mixkit-fast-double-click-on-mouse-275.wav
        else if (inContactSection || inProjectsSection || interactiveEl.matches('.Subscribe-btn')) {
            playMixkitSound();
        }
        // 3. Hero Section & general Consultation buttons outside Contact/Projects -> BOOK.wav
        else if (inHeroSection || interactiveEl.matches('.consultationModalBtn, .book-call-btn') || text.includes('book') || text.includes('consult') || text.includes('inquire')) {
            playBookConsultSound();
        }
        // 4. Any standalone "View My Work" / "Explore Projects" outside Contact/Projects/Services -> mixkit sound
        else if (interactiveEl.matches('.view-work-btn, .btn-card-explore') || href === '#projects' || text.includes('view my work') || text.includes('view my project') || text.includes('view work') || text.includes('explore projects')) {
            playMixkitSound();
        }
    };

    document.body.addEventListener('pointerdown', (e) => {
        if (e.button !== undefined && e.button !== 0) return; // Only left click or touch
        handleSoundTrigger(e);
    });

    // Consultation Modal & Form Logic
    const consultationBtns = document.querySelectorAll('.consultationModalBtn');
    const consultModalBg = document.getElementById('consultationModalBg');
    const closeConsultBtn = document.getElementById('closeConsultationModalBtn');
    const consultForm = document.getElementById('consultationForm');
    const statusMsg = document.getElementById('formStatusMsg');

    if (consultModalBg && closeConsultBtn) {
        consultationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                consultModalBg.classList.add('active');
            });
        });

        closeConsultBtn.addEventListener('click', () => {
            consultModalBg.classList.remove('active');
        });

        consultModalBg.addEventListener('click', (e) => {
            if (e.target === consultModalBg) {
                consultModalBg.classList.remove('active');
            }
        });
    }

    if (consultForm) {
        consultForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = consultForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<span>Sending... <i class="fa-solid fa-spinner fa-spin"></i></span>';
            submitBtn.disabled = true;
            statusMsg.textContent = '';
            statusMsg.className = 'form-status-msg';

            // IMPORTANT: Replace this URL with your actual Google Apps Script Web App URL
            const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyE-x5OgTAygPEJL9WWrVsyFM8zZ9JST-eTHAebuIVdGR6aMdXmRXYeitRYtzOX8kpr/exec";

            const formData = {
                name: document.getElementById('consultName').value,
                phone: `(${document.getElementById('countryCode').value}) ${document.getElementById('consultPhone').value}`,
                message: "Purpose: " + document.getElementById('consultPurpose').value // Passing purpose as message for the Apps Script
            };

            try {
                if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
                    // For demonstration purposes, if URL is not set, we'll still show the success animation.
                    // If you want to throw an error instead, uncomment the next line:
                    // throw new Error("Please insert your Google Apps Script URL in script.js");
                } else {
                    const response = await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors', // standard approach for google forms/scripts to bypass CORS issues
                        cache: 'no-cache',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        redirect: 'follow',
                        body: JSON.stringify(formData)
                    });
                }

                // Show Success Layout
                const modalH2 = consultModalBg.querySelector('h2');
                const modalP = consultModalBg.querySelector('p');
                const successLayout = document.getElementById('successLayout');
                
                consultForm.style.display = 'none';
                if(modalH2) modalH2.style.display = 'none';
                if(modalP) modalP.style.display = 'none';
                successLayout.style.display = 'flex';

                consultForm.reset();
                
                setTimeout(() => {
                    // Close Modal
                    consultModalBg.classList.remove('active');
                    
                    // Reset View after close transition
                    setTimeout(() => {
                        consultForm.style.display = 'flex';
                        if(modalH2) modalH2.style.display = 'block';
                        if(modalP) modalP.style.display = 'block';
                        successLayout.style.display = 'none';
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }, 400);
                }, 3500); // Wait 3.5s to read the message and watch animation

            } catch (error) {
                statusMsg.textContent = error.message === "Please insert your Google Apps Script URL in script.js" ? error.message : 'Error sending request. Please try again.';
                statusMsg.classList.add('error');
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Smooth active navigation highlighting during scroll using IntersectionObserver (highly optimized)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-item');

    const observerOptions = {
        root: null,
        rootMargin: '-35% 0px -65% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 3D Project Cards active state toggle and direct navigation
    const projectCards = document.querySelectorAll('.project-3d-card');
    const projectsGrid = document.querySelector('.projects-grid');
    
    if (projectCards.length > 0) {
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                projectCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });

            // Ensure clicking the card or explore button instantly opens the external URL
            card.addEventListener('click', (e) => {
                const url = card.getAttribute('href');
                if (url && url !== '#') {
                    e.preventDefault();
                    window.open(url, '_blank');
                }
            });
        });
        
        if (projectsGrid) {
            projectsGrid.addEventListener('mouseleave', () => {
                projectCards.forEach(c => c.classList.remove('active'));
                // Default back to center card (Bitx Dashboard, index 2)
                if (projectCards[2]) {
                    projectCards[2].classList.add('active');
                }
            });
        }
    }

    // Initialize default active card for projects on page load
    if (projectCards.length > 0 && projectCards[2]) {
        projectCards[2].classList.add('active');
    }

    // 3D Services Cards active state toggle
    const blogCards = document.querySelectorAll('.blog-3d-card');
    const servicesGrid = document.querySelector('.services-grid');
    
    if (blogCards.length > 0) {
        // Initialize default active card for services on page load
        if (blogCards[1]) {
            blogCards[1].classList.add('active');
        }

        blogCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                blogCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
        
        if (servicesGrid) {
            servicesGrid.addEventListener('mouseleave', () => {
                blogCards.forEach(c => c.classList.remove('active'));
                // Default back to center card (Index 1)
                if (blogCards[1]) {
                    blogCards[1].classList.add('active');
                }
            });
        }
    }

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        } else {
          entry.target.classList.remove('animate-in');
        }
      });
    });
    
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroObserver.observe(heroSection);
    }

    // --- Chatbase Mobile Backdrop Logic ---
    const chatbaseBackdrop = document.createElement('div');
    chatbaseBackdrop.id = 'chatbase-backdrop';
    document.body.appendChild(chatbaseBackdrop);

    chatbaseBackdrop.addEventListener('click', () => {
        const btn = document.querySelector('#chatbase-bubble-button');
        if (btn) btn.click();
    });

    const observerChatbase = new MutationObserver((mutations) => {
        const chatbaseWindow = document.getElementById('chatbase-bubble-window') || document.querySelector('iframe[src*="chatbase.co"]');
        if (chatbaseWindow) {
            const enforceMobilePopup = () => {
                if(window.innerWidth <= 768) {
                    // Chatbase desktop UI has a min-height and min-width. If we shrink the iframe below that, it clips.
                    // Solution: Give the iframe a fixed desktop-like size, then visually scale it down.
                    const targetWidth = 380;
                    const targetHeight = 650;
                    const scaleX = (window.innerWidth * 0.9) / targetWidth;
                    const scaleY = (window.innerHeight * 0.75) / targetHeight;
                    const scale = Math.min(scaleX, scaleY, 1);

                    chatbaseWindow.style.setProperty('position', 'fixed', 'important');
                    chatbaseWindow.style.setProperty('width', targetWidth + 'px', 'important');
                    chatbaseWindow.style.setProperty('height', targetHeight + 'px', 'important');
                    chatbaseWindow.style.setProperty('max-width', 'none', 'important');
                    chatbaseWindow.style.setProperty('max-height', 'none', 'important');
                    chatbaseWindow.style.setProperty('min-width', targetWidth + 'px', 'important');
                    chatbaseWindow.style.setProperty('min-height', targetHeight + 'px', 'important');
                    chatbaseWindow.style.setProperty('bottom', '85px', 'important');
                    chatbaseWindow.style.setProperty('right', '5vw', 'important');
                    chatbaseWindow.style.setProperty('top', 'auto', 'important');
                    chatbaseWindow.style.setProperty('left', 'auto', 'important');
                    chatbaseWindow.style.setProperty('background', 'transparent', 'important');
                    chatbaseWindow.style.setProperty('border', 'none', 'important');
                    chatbaseWindow.style.setProperty('box-shadow', 'none', 'important');
                    chatbaseWindow.style.setProperty('margin', '0', 'important');
                    chatbaseWindow.style.setProperty('transform-origin', 'bottom right', 'important');
                    chatbaseWindow.style.setProperty('transform', `scale(${scale})`, 'important');
                }
            };

            const styleObserver = new MutationObserver(() => {
                const opacity = chatbaseWindow.style.opacity;
                const display = chatbaseWindow.style.display;
                const pointerEvents = window.getComputedStyle(chatbaseWindow).pointerEvents;
                
                // If it's not explicitly hidden or invisible
                if (display !== 'none' && opacity !== '0' && pointerEvents !== 'none') {
                     chatbaseBackdrop.classList.add('active');
                     enforceMobilePopup();
                     if(window.innerWidth <= 768) {
                         document.body.style.overflow = 'hidden';
                     }
                } else {
                     chatbaseBackdrop.classList.remove('active');
                     document.body.style.overflow = '';
                     chatbaseWindow.style.setProperty('transform', 'none', 'important');
                }
            });
            styleObserver.observe(chatbaseWindow, { attributes: true, attributeFilter: ['style', 'class'] });
            observerChatbase.disconnect();
        }
    });
    observerChatbase.observe(document.body, { childList: true, subtree: true });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-text').forEach(el => revealObserver.observe(el));

  // --- Smart Sticky Header Logic ---
  const header = document.querySelector('.site-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (!header) return;
    
    // Keep visible if near the top
    if (window.scrollY < 100) {
      header.classList.remove('header-hidden');
      lastScrollY = window.scrollY;
      return;
    }

    // Hide on scroll down, show on scroll up
    if (window.scrollY > lastScrollY) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }
    
    lastScrollY = window.scrollY;
  });

  // --- Below-the-fold Lazy Loading Videos ---
  if (typeof IntersectionObserver !== 'undefined') {
    const lazyVideoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          if (video.dataset.src) {
            video.src = video.dataset.src;
            video.removeAttribute('data-src');
            video.load();
          }
          video.play().catch(err => console.log("Lazy video play failed:", err));
          observer.unobserve(video);
        }
      });
    }, {
      rootMargin: "200px 0px"
    });

    document.querySelectorAll('video.lazy-video').forEach(video => {
      lazyVideoObserver.observe(video);
    });
  } else {
    // Fallback for browsers without IntersectionObserver support
    document.querySelectorAll('video.lazy-video').forEach(video => {
      if (video.dataset.src) {
        video.src = video.dataset.src;
        video.removeAttribute('data-src');
        video.load();
      }
      video.play().catch(err => console.log("Fallback video play failed:", err));
    });
  }

  // --- Header Video lazy load on window load event ---
  window.addEventListener('load', () => {
    const headerVideo = document.querySelector('video.lazy-header-video');
    if (headerVideo && headerVideo.dataset.src) {
      headerVideo.src = headerVideo.dataset.src;
      headerVideo.removeAttribute('data-src');
      headerVideo.load();
      headerVideo.play().catch(err => console.log("Header video play failed:", err));
    }
  });

  // --- Premium Contact Section Mouse Parallax & Cursor Glow ---
  const contactSection = document.getElementById('contact');
  const cursorGlow = document.getElementById('contactCursorGlow');
  const parallaxItems = document.querySelectorAll('.contact-parallax-item');

  if (contactSection) {
    contactSection.addEventListener('mousemove', (e) => {
      const rect = contactSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Position the cursor glow
      if (cursorGlow) {
        cursorGlow.style.left = `${x}px`;
        cursorGlow.style.top = `${y}px`;
        cursorGlow.style.opacity = '1';
      }

      // Parallax effect on cards, illustration, and floating icons
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const moveX = (e.clientX - (rect.left + centerX)) / centerX; // Normalized value between -1 and 1
      const moveY = (e.clientY - (rect.top + centerY)) / centerY; // Normalized value between -1 and 1

      parallaxItems.forEach(item => {
        const speed = parseFloat(item.getAttribute('data-speed')) || 0.05;
        const xOffset = moveX * speed * 120; // Scale up speed
        const yOffset = moveY * speed * 120;

        item.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
      });
    });

    contactSection.addEventListener('mouseleave', () => {
      if (cursorGlow) {
        cursorGlow.style.opacity = '0';
      }

      parallaxItems.forEach(item => {
        // Reset position on leave smoothly
        item.style.transform = 'translate3d(0px, 0px, 0px)';
        item.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

        // After the transition ends, clear inline styles so CSS floating animations resume
        setTimeout(() => {
          const isHovered = contactSection.matches(':hover');
          if (!isHovered) {
            item.style.transform = '';
            item.style.transition = '';
          }
        }, 800);
      });
    });

    contactSection.addEventListener('mouseenter', () => {
      parallaxItems.forEach(item => {
        // Remove transitions so moving feels immediate and interactive
        item.style.transition = 'none';
      });
    });
  }

  // --- Email Subscribe Box Google Sheet Integration & Live Validation ---
  const subscribeInput = document.querySelector('.input-wrapper .input');
  const subscribeBtn = document.querySelector('.Subscribe-btn');

  if (subscribeInput && subscribeBtn) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    subscribeInput.addEventListener('input', () => {
      const email = subscribeInput.value.trim();

      if (!email) {
        subscribeBtn.textContent = 'Subscribe';
        subscribeBtn.classList.remove('btn-valid', 'btn-invalid');
        subscribeBtn.style.backgroundColor = '';
        subscribeBtn.style.color = '';
        return;
      }

      if (!emailRegex.test(email)) {
        subscribeBtn.textContent = 'Invalid Mail';
        subscribeBtn.classList.remove('btn-valid');
        subscribeBtn.classList.add('btn-invalid');
      } else {
        subscribeBtn.textContent = 'Ready ✓';
        subscribeBtn.classList.remove('btn-invalid');
        subscribeBtn.classList.add('btn-valid');
      }
    });

    const handleSubscribe = async () => {
      const email = subscribeInput.value.trim();
      if (!email || !emailRegex.test(email)) {
        subscribeInput.style.border = '1px solid #FF4B4B';
        subscribeBtn.textContent = 'Invalid Mail';
        subscribeBtn.classList.remove('btn-valid');
        subscribeBtn.classList.add('btn-invalid');
        return;
      }

      subscribeInput.style.border = 'none';
      const originalText = 'Subscribe';
      subscribeBtn.textContent = 'Subscribing...';
      subscribeBtn.style.backgroundColor = '#3b82f6';
      subscribeBtn.style.color = '#ffffff';
      subscribeBtn.disabled = true;

      const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyKoL4QFy5innXcEmcDY2RgIFiYHFBKOonSkSyChOp3Yjzt-pXSPnfjaJExCxDPyS0r/exec";

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: "Newsletter Subscriber",
            email: email,
            phone: email,
            message: `New Subscriber Email: ${email}`
          })
        });

        subscribeBtn.textContent = 'Subscribed ✓';
        subscribeBtn.classList.remove('btn-invalid');
        subscribeBtn.classList.add('btn-valid');
        subscribeInput.value = '';

        setTimeout(() => {
          subscribeBtn.textContent = originalText;
          subscribeBtn.classList.remove('btn-valid', 'btn-invalid');
          subscribeBtn.style.backgroundColor = '';
          subscribeBtn.style.color = '';
          subscribeBtn.disabled = false;
        }, 3500);
      } catch (err) {
        console.error('Subscribe Error:', err);
        subscribeBtn.textContent = originalText;
        subscribeBtn.disabled = false;
      }
    };

    subscribeBtn.addEventListener('click', handleSubscribe);
    subscribeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubscribe();
      }
    });
  }



  // --- Section Rise-Up & Line-by-Line Text Reveals ---
  const riseSections = document.querySelectorAll('section, .about-stats-grid, .projects-grid, .services-grid');
  riseSections.forEach(sec => sec.classList.add('section-rise-up'));

  if (typeof IntersectionObserver !== 'undefined') {
    const riseObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    riseSections.forEach(sec => riseObserver.observe(sec));

    // Line/text reveals
    const lineElements = document.querySelectorAll('.hero-title, .hero-subheadline, .about-heading, .services-sec-title, .project-sec-title');
    lineElements.forEach(el => el.classList.add('line-reveal'));

    const lineObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    lineElements.forEach(el => lineObserver.observe(el));
  } else {
    riseSections.forEach(sec => sec.classList.add('revealed'));
    document.querySelectorAll('.line-reveal').forEach(el => el.classList.add('revealed'));
  }
});

