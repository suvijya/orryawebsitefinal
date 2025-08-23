// JavaScript for Orrya Website - 3D Animations and Interactions

// Global variables
let scene, camera, renderer, particles, approachScene, contactScene;
let isLoading = true;
let currentTestimonial = 0;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initLoader();
    initNavigation();
    initHero3D();
    initCaseButtons();
    // initApproach3D(); // This is now handled by CSS
    initContact3D();
    initAnimations();
    initTestimonials();
    initContactForm();
    initThemeToggle();
    initScrollEffects();
    
    // Start the loading sequence
    startLoadingSequence();
});

// Loading Sequence
function startLoadingSequence() {
    const loader = document.getElementById('loader');
    
    // Animate the words appearing one by one
    const originalWords = document.querySelectorAll('.text-line.original .word');
    const transformedLine = document.querySelector('.text-line.transformed');
    const transformedWords = document.querySelectorAll('.text-line.transformed .word.new');
    
    // Timeline for the loading animation
    const tl = gsap.timeline();
    // Animate original words appearing quickly, avoid extra pauses
    tl.to(originalWords, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.45,
        stagger: 0.12,
        ease: 'back.out(1.4)'
    })
    // Fade out original line and show transformed line with tighter timings
    .to('.text-line.original', {
        opacity: 0.35,
        duration: 0.25
    })
    .to(transformedLine, {
        opacity: 1,
        duration: 0.18
    }, '-=0.18')
    .to(transformedWords, {
        opacity: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.06,
        ease: 'power2.out'
    }, '-=0.12')
    // Immediately fade out the entire loader (faster)
    .to(loader, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        onComplete: function() {
            loader.style.display = 'none';
            isLoading = false;
            startHeroAnimations();
        }
    });
}

function initLoader() {
    // Set initial states for the loading animation
    gsap.set('.text-line.original .word', { 
        opacity: 0, 
        y: 50, 
        rotationX: 90 
    });
    gsap.set('.text-line.transformed', { 
        opacity: 0 
    });
    gsap.set('.text-line.transformed .word.new', { 
        opacity: 0, 
        y: 30 
    });
}

// Navigation
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.nav-hamburger');
    const mobileNav = document.querySelector('.nav-mobile');
    const body = document.body;
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile navigation toggle
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileNav.classList.toggle('active');
            body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close mobile nav when clicking on a link
        const mobileNavLinks = mobileNav.querySelectorAll('.nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('active');
                body.style.overflow = '';
            });
        });
        
        // Close mobile nav when clicking outside
        mobileNav.addEventListener('click', (e) => {
            if (e.target === mobileNav) {
                hamburger.classList.remove('active');
                mobileNav.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || '';
            // If link is a pure hash (#id) -> smooth scroll on the same page
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    gsap.to(window, {
                        duration: 1,
                        scrollTo: { y: targetSection, offsetY: 80 },
                        ease: 'power2.inOut'
                    });
                }
                return;
            }

            // If the link contains a hash but is a path (e.g., index.html#contact) and
            // the current page path matches, handle it as an in-page scroll.
            const hashIndex = href.indexOf('#');
            if (hashIndex > -1) {
                const pathPart = href.substring(0, hashIndex);
                const hashPart = href.substring(hashIndex + 1);
                const currentPath = window.location.pathname.split('/').pop() || 'index.html';
                const linkPath = pathPart.split('/').pop() || '';

                if (linkPath === '' || linkPath === currentPath) {
                    // same document - prevent default and smooth scroll
                    e.preventDefault();
                    const targetSection = document.getElementById(hashPart);
                    if (targetSection) {
                        gsap.to(window, {
                            duration: 1,
                            scrollTo: { y: targetSection, offsetY: 80 },
                            ease: 'power2.inOut'
                        });
                    }
                    return;
                }
                // otherwise let the browser load the other page (do not preventDefault)
            }
            // Otherwise allow normal navigation (do not preventDefault)
        });
    });
}

// Ensure case study buttons work as expected
function initCaseButtons() {
    // Select buttons in case cards
    const buttons = document.querySelectorAll('.case-actions a, .case-card .cta-primary, .case-card .cta-secondary');

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href');
            if (!href) return;

            // If it's a same-page anchor, smooth scroll
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    gsap.to(window, { duration: 1, scrollTo: { y: target, offsetY: 80 }, ease: 'power2.inOut' });
                }
                return;
            }

            // For relative links or external pages, allow navigation but ensure default isn't blocked
            // Use location.assign so it works even if other handlers call preventDefault
            e.preventDefault();
            window.location.assign(href);
        });
    });
}

