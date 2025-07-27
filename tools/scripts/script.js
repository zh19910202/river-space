// 个人信息数据 - 请根据您的实际情况修改
const personalData = {
    name: "River",
    position: "智能合约开发工程师",
    experience: "8年工作经验",
    location: "中国",
    skills: [
        {
            name: "Golang",
            level: 95,
            description: "gRPC, 微服务架构, 高并发"
        },
        {
            name: "Solidity",
            level: 90,
            description: "智能合约开发, EVM, DeFi"
        },
        {
            name: "JavaScript/TypeScript",
            level: 85,
            description: "React, Node.js, 全栈开发"
        },
        {
            name: "Python",
            level: 80,
            description: "数据分析, 自动化脚本"
        },
        {
            name: "区块链技术",
            level: 90,
            description: "EVM, DeFi, NFT, The Graph, IPFS"
        },
        {
            name: "开发框架",
            level: 85,
            description: "Hardhat, Truffle, OpenZeppelin"
        },
        {
            name: "数据库",
            level: 75,
            description: "PostgreSQL, TDD"
        },
        {
            name: "运维工具",
            level: 80,
            description: "Linux, Docker, Git"
        }
    ],
    projects: [
        {
            title: "DeFiWallet",
            status: "已完成",
            description: "开发支持多策略组合收益的智能合约，实现用户资产委托管理功能，完成合约测试、部署及前端交互开发。集成The Graph索引链上数据，提升前端数据加载效率40%，优化用户资产管理体验。",
            technologies: ["Solidity", "The Graph", "React", "Hardhat"],
            links: [
                { text: "GitHub", url: "#" }
            ]
        },
        {
            title: "P12（Web3游戏平台）",
            status: "已完成",
            description: "主导CoinFactory、VotingEscrow等核心合约模块开发，支持游戏资产发行与治理功能。完成The Graph子图开发与代码审计，确保合约安全性并通过第三方机构审核。",
            technologies: ["Solidity", "The Graph", "Golang", "OpenZeppelin"],
            links: [
                { text: "GitHub", url: "#" }
            ]
        },
        {
            title: "以太坊众筹平台",
            status: "已完成",
            description: "设计资金托管智能合约，支持多签审批机制，防止项目方滥用资金，合约管理资金超2000 ETH。代码开源后获GitHub 300+ Star，被5+项目复用。",
            technologies: ["Solidity", "Ethereum", "Multi-sig"],
            links: [
                { text: "GitHub", url: "#" }
            ]
        },
        {
            title: "盲拍DApp（eBay项目）",
            status: "已完成",
            description: "基于Solidity开发盲拍合约，集成IPFS存储拍卖数据，支持次高价成交与仲裁机制。项目上线后用户留存率提升25%，获公司内部技术创新奖。",
            technologies: ["Solidity", "IPFS", "React", "Web3"],
            links: [
                { text: "演示", url: "#" }
            ]
        }
    ],
    contacts: [
        {
            type: "邮箱",
            value: "zhouhuan19910202@gmail.com",
            icon: "📧"
        },
        {
            type: "电话",
            value: "18297572585",
            icon: "📱"
        },
        {
            type: "GitHub",
            value: "zh19910202",
            icon: "💻"
        }
    ]
};

