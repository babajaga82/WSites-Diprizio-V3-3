document.addEventListener('DOMContentLoaded', () => {

    // 1. Header scroll effect + logo switch
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // 2. IntersectionObserver per reveal-text e reveal-scale
    const revealOpts = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.08
    };

    const revealCb = (entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(revealCb, revealOpts);

    document.querySelectorAll('.reveal-text, .reveal-scale').forEach(el => {
        observer.observe(el);
    });

    // 3. Smooth scroll (offset per header fisso)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
            closeMobileMenu();
        });
    });

    // 4. Parallax leggero sull'immagine hero (solo desktop)
    const heroImages = document.querySelectorAll('.zoom-on-scroll .hero-img');
    function handleParallax() {
        heroImages.forEach(img => {
            const section = img.closest('.section-hero');
            if (!section) return;
            const rect = section.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;
            
            // Parallax sicuro (±15px) per non mostrare buchi ai bordi dato il scale(1.05)
            const progress = 1 - (rect.top / window.innerHeight); // 0 at bottom, 1 at top
            const offset = (progress - 0.5) * 30; // from -15px to 15px
            img.style.transform = `translateY(${offset}px) scale(1.05)`;
        });
    }

    if (window.innerWidth > 768) {
        window.addEventListener('scroll', handleParallax, { passive: true });
    }

    // 5. Burger / Mobile Menu
    const burgerBtn = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('menu-close');

    function openMobileMenu() {
        mobileMenu.style.display = 'flex';
        requestAnimationFrame(() => mobileMenu.classList.add('open'));
        burgerBtn.classList.add('active');
        burgerBtn.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        burgerBtn.classList.remove('active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => {
            if (!mobileMenu.classList.contains('open')) {
                mobileMenu.style.display = 'none';
            }
        }, 400);
    }

    burgerBtn.addEventListener('click', () => {
        burgerBtn.getAttribute('aria-expanded') === 'true' ? closeMobileMenu() : openMobileMenu();
    });

    if (menuClose) {
        menuClose.addEventListener('click', closeMobileMenu);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });

});

    // 6. Embla Carousel per Multiple Gallery
    const emblaNodes = document.querySelectorAll('.gallery-section');
    if (emblaNodes.length > 0 && window.EmblaCarousel) {
        emblaNodes.forEach(section => {
            const emblaNode = section.querySelector('.embla');
            if(!emblaNode) return;
            
            const options = { align: 'start', containScroll: 'trimSnaps' };
            const emblaApi = window.EmblaCarousel(emblaNode, options);
            
            const prevBtn = section.querySelector('.embla__prev');
            const nextBtn = section.querySelector('.embla__next');
            const dotsContainer = section.querySelector('.embla__dots');
            let dots = [];

            const updateButtons = () => {
                if(!prevBtn || !nextBtn) return;
                prevBtn.disabled = !emblaApi.canScrollPrev();
                nextBtn.disabled = !emblaApi.canScrollNext();
            };

            const setupDots = () => {
                if(!dotsContainer) return;
                const scrollSnaps = emblaApi.scrollSnapList();
                dotsContainer.innerHTML = scrollSnaps.map(() => `<button class="gallery-dot" type="button" aria-label="Vai a slide"></button>`).join('');
                dots = Array.from(dotsContainer.querySelectorAll('.gallery-dot'));
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => emblaApi.scrollTo(index));
                });
            };

            const updateDots = () => {
                if(!dots.length) return;
                const previous = emblaApi.previousScrollSnap();
                const selected = emblaApi.selectedScrollSnap();
                if (dots[previous]) dots[previous].classList.remove('is-selected');
                if (dots[selected]) dots[selected].classList.add('is-selected');
            };

            if(prevBtn && nextBtn) {
                prevBtn.addEventListener('click', () => emblaApi.scrollPrev());
                nextBtn.addEventListener('click', () => emblaApi.scrollNext());
            }
            
            emblaApi.on('init', setupDots);
            emblaApi.on('init', updateDots);
            emblaApi.on('init', updateButtons);
            emblaApi.on('select', updateDots);
            emblaApi.on('select', updateButtons);
            emblaApi.on('reInit', setupDots);
            emblaApi.on('reInit', updateDots);
            emblaApi.on('reInit', updateButtons);
        });
    }