// Hero 3D Background
function initHero3D() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Particle system
    createParticleSystem();
    
    // Floating geometric shapes
    createFloatingShapes();
    
    // Camera position
    camera.position.z = 5;
    
    // Mouse movement effect
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Animation loop
    function animateHero() {
        requestAnimationFrame(animateHero);
        
        if (particles) {
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.0005;
        }
        
        // Update floating shapes
        scene.children.forEach((child, index) => {
            if (child.userData.isFloating) {
                child.rotation.x += 0.01;
                child.rotation.y += 0.005;
                child.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;
            }
        });
        
        // Camera movement based on mouse
        camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
    }
    
    animateHero();
    
    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function createParticleSystem() {
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color(0x4CAF50);
    const color2 = new THREE.Color(0x2196F3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        
        const mixedColor = color1.clone().lerp(color2, Math.random());
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function createFloatingShapes() {
    const shapes = [
        new THREE.TetrahedronGeometry(0.3, 0),
        new THREE.OctahedronGeometry(0.25, 0),
        new THREE.IcosahedronGeometry(0.2, 0),
        new THREE.DodecahedronGeometry(0.15, 0)
    ];
    
    const material = new THREE.MeshBasicMaterial({
        color: 0x4CAF50,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    for (let i = 0; i < 8; i++) {
        const geometry = shapes[Math.floor(Math.random() * shapes.length)];
        const mesh = new THREE.Mesh(geometry, material.clone());
        
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 5
        );
        
        mesh.userData.isFloating = true;
        scene.add(mesh);
    }
}



// Approach 3D Scene is removed and replaced by a CSS gradient.
// The related functions initApproach3D, createApproachParticleSystem, 
// and createApproachFloatingShapes can be deleted.
// Contact 3D Background
function initContact3D() {
    const canvas = document.getElementById('contactCanvas');
    if (!canvas) return;
    
    contactScene = new THREE.Scene();
    const contactCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const contactRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    contactRenderer.setSize(window.innerWidth, window.innerHeight);
    contactRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create flowing particles
    createFlowingParticles(contactScene);
    
    contactCamera.position.z = 5;

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    function animateContact() {
        requestAnimationFrame(animateContact);
        
        contactScene.children.forEach((child) => {
            if (child.userData.isFlowing) {
                child.rotation.z += 0.005;
                
                const positions = child.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.001;
                }
                child.geometry.attributes.position.needsUpdate = true;
            }
        });

        // Rotate scene based on mouse
        contactScene.rotation.y += (mouseX * 0.5 - contactScene.rotation.y) * 0.05;
        contactScene.rotation.x += (-mouseY * 0.5 - contactScene.rotation.x) * 0.05;
        
        contactRenderer.render(contactScene, contactCamera);
    }
    
    animateContact();
}

function createFlowingParticles(scene) {
    const particleCount = 800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x4CAF50,
        size: 0.03,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    particles.userData.isFlowing = true;
    scene.add(particles);
}

// Hero Animations
function startHeroAnimations() {
    // Animate hero tagline
    gsap.timeline()
        .from('.hero-tagline .tagline-word', {
            opacity: 0,
            y: 30,
            rotationX: 90,
            duration: 0.8,
            stagger: 0.2,
            ease: 'back.out(1.7)'
        })
        .from('.tagline-dots', { opacity: 0, scale: 0, duration: 0.5, ease: 'bounce.out' }, '-=0.2')
        .to('.tagline-container', { opacity: 0.3, duration: 0.5 }, '+=1')
        .from('.tagline-transform .tagline-word-new', {
            opacity: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
}

// Scroll Triggered Animations
function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero parallax
    gsap.to('.hero-content', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        },
    });

    // Section animations - stagger effect for section elements
    const sections = document.querySelectorAll('section:not(.hero)');
    
    sections.forEach((section) => {
        const sectionElements = section.querySelectorAll('.section-header, .section-tag, .section-title, .section-subtitle');
        
        gsap.fromTo(sectionElements, {
            opacity: 0,
            y: 60,
            scale: 0.95
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 50%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Services cards animation
    gsap.fromTo('.service-card', {
        opacity: 0,
        y: 80,
        rotationX: 45
    }, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    // Approach principles animation
    gsap.fromTo('.principle', {
        opacity: 0,
        x: -60
    }, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.approach-principles',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Case studies animation
    gsap.fromTo('.case-card', {
        opacity: 0,
        y: 60,
        scale: 0.9
    }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.2,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: '.cases-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    // About advantages animation
    gsap.fromTo('.advantage', {
        opacity: 0,
        x: -50
    }, {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.about-advantages',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Team showcase animation
    gsap.fromTo('.showcase-item', {
        opacity: 0,
        scale: 0.8,
        y: 30
    }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: '.team-showcase',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Testimonials animation
    gsap.fromTo('.testimonial-card.active', {
        opacity: 0,
        scale: 0.9
    }, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.testimonials',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Contact form animation
    gsap.fromTo('.contact-form .form-group', {
        opacity: 0,
        y: 30
    }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.contact-form',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Contact methods animation
    gsap.fromTo('.contact-method', {
        opacity: 0,
        x: -40
    }, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.contact-methods',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    // Footer animation
    gsap.fromTo('.footer-content > *', {
        opacity: 0,
        y: 30
    }, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.footer',
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        }
    });

    // Parallax effect for approach section background
    gsap.to('.approach', {
        backgroundPosition: '50% 100%',
        ease: 'none',
        scrollTrigger: {
            trigger: '.approach',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });
}

// 3D Tilt Effect for Cards
function init3DTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            gsap.to(element, {
                duration: 0.3,
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1000,
                ease: 'power2.out'
            });
        });
        
        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                duration: 0.3,
                rotationX: 0,
                rotationY: 0,
                ease: 'power2.out'
            });
        });
    });
}

// Testimonials Slider
function initTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.nav-dot');
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showTestimonial(index);
        });
    });
    
    // Auto-advance testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
}

