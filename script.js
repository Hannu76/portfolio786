document.addEventListener('DOMContentLoaded', () => {
    // Prevent horizontal scroll jumping on reload or widget initialization
    window.addEventListener('load', () => {
        if (window.scrollX > 0) {
            window.scrollTo(0, window.scrollY);
        }
    });
    window.addEventListener('scroll', () => {
        if (window.scrollX > 0) {
            window.scrollTo(0, window.scrollY);
        }
    });

    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 500, // Snappy, clean and fresh rising animations
            easing: 'ease-out-cubic', // Fresh and smooth easing
            offset: 0, // Trigger immediately without waiting or leaving white screen lag on mobile/desktop
            once: true, // Animates only once to prevent scrolling lag on mobile
            disable: false, // Enabled on mobile as requested
            disableMutationObserver: true // Avoid mutation observer performance overhead
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
});

