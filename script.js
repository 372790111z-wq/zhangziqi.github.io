/* ========================================
   AI产品经理个人网站 - 交互脚本
   功能：背景粒子动效 + 滚动动画
======================================== */

// ===== 背景粒子动效 - 白色系 =====
const canvas = document.getElementById('particles');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    // 设置Canvas尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 粒子配置
    const particleCount = window.innerWidth > 768 ? 60 : 30;
    const connectionDistance = 150;
    const mouseDistance = 200;
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.5 + 0.5;
            this.baseAlpha = Math.random() * 0.3 + 0.1;
            this.alpha = this.baseAlpha;
        }
        
        update() {
            // 基础移动
            this.x += this.vx;
            this.y += this.vy;
            
            // 边界检测
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            // 鼠标交互
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseDistance) {
                const force = (mouseDistance - distance) / mouseDistance;
                this.x -= dx * force * 0.02;
                this.y -= dy * force * 0.02;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(150, 150, 150, ${this.alpha})`;
            ctx.fill();
        }
    }
    
    // 鼠标追踪
    let mouseX = -1000;
    let mouseY = -1000;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // 创建粒子
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // 连接线
    function connect() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(150, 150, 150, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connect();
        requestAnimationFrame(animate);
    }
    animate();
}

// ===== 滚动动画 - 增强版 =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // 为子元素添加延迟动画
            const children = entry.target.querySelectorAll('.case-card, .method-item');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.classList.add('visible');
                }, index * 100);
            });
        }
    });
}, observerOptions);

// 为所有section添加动画
document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});

// ===== 平滑滚动 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            const offset = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== 导航高亮 =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollPosition = window.scrollY + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                 link.classList.remove('active');
                 if (link.getAttribute('href') === `#${sectionId}`) {
                     link.classList.add('active');
                 }
             });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// ===== 标签悬停交互 =====
document.querySelectorAll('.hero-tags .tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    tag.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// ===== 案例卡片悬停效果 =====
document.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ===== 统计卡片悬停效果 =====
document.querySelectorAll('.model-stat-card, .method-item').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ===== 内容项悬停效果 =====
document.querySelectorAll('.content-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.paddingLeft = '1rem';
    });
    item.addEventListener('mouseleave', function() {
        this.style.paddingLeft = '0';
    });
});

// ===== 联系方式悬停效果 =====
document.querySelectorAll('.contact-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        const icon = this.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1.1)';
        }
    });
    link.addEventListener('mouseleave', function() {
        const icon = this.querySelector('i');
        if (icon) {
            icon.style.transform = 'scale(1)';
        }
    });
});

// ===== 按钮点击波纹效果 =====
document.querySelectorAll('.hero-cta').forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 100px;
            margin-left: -50px;
            margin-top: -50px;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// 添加波纹动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== 页面滚动进度条 =====
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: #000;
    z-index: 9999;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
});

// ===== 控制台彩蛋 =====
console.log('%c👋 你好，代码探索者！', 'font-size: 16px; color: #000; font-weight: bold;');
console.log('%c这是一个AI产品经理的个人网站', 'font-size: 12px; color: #666;');
console.log('%c关注产品体验，传递技术价值', 'font-size: 12px; color: #999;');

// ===== 页面加载完成 =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Hero 区域入场动画
    const heroContent = document.querySelector('.hero-content');
    const heroStats = document.querySelector('.hero-stats');
    
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        setTimeout(() => {
            heroContent.style.transition = 'all 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }
    
    if (heroStats) {
        heroStats.style.opacity = '0';
        heroStats.style.transform = 'translateY(30px)';
        setTimeout(() => {
            heroStats.style.transition = 'all 0.8s ease';
            heroStats.style.opacity = '1';
            heroStats.style.transform = 'translateY(0)';
        }, 400);
    }
});

console.log('✨ 网站已加载完成 - 极致简洁，为AI产品而生');