// 打字机效果类
class Typewriter {
    constructor(element, text, speed = 50) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.index = 0;
    }

    async type() {
        return new Promise((resolve) => {
            const timer = setInterval(() => {
                if (this.index < this.text.length) {
                    this.element.textContent += this.text.charAt(this.index);
                    this.index++;
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, this.speed);
        });
    }

    async clear() {
        return new Promise((resolve) => {
            const timer = setInterval(() => {
                if (this.element.textContent.length > 0) {
                    this.element.textContent = this.element.textContent.slice(0, -1);
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, this.speed / 2);
        });
    }
}

// 终端输出类
class TerminalOutput {
    constructor(outputElement) {
        this.outputElement = outputElement;
        this.lines = [];
    }

    addLine(text, className = '', delay = 0) {
        setTimeout(() => {
            const line = document.createElement('div');
            line.className = `output-line ${className}`;
            line.style.animationDelay = `${delay}ms`;
            
            if (className === 'success') {
                line.innerHTML = `<span style="color: #28ca42;">✓</span> ${text}`;
            } else if (className === 'info') {
                line.innerHTML = `<span style="color: #00ffff;">ℹ</span> ${text}`;
            } else if (className === 'warning') {
                line.innerHTML = `<span style="color: #ffbd2e;">⚠</span> ${text}`;
            } else {
                line.textContent = text;
            }
            
            this.outputElement.appendChild(line);
        }, delay);
    }

    clear() {
        this.outputElement.innerHTML = '';
    }
}

// 滚动动画观察器
class ScrollAnimator {
    constructor() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        
                        // 如果是信息区域，触发打字机效果
                        if (entry.target.id === 'info-section') {
                            this.animateInfoItems();
                        }
                        
                        // 如果是技能区域，触发技能动画
                        if (entry.target.id === 'skills-section') {
                            this.animateSkills();
                        }
                        
                        // 如果是项目区域，触发项目动画
                        if (entry.target.id === 'projects-section') {
                            this.animateProjects();
                        }
                        
                        // 如果是联系区域，触发联系动画
                        if (entry.target.id === 'contact-section') {
                            this.animateContacts();
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );
    }

    observe(element) {
        this.observer.observe(element);
    }

    async animateInfoItems() {
        const items = document.querySelectorAll('.info-item');
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const delay = parseInt(item.dataset.delay) || 0;
            
            setTimeout(() => {
                item.classList.add('visible');
                
                // 为值添加打字机效果
                const valueElement = item.querySelector('.value');
                const originalText = valueElement.textContent;
                valueElement.textContent = '';
                
                const typewriter = new Typewriter(valueElement, originalText, 30);
                typewriter.type();
            }, delay);
        }
    }

    animateSkills() {
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animationDelay = `${index * 100}ms`;
                item.classList.add('animate');
            }, index * 100);
        });
    }

    animateProjects() {
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animationDelay = `${index * 200}ms`;
                item.classList.add('animate');
            }, index * 200);
        });
    }

    animateContacts() {
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animationDelay = `${index * 150}ms`;
                item.classList.add('animate');
            }, index * 150);
        });
    }
}

// 滚动进度条
class ScrollProgress {
    constructor() {
        this.progressBar = document.querySelector('.scroll-progress');
        this.updateProgress();
        window.addEventListener('scroll', () => this.updateProgress());
    }

    updateProgress() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        this.progressBar.style.width = scrollPercent + '%';
    }
}

// 主应用类
class PortfolioApp {
    constructor() {
        this.terminal = null;
        this.scrollAnimator = new ScrollAnimator();
        this.scrollProgress = new ScrollProgress();
        this.init();
    }

    async init() {
        // 初始化终端
        await this.initTerminal();
        
        // 渲染内容
        this.renderPersonalInfo();
        this.renderSkills();
        this.renderProjects();
        this.renderContacts();
        
        // 设置滚动观察器
        this.setupScrollObserver();
        
        // 添加平滑滚动
        this.setupSmoothScroll();
        
        // 初始化导航栏
        this.initNavigation();
    }