function showTestimonial(index) {
    const testimonials = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.nav-dot');
    
    testimonials.forEach(testimonial => testimonial.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    testimonials[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentTestimonial = index;
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('formSuccess');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Include service in message if selected
        if (data.service) {
            data.message = `Service Interest: ${data.service}\n\n${data.message}`;
        }
        
        // Animate button loading state
        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send to MySQL backend API
            const response = await fetch('http://localhost:3001/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    company: data.company || null,
                    phone: data.phone || null,
                    service: data.service || null,
                    message: data.message
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Show success message
                form.style.display = 'none';
                successMessage.classList.add('show');
                
                // Reset form after delay
                setTimeout(() => {
                    form.style.display = 'block';
                    successMessage.classList.remove('show');
                    form.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 5000);
            } else {
                // Handle validation errors
                throw new Error(result.error || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Show error to user
            alert(`Error: ${error.message}. Please try again or contact us directly.`);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Remove the old simulateFormSubmission function as it's no longer needed

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const body = document.body;
    
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        
        // Update icons for both toggles
        const desktopIcon = themeToggle?.querySelector('i');
        const mobileIcon = mobileThemeToggle?.querySelector('i');
        const iconClass = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        
        if (desktopIcon) desktopIcon.className = iconClass;
        if (mobileIcon) mobileIcon.className = iconClass;
        
        // Store preference
        localStorage.setItem('theme', newTheme);
    }
    
    // Add event listeners to both toggle buttons
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    
    // Set initial icons
    const iconClass = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    const desktopIcon = themeToggle?.querySelector('i');
    const mobileIcon = mobileThemeToggle?.querySelector('i');
    
    if (desktopIcon) desktopIcon.className = iconClass;
    if (mobileIcon) mobileIcon.className = iconClass;
}

// Scroll Effects
function initScrollEffects() {
    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onToggle: self => {
                if (self.isActive) {
                    const currentId = section.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${currentId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            }
        });
    });
}

// CTA Button Interactions
document.addEventListener('DOMContentLoaded', () => {
    const reimagineBtn = document.getElementById('reimagineBtn');
    const viewWorkBtn = document.getElementById('viewWorkBtn');
    
    if (reimagineBtn) {
        reimagineBtn.addEventListener('click', () => {
            gsap.to(window, {
                duration: 1,
                scrollTo: { y: '#contact', offsetY: 80 },
                ease: 'power2.inOut'
            });
        });
    }
    
    // Note: viewWorkBtn is now a link to pitchDeckHub/indexpitch.html
    // No JavaScript event handler needed as it uses native navigation
    
    // Initialize 3D tilt effects after DOM is ready
    setTimeout(() => {
        init3DTilt();
    }, 1000);
});



// Performance optimization - pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy animations
        if (renderer) renderer.setAnimationLoop(null);
    } else {
        // Resume animations
        if (renderer && scene) {
            function animate() {
                requestAnimationFrame(animate);
                renderer.render(scene, camera);
            }
            animate();
        }
    }
});