// ===== 案例卡片滑动器 =====
class CaseSlider {
    constructor(container) {
        this.container = container;
        this.slider = container.querySelector('.cases-slider');
        this.wrapper = container.querySelector('.cases-slider-wrapper');
        this.navButtonsContainer = container.querySelector('.slider-nav-buttons');
        this.prevBtn = container.querySelector('.slider-prev');
        this.nextBtn = container.querySelector('.slider-next');
        this.dotsContainer = container.querySelector('.slider-dots');
        this.cards = Array.from(this.slider.querySelectorAll('.case-card'));
        
        this.currentIndex = 0;
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;
        
        this.init();
    }
    
    init() {
        this.setupDots();
        this.setupEventListeners();
        this.updateSlider();
        this.updateButtons();
    }
    
    setupDots() {
        const totalSlides = Math.ceil(this.cards.length / this.getCardsPerView());
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('slider-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    getCardsPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    }
    
    getMaxIndex() {
        const cardsPerView = this.getCardsPerView();
        return Math.max(0, this.cards.length - cardsPerView);
    }
    
    setupEventListeners() {
        // 按钮点击
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // 触摸事件
        this.slider.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
        this.slider.addEventListener('touchend', () => this.touchEnd());
        this.slider.addEventListener('touchmove', (e) => this.touchMove(e), { passive: true });
        
        // 鼠标拖拽
        this.slider.addEventListener('mousedown', (e) => this.touchStart(e));
        this.slider.addEventListener('mouseup', () => this.touchEnd());
        this.slider.addEventListener('mouseleave', () => this.touchEnd());
        this.slider.addEventListener('mousemove', (e) => this.touchMove(e));
        
        // 窗口大小改变
        window.addEventListener('resize', () => {
            this.setupDots();
            this.updateSlider();
            this.updateButtons();
        });
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
    }
    
    touchStart(event) {
        this.isDragging = true;
        this.startPos = this.getPositionX(event);
        this.animationID = requestAnimationFrame(this.animation.bind(this));
        this.slider.style.transition = 'none';
    }
    
    touchMove(event) {
        if (this.isDragging) {
            const currentPosition = this.getPositionX(event);
            this.currentTranslate = this.prevTranslate + currentPosition - this.startPos;
        }
    }
    
    touchEnd() {
        this.isDragging = false;
        cancelAnimationFrame(this.animationID);
        
        const movedBy = this.currentTranslate - this.prevTranslate;
        
        if (movedBy < -50) this.next();
        if (movedBy > 50) this.prev();
        
        this.updateSlider();
    }
    
    getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    animation() {
        this.setSliderPosition();
        if (this.isDragging) requestAnimationFrame(this.animation.bind(this));
    }
    
    setSliderPosition() {
        this.slider.style.transform = `translateX(${this.currentTranslate}px)`;
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateSlider();
            this.updateButtons();
            this.updateDots();
        }
    }
    
    next() {
        const maxIndex = this.getMaxIndex();
        if (this.currentIndex < maxIndex) {
            this.currentIndex++;
            this.updateSlider();
            this.updateButtons();
            this.updateDots();
        }
    }
    
    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
        this.updateButtons();
        this.updateDots();
    }
    
    updateSlider() {
        const cardWidth = this.cards[0].offsetWidth + 32; // card width + gap
        this.currentTranslate = -this.currentIndex * cardWidth;
        this.prevTranslate = this.currentTranslate;
        this.slider.style.transition = 'transform 0.5s ease';
        this.setSliderPosition();
    }
    
    updateButtons() {
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex >= this.getMaxIndex();
    }
    
    updateDots() {
        const cardsPerView = this.getCardsPerView();
        const activeDotIndex = Math.floor(this.currentIndex / cardsPerView);
        
        const dots = this.dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeDotIndex);
        });
    }
}

// 初始化所有滑动器
document.querySelectorAll('.cases-slider-container').forEach(container => {
    new CaseSlider(container);
});