    async initTerminal() {
        const commandElement = document.getElementById('init-command');
        const outputElement = document.getElementById('terminal-output');
        
        this.terminal = new TerminalOutput(outputElement);
        
        // 模拟终端启动过程
        const commands = [
            'initialize_portfolio.exe',
            'loading_personal_data...',
            'connecting_to_server...',
            'portfolio_ready'
        ];

        for (let i = 0; i < commands.length; i++) {
            const typewriter = new Typewriter(commandElement, commands[i], 40); // 从80减少到40，加快打字速度
            await typewriter.type();
            
            if (i < commands.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 200)); // 从500减少到200，减少命令间隔
                await typewriter.clear();
            }
        }

        // 添加终端输出
        setTimeout(() => {
            this.terminal.addLine('系统初始化完成', 'success', 0);
            this.terminal.addLine('正在加载个人资料...', 'info', 200); // 从500减少到200
            this.terminal.addLine('数据库连接成功', 'success', 400); // 从1000减少到400
            this.terminal.addLine('欢迎访问River Space！', 'info', 600); // 从1500减少到600
            this.terminal.addLine('向下滚动查看更多信息', 'warning', 800); // 从2000减少到800
        }, 300); // 从1000减少到300，更快开始显示输出
    }

    renderPersonalInfo() {
        document.getElementById('name-text').textContent = personalData.name;
        document.getElementById('position-text').textContent = personalData.position;
        document.getElementById('experience-text').textContent = personalData.experience;
        document.getElementById('location-text').textContent = personalData.location;
    }

    renderSkills() {
        const skillsGrid = document.getElementById('skills-grid');
        
        personalData.skills.forEach((skill, index) => {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill-item';
            skillElement.style.animationDelay = `${index * 100}ms`;
            
            skillElement.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-level">
                    <div class="skill-progress" style="--progress: ${skill.level}%"></div>
                </div>
                <div class="skill-description">${skill.description}</div>
            `;
            
            skillsGrid.appendChild(skillElement);
        });
    }

    renderProjects() {
        const projectsContainer = document.getElementById('projects-container');
        
        personalData.projects.forEach((project, index) => {
            const projectElement = document.createElement('div');
            projectElement.className = 'project-item';
            projectElement.style.animationDelay = `${index * 200}ms`;
            
            const techTags = project.technologies.map(tech => 
                `<span class="tech-tag">${tech}</span>`
            ).join('');
            
            const projectLinks = project.links.map(link => 
                `<a href="${link.url}" class="project-link" target="_blank">${link.text}</a>`
            ).join('');
            
            projectElement.innerHTML = `
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                    <span class="project-status">${project.status}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">${techTags}</div>
                <div class="project-links">${projectLinks}</div>
            `;
            
            projectsContainer.appendChild(projectElement);
        });
    }

    renderContacts() {
        const contactGrid = document.getElementById('contact-grid');
        
        personalData.contacts.forEach((contact, index) => {
            const contactElement = document.createElement('div');
            contactElement.className = 'contact-item';
            contactElement.style.animationDelay = `${index * 150}ms`;
            
            // 根据联系方式类型生成不同的显示和链接
            let contactContent = '';
            let contactValue = contact.value;
            
            if (contact.type === '邮箱') {
                contactContent = `
                    <div class="contact-icon">${contact.icon}</div>
                    <div class="contact-info">
                        <h4>${contact.type}</h4>
                        <p><a href="mailto:${contact.value}" class="contact-link">${contact.value}</a></p>
                    </div>
                `;
            } else if (contact.type === 'GitHub') {
                contactContent = `
                    <div class="contact-icon">${contact.icon}</div>
                    <div class="contact-info">
                        <h4>${contact.type}</h4>
                        <p><a href="https://github.com/${contact.value}" target="_blank" class="contact-link">${contact.value}</a></p>
                    </div>
                `;
            } else if (contact.type === '电话') {
                contactContent = `
                    <div class="contact-icon">${contact.icon}</div>
                    <div class="contact-info">
                        <h4>${contact.type}</h4>
                        <p><a href="tel:${contact.value}" class="contact-link">${contact.value}</a></p>
                    </div>
                `;
            } else {
                contactContent = `
                    <div class="contact-icon">${contact.icon}</div>
                    <div class="contact-info">
                        <h4>${contact.type}</h4>
                        <p>${contact.value}</p>
                    </div>
                `;
            }
            
            contactElement.innerHTML = contactContent;
            contactGrid.appendChild(contactElement);
        });
    }

    setupScrollObserver() {
        const sections = document.querySelectorAll('.info-section, .skills-section, .projects-section, .contact-section');
        sections.forEach(section => {
            this.scrollAnimator.observe(section);
        });
    }

    setupSmoothScroll() {
        // 添加平滑滚动行为
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                window.scrollBy(0, 100);
            } else if (e.key === 'ArrowUp') {
                window.scrollBy(0, -100);
            }
        });
    }
    
    initNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        // 导航栏滚动效果
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // 移动端菜单切换
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// 页面加载完成后初始化应用
let portfolioApp;
document.addEventListener('DOMContentLoaded', () => {
    portfolioApp = new PortfolioApp();
});

// 添加一些额外的交互效果
document.addEventListener('mousemove', (e) => {
    // 鼠标跟随效果（可选）
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

// 添加页面可见性检测
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '👋 loading！';
    } else {
        document.title = 'River Space | 智能合约开发工程师';
    }
});