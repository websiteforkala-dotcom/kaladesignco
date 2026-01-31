/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║                                                           ║
 * ║   KALA DESIGN CO.                                         ║
 * ║   Built with ♥ by Kawaki Studios                          ║
 * ║   https://kawakistudios.com                               ║
 * ║                                                           ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

// Console Branding
console.log(
  '%c KAWAKI STUDIOS ',
  'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;'
);
console.log(
  '%c Built with ♥ by Kawaki Studios | kawakistudios.com ',
  'color: #666; font-size: 12px; font-family: monospace;'
);
console.log('%c─────────────────────────────────────────', 'color: #ddd;');

document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on a mobile device
  const isMobile = window.innerWidth <= 768;
  const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

  CustomEase.create(
    "hop",
    "M0,0 C0.355,0.022 0.448,0.079 0.5,0.5 0.542,0.846 0.615,1 1,1 "
  );

  CustomEase.create(
    "hop2",
    "M0,0 C0.078,0.617 0.114,0.716 0.255,0.828 0.373,0.922 0.561,1 1,1 "
  );

  const splitH2 = new SplitType(".site-info h2", {
    types: "lines",
  });

  splitH2.lines.forEach((line) => {
    const text = line.textContent;
    const wrapper = document.createElement("div");
    wrapper.className = "line";
    const span = document.createElement("span");
    span.textContent = text;
    wrapper.appendChild(span);
    line.parentNode.replaceChild(wrapper, line);
  });

  const mainTl = gsap.timeline();
  const revealerTl = gsap.timeline();
  const scaleTl = gsap.timeline();

  // Adjust animation durations for mobile
  const revealDuration = isMobile ? 1.2 : 1.5;
  const scaleDuration = isMobile ? 1.5 : 2;
  const flipDuration = isMobile ? 1.5 : 2;

  revealerTl
    .to(".r-1", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: revealDuration,
      ease: "hop",
    })
    .to(
      ".r-2",
      {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: revealDuration,
        ease: "hop",
      },
      "<"
    );

  scaleTl.to(".img:first-child", {
    scale: 1,
    duration: scaleDuration,
    ease: "power4.inOut",
  });

  const images = document.querySelectorAll(".img:not(:first-child)");

  images.forEach((img, index) => {
    scaleTl.to(
      img,
      {
        opacity: 1,
        scale: 1,
        duration: isMobile ? 1 : 1.25,
        ease: "power3.out",
      },
      ">-0.95"
    );
  });

  mainTl
    .add(revealerTl)
    .add(scaleTl, "-=1.25")
    .add(() => {
      document
        .querySelectorAll(".img:not(.main)")
        .forEach((img) => img.remove());

      const state = Flip.getState(".main");

      const imagesContainer = document.querySelector(".images");
      imagesContainer.classList.add("stacked-container");

      document.querySelectorAll(".main").forEach((img, i) => {
        img.classList.add("stacked");
        img.style.order = i;
        gsap.set(".img.stacked", {
          clearProps: "transform,top,left",
        });
      });

      return Flip.from(state, {
        duration: flipDuration,
        ease: "hop",
        absolute: true,
        stagger: {
          amount: isMobile ? -0.2 : -0.3,
        },
      });
    })
    .to(".word h1, .nav-item p, .line p, .site-info h2 .line span", {
      y: 0,
      duration: isMobile ? 2 : 3,
      ease: "hop2",
      stagger: isMobile ? 0.05 : 0.1,
      delay: isMobile ? 1 : 1.25,
    })
    .to(".team-img", {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)",
      duration: flipDuration,
      ease: "hop",
      delay: isMobile ? -3.5 : -4.75,
    });

  // Scroll Trigger for Color Change
  gsap.registerPlugin(ScrollTrigger);

  const ctaSection = document.querySelector(".cta-section");
  if (ctaSection) {
    ScrollTrigger.create({
      trigger: ".cta-section",
      start: "top center",
      end: "bottom center",
      toggleActions: "play reverse play reverse",
      onEnter: () => {
        gsap.to("body", { backgroundColor: "#111", color: "#fff", duration: 0.5 });
        gsap.to(".cta-section h2, .cta-section p, .cta-section a", { color: "#fff", borderColor: "#fff", duration: 0.5 });
      },
      onLeaveBack: () => {
        gsap.to("body", { backgroundColor: "#f4f4f4", color: "#111", duration: 0.5 });
        gsap.to(".cta-section h2, .cta-section p", { color: "#111", duration: 0.5 });
        gsap.to(".cta-section a", { color: "#fff", borderColor: "transparent", duration: 0.5 }); // Adjust btn color if needed
      }
    });
  }

  // Helper: Check mobile
  // const isMobile = window.innerWidth <= 768; // Already declared at the top

  // Bento Gallery Animation
  const createBentoTween = () => {
    let galleryElement = document.querySelector("#gallery-8");
    if (!galleryElement) return;

    // Disable on mobile
    if (window.innerWidth <= 768) {
      galleryElement.classList.remove("gallery--bento"); // Optional: if you want just stack
      return;
    }

    let galleryItems = galleryElement.querySelectorAll(".gallery__item");

    // Revert context if exists
    if (window.flipCtx) window.flipCtx.revert();

    galleryElement.classList.remove("gallery--final");

    window.flipCtx = gsap.context(() => {
      // Temporarily add final class to capture state
      galleryElement.classList.add("gallery--final");
      const flipState = Flip.getState(galleryItems);
      galleryElement.classList.remove("gallery--final");

      const flip = Flip.to(flipState, {
        simple: true,
        ease: "expoScale(1, 5)",
        duration: 1 // dummy duration, controlled by scrub
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryElement,
          start: "center center",
          end: "+=100%",
          scrub: true,
          pin: galleryElement.parentNode
        }
      });
      tl.add(flip);
    });
  };

  // Only init Bento on Desktop
  if (!isMobile) createBentoTween();

  // ... (previous code)

  // ===========================================
  // 1. HORIZONTAL SCROLL (Work Section)
  // ===========================================
  const workSection = document.querySelector(".work-section");
  if (workSection && !isMobile) {
    const container = document.querySelector(".work-container");

    gsap.to(container, {
      x: () => -(container.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: ".work-section",
        pin: true,
        scrub: 1,
        end: () => "+=" + container.scrollWidth,
        invalidateOnRefresh: true,
      }
    });

    // Active State for Items
    const workItems = document.querySelectorAll(".work-item");
    workItems.forEach((item, i) => {
      ScrollTrigger.create({
        trigger: item,
        containerAnimation: gsap.getTweensOf(container)[0],
        start: "left center",
        end: "right center",
        toggleClass: { targets: item, className: "active" },
      });
    });
  }

  // ===========================================
  // 2. STACKING CARDS (Services Section)
  // ===========================================
  const servicesSection = document.querySelector(".services-section");
  if (servicesSection && !isMobile) {
    const cards = document.querySelectorAll(".service-card-stack");

    cards.forEach((card, index) => {
      // 1. PINNING REMOVED - Relying on CSS position: sticky
      // ScrollTrigger.create({
      //   trigger: card,
      //   start: "top top+=100",
      //   end: "bottom top",
      //   pin: true,
      //   pinSpacing: false,
      //   id: `card-${index}`
      // });

      // 2. SCALING PREVIOUS CARD (Depth Effect)
      // As this card scrolls in, scale down the previous card
      if (index > 0) {
        const prevCard = cards[index - 1];

        gsap.to(prevCard, {
          scale: 0.95,
          filter: "brightness(0.9)",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "top top+=100",
            scrub: true
          }
        });
      }
    });
  }

  // ===========================================
  // 3. DARK MODE TRIGGER (CTA Section)
  // ===========================================
  const ctaDark = document.querySelector(".cta-dark-mode");
  if (ctaDark) {
    ScrollTrigger.create({
      trigger: ".cta-dark-mode",
      start: "top center",
      end: "bottom center",
      onEnter: () => document.body.classList.add("dark-mode-active"),
      onLeaveBack: () => document.body.classList.remove("dark-mode-active"),
    });
  }

  // ===========================================
  // 4. TESTIMONIALS SLIDER (Re-using logic)
  // ===========================================
  const tmMinimal = document.querySelector(".testimonials-minimal");
  if (tmMinimal && !isMobile) {
    const wrapper = document.querySelector(".tm-wrapper");
    const cards = document.querySelectorAll(".tm-card");

    const tmTween = gsap.to(wrapper, {
      x: () => -(wrapper.scrollWidth - window.innerWidth),
      duration: 3,
      ease: "none"
    });

    ScrollTrigger.create({
      trigger: ".testimonials-minimal",
      start: "top top",
      end: () => `+=${wrapper.scrollWidth}`,
      pin: true,
      animation: tmTween,
      scrub: 1,
      invalidateOnRefresh: true
    });

    // Opacity active state
    cards.forEach((card) => {
      ScrollTrigger.create({
        trigger: card,
        containerAnimation: tmTween,
        start: "left center",
        end: "right center",
        toggleClass: { targets: card, className: "active" }
      });
    });
  }
});

