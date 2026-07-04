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

        // Control loop count to exactly 3 times
        let loopCount = 1;
        heroVideo.addEventListener('ended', () => {
            loopCount++;
            if (loopCount <= 3) {
                console.log(`Video playing iteration ${loopCount} of 3`);
                heroVideo.play().catch(err => console.log("Loop play failed:", err));
            } else {
                console.log("Video completed 3 loops. Stopping.");
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
                        heroVideo.play().catch(err => console.log(err));
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
});

