document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 500, // Snappier animations
            offset: 80,
            once: true, // Animates only once to prevent scrolling lag
            disable: 'mobile', // Disable on mobile devices for smooth native scroll performance
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



});