// Enhanced Mobile Navigation Functionality
function initMobileNav() {
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mobileOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-overlay .nav-item a');
  const mobileHeader = document.querySelector('.mobile-header');

  if (mobileToggle && mobileOverlay) {
    // Enhanced toggle functionality
    mobileToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      mobileToggle.classList.toggle('active');
      mobileOverlay.classList.toggle('active');

      // Prevent body scroll when menu is open
      if (mobileOverlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        // Add subtle vibration on mobile devices
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach((link, index) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close mobile menu when clicking outside
    mobileOverlay.addEventListener('click', (e) => {
      if (e.target === mobileOverlay) {
        closeMobileMenu();
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Enhanced close function
    function closeMobileMenu() {
      mobileToggle.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    // Header scroll effect
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (mobileHeader) {
        if (currentScrollY > 50) {
          mobileHeader.classList.add('scrolled');
        } else {
          mobileHeader.classList.remove('scrolled');
        }
        
        // Hide/show header on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          mobileHeader.style.transform = 'translateY(-100%)';
        } else {
          mobileHeader.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
      }
    });

    // Touch gesture support for closing menu
    let touchStartY = 0;
    let touchEndY = 0;

    mobileOverlay.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    });

    mobileOverlay.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 100;
      const swipeDistance = touchStartY - touchEndY;
      
      // Swipe up to close menu
      if (swipeDistance > swipeThreshold) {
        closeMobileMenu();
      }
    }
  }
}

// Initialize mobile navigation
initMobileNav();



// ===========================================
// Horizontal Scroll Gallery Controls
// ===========================================
function initWorksScroll() {
  const scrollWrapper = document.getElementById('worksScroll');
  const prevBtn = document.querySelector('.scroll-prev');
  const nextBtn = document.querySelector('.scroll-next');
  const progressBar = document.querySelector('.scroll-progress');

  if (!scrollWrapper) return;

  const scrollAmount = 420; // Approximate card width + gap

  // Scroll buttons
  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      scrollWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      scrollWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // Update progress bar
  function updateProgress() {
    if (!progressBar) return;
    const scrollLeft = scrollWrapper.scrollLeft;
    const maxScroll = scrollWrapper.scrollWidth - scrollWrapper.clientWidth;
    const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }

  scrollWrapper.addEventListener('scroll', updateProgress);
  updateProgress(); // Initial call

  // Drag to scroll
  let isDown = false;
  let startX;
  let scrollStart;

  scrollWrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    scrollWrapper.style.cursor = 'grabbing';
    startX = e.pageX - scrollWrapper.offsetLeft;
    scrollStart = scrollWrapper.scrollLeft;
  });

  scrollWrapper.addEventListener('mouseleave', () => {
    isDown = false;
    scrollWrapper.style.cursor = 'grab';
  });

  scrollWrapper.addEventListener('mouseup', () => {
    isDown = false;
    scrollWrapper.style.cursor = 'grab';
  });

  scrollWrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollWrapper.offsetLeft;
    const walk = (x - startX) * 2;
    scrollWrapper.scrollLeft = scrollStart - walk;
  });
}

// Initialize works scroll
initWorksScroll();

// ===========================================
// Testimonials Animation (Simplified)
// ===========================================
function initTestimonialsAnimation() {
  const testimonialSection = document.querySelector('.testimonials-section');
  
  if (testimonialSection) {
    // Create intersection observer for better performance
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add animate class to trigger all animations
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    observer.observe(testimonialSection);
  }

  // Fallback for browsers without Intersection Observer
  if (!window.IntersectionObserver && testimonialSection) {
    setTimeout(() => {
      testimonialSection.classList.add('animate');
    }, 500);
  }
}

// Initialize testimonials animation
initTestimonialsAnimation();