// 个人信息配置文件
// 请根据您的实际情况修改以下信息

const CONFIG = {
    // 基本信息
    personal: {
        name: "River",
        position: "智能合约开发工程师",
        experience: "8年工作经验",
        location: "中国",
        avatar: "path/to/your/avatar.jpg", // 可选：头像路径
        bio: "精通Golang/Python/JS/TS，熟悉Solidity智能合约开发，掌握Hardhat/Truffle框架，深入理解EVM机制及ERC20/ERC721标准。熟悉DeFi生态，具备DApp、公链、NFT交易市场等全栈开发经验。"
    },

    // 技能列表
    skills: [
        {
            name: "Golang",
            level: 95,
            description: "gRPC, 微服务架构, 高并发",
            category: "后端开发"
        },
        {
            name: "Solidity",
            level: 90,
            description: "智能合约开发, EVM, DeFi",
            category: "区块链"
        },
        {
            name: "JavaScript/TypeScript",
            level: 85,
            description: "React, Node.js, 全栈开发",
            category: "前端开发"
        },
        {
            name: "Python",
            level: 80,
            description: "数据分析, 自动化脚本",
            category: "后端开发"
        },
        {
            name: "区块链技术",
            level: 90,
            description: "EVM, DeFi, NFT, The Graph, IPFS",
            category: "区块链"
        },
        {
            name: "开发框架",
            level: 85,
            description: "Hardhat, Truffle, OpenZeppelin",
            category: "开发工具"
        },
        {
            name: "数据库",
            level: 75,
            description: "PostgreSQL, TDD",
            category: "数据库"
        },
        {
            name: "运维工具",
            level: 80,
            description: "Linux, Docker, Git",
            category: "DevOps"
        }
    ],

    // 项目经验
    projects: [
        {
            title: "DeFiWallet",
            status: "已完成",
            description: "开发支持多策略组合收益的智能合约，实现用户资产委托管理功能，完成合约测试、部署及前端交互开发。集成The Graph索引链上数据，提升前端数据加载效率40%，优化用户资产管理体验。",
            technologies: ["Solidity", "The Graph", "React", "Hardhat"],
            highlights: [
                "提升数据加载效率40%",
                "实现多策略组合收益",
                "完成智能合约安全审计"
            ],
            links: [
                { text: "GitHub", url: "#" }
            ],
            duration: "2023.03 - 2024.11",
            team: "区块链团队",
            role: "智能合约开发工程师"
        },
        {
            title: "P12（Web3游戏平台）",
            status: "已完成",
            description: "主导CoinFactory、VotingEscrow等核心合约模块开发，支持游戏资产发行与治理功能。完成The Graph子图开发与代码审计，确保合约安全性并通过第三方机构审核。",
            technologies: ["Solidity", "The Graph", "Golang", "OpenZeppelin"],
            highlights: [
                "通过第三方安全审计",
                "核心合约模块开发",
                "游戏资产发行功能"
            ],
            links: [
                { text: "GitHub", url: "#" }
            ],
            duration: "2022.02 - 2022.12",
            team: "区块链团队",
            role: "Golang工程师"
        },
        {
            title: "以太坊众筹平台",
            status: "已完成",
            description: "设计资金托管智能合约，支持多签审批机制，防止项目方滥用资金，合约管理资金超2000 ETH。代码开源后获GitHub 300+ Star，被5+项目复用。",
            technologies: ["Solidity", "Ethereum", "Multi-sig"],
            highlights: [
                "管理资金超2000 ETH",
                "GitHub获得300+ Star",
                "被5+项目复用"
            ],
            links: [
                { text: "GitHub", url: "#" }
            ],
            duration: "2019.08 - 2020.10",
            team: "独立项目",
            role: "全栈开发"
        },
        {
            title: "盲拍DApp（eBay项目）",
            status: "已完成",
            description: "基于Solidity开发盲拍合约，集成IPFS存储拍卖数据，支持次高价成交与仲裁机制。项目上线后用户留存率提升25%，获公司内部技术创新奖。",
            technologies: ["Solidity", "IPFS", "React", "Web3"],
            highlights: [
                "用户留存率提升25%",
                "获技术创新奖",
                "实现仲裁机制"
            ],
            links: [
                { text: "演示", url: "#" }
            ],
            duration: "2018.02 - 2018.04",
            team: "3人团队",
            role: "智能合约开发"
        }
    ],

    // 工作经历
    experience: [
        {
            company: "Web3 Lab",
            position: "区块链工程师（智能合约方向）",
            duration: "2023.03 - 2024.11",
            location: "中国",
            description: "负责DeFiWallet项目的智能合约开发，集成The Graph索引技术，提升系统性能。",
            achievements: [
                "开发多策略组合收益智能合约",
                "集成The Graph提升数据加载效率40%",
                "完成合约测试、部署及前端交互开发"
            ]
        },
        {
            company: "北京展心展力（ProjectTwelve）",
            position: "Golang 工程师",
            duration: "2022.02 - 2022.12",
            location: "北京",
            description: "主导P12 Web3游戏平台核心合约模块开发，负责代码审计和安全审核。",
            achievements: [
                "主导CoinFactory、VotingEscrow核心合约开发",
                "完成The Graph子图开发",
                "通过第三方机构安全审核"
            ]
        },
        {
            company: "杭州首航科技",
            position: "Golang 工程师",
            duration: "2021.06 - 2021.11",
            location: "杭州",
            description: "设计并开发DeFiL Filecoin质押借贷平台，实现NFT矿机发行和交易功能。",
            achievements: [
                "设计NFT矿机发行合约",
                "开发借贷合约及交易市场",
                "核心代码复用率达70%"
            ]
        },
        {
            company: "杭州快马游戏",
            position: "后端开发工程师",
            duration: "2021.01 - 2021.04",
            location: "杭州",
            description: "负责FastPlay DApp游戏聚合平台后端开发，使用gRPC搭建微服务架构。",
            achievements: [
                "基于gRPC搭建后端微服务",
                "支持日均10万级用户请求",
                "系统可用性达99.9%"
            ]
        }
    ],

    // 教育背景
    education: [
        {
            school: "武汉地质大学",
            degree: "本科",
            major: "计算机及应用",
            duration: "2018 - 2022",
            gpa: "", // 可选
            honors: [] // 可选
        },
        {
            school: "安徽新华学院",
            degree: "大专",
            major: "电子商务",
            duration: "2009 - 2011",
            gpa: "", // 可选
            honors: [] // 可选
        }
    ],

    // 联系方式
    contacts: [
        {
            type: "邮箱",
            value: "zhouhuan19910202@gmail.com",
            icon: "📧",
            link: "mailto:zhouhuan19910202@gmail.com"
        },
        {
            type: "电话",
            value: "18297572585",
            icon: "📱",
            link: "tel:18297572585"
        },
        {
            type: "GitHub",
            value: "github.com/zhouhuan",
            icon: "💻",
            link: "https://github.com/zhouhuan"
        },
        {
            type: "LinkedIn",
            value: "linkedin.com/in/zhouhuan",
            icon: "💼",
            link: "https://linkedin.com/in/zhouhuan"
        },
        {
            type: "期望薪资",
            value: "28-35K",
            icon: "💰",
            link: "#"
        }
    ],

    // 社交媒体
    social: [
        {
            platform: "Twitter",
            username: "@yourusername",
            url: "https://twitter.com/yourusername"
        },
        {
            platform: "知乎",
            username: "您的知乎用户名",
            url: "https://zhihu.com/people/yourusername"
        }
    ],

    // 证书和认证
    certifications: [
        {
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2023.03",
            credentialId: "ABC123456",
            url: "https://aws.amazon.com/certification/"
        }
    ],

    // 语言能力
    languages: [
        {
            language: "中文",
            level: "母语"
        },
        {
            language: "英语",
            level: "流利"
        },
        {
            language: "日语",
            level: "基础"
        }
    ],

    // 兴趣爱好
    interests: [
        "开源贡献",
        "技术写作",
        "摄影",
        "旅行",
        "阅读"
    ],

    // 网站设置
    settings: {
        theme: "tech", // tech, minimal, creative
        primaryColor: "#00ffff",
        secondaryColor: "#0080ff",
        accentColor: "#ff0080",
        animationSpeed: "normal", // slow, normal, fast
        showScrollProgress: true,
        showTypingEffect: true,
        backgroundAnimation: true,
        particleEffect: false // 可选的粒子背景效果
    },

    // SEO 设置
    seo: {
        title: "个人简历 - 周欢 | 智能合约开发工程师",
        description: "周欢的个人简历网站，8年工作经验，精通Golang、Solidity智能合约开发，熟悉DeFi、NFT等区块链技术。",
        keywords: ["智能合约开发工程师", "区块链工程师", "Golang", "Solidity", "DeFi", "NFT", "The Graph"],
        author: "周欢",
        image: "path/to/og-image.jpg" // Open Graph 图片
    }
};

// 导出配置（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}