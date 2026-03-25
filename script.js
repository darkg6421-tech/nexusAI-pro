// ========== INITIALIZATION ==========
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Hide loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1000);
    
    showNotification('Welcome to NexusUI Pro! 🎉', 'success');
    startUptimeCounter();
    updateStats();
});

// ========== PARTICLE SYSTEM ==========
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
        this.animate();
        this.addEventListeners();
    }
    
    init() {
        this.resize();
        for(let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
            });
        }
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            if(particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
            if(particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // Draw connections
            this.particles.forEach(p2 => {
                const dx = particle.x - p2.x;
                const dy = particle.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if(distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance/100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => this.resize());
    }
}

new ParticleSystem();

// ========== STATS UPDATE ==========
let startTime = Date.now();
let uptimeSeconds = 0;

function startUptimeCounter() {
    setInterval(() => {
        uptimeSeconds++;
        document.getElementById('uptime').textContent = uptimeSeconds;
    }, 1000);
}

function updateStats() {
    // Simulate real-time stats
    setInterval(() => {
        const users = Math.floor(Math.random() * 1000) + 500;
        const performance = Math.floor(Math.random() * 30) + 70;
        const lines = Math.floor(Math.random() * 5000) + 2000;
        
        document.getElementById('userCount').textContent = users;
        document.getElementById('performanceScore').textContent = performance;
        document.getElementById('linesOfCode').textContent = lines;
        
        // Update chart
        if(window.analyticsChart) {
            const newData = Math.floor(Math.random() * 100);
            window.analyticsChart.data.datasets[0].data.push(newData);
            window.analyticsChart.data.datasets[0].data.shift();
            window.analyticsChart.update();
        }
    }, 3000);
}

// ========== ANALYTICS CHART ==========
const ctx = document.getElementById('analyticsChart').getContext('2d');
window.analyticsChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array(20).fill('').map((_, i) => i + 1),
        datasets: [{
            label: 'Real-time Data',
            data: Array(20).fill(0).map(() => Math.random() * 100),
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: { color: 'white' }
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: 'white' }
            },
            x: {
                grid: { color: 'rgba(255,255,255,0.1)' },
                ticks: { color: 'white' }
            }
        }
    }
});

// ========== VOICE RECOGNITION ==========
const voiceBtn = document.getElementById('voiceBtn');
const voiceResult = document.getElementById('voiceResult');

if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.innerHTML = '<i class="fas fa-microphone-slash mr-2"></i>Listening...';
        voiceBtn.style.opacity = '0.7';
    });
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        voiceResult.innerHTML = `<i class="fas fa-comment"></i> You said: "${transcript}"`;
        showNotification(`Voice recognized: ${transcript}`, 'info');
        voiceBtn.innerHTML = '<i class="fas fa-microphone mr-2"></i>Start Voice';
        voiceBtn.style.opacity = '1';
        
        // Process voice commands
        processVoiceCommand(transcript.toLowerCase());
    };
    
    recognition.onerror = () => {
        voiceBtn.innerHTML = '<i class="fas fa-microphone mr-2"></i>Start Voice';
        voiceBtn.style.opacity = '1';
        showNotification('Voice recognition failed. Please try again.', 'error');
    };
} else {
    voiceBtn.disabled = true;
    voiceBtn.innerHTML = '<i class="fas fa-microphone-slash mr-2"></i>Not Supported';
}

function processVoiceCommand(command) {
    if(command.includes('hello') || command.includes('hi')) {
        addTerminalOutput('$ Hello! How can I help you today?');
        speak('Hello! How can I help you today?');
    } else if(command.includes('theme')) {
        addTerminalOutput('$ Opening theme selector...');
        showNotification('Please click on a theme color!', 'info');
    } else if(command.includes('help')) {
        addTerminalOutput('$ Available commands: hello, theme, stats, clear');
        speak('Available commands: hello, theme, stats, clear');
    } else {
        addTerminalOutput(`$ Command not recognized: "${command}"`);
    }
}

function speak(text) {
    if('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

// ========== THEME CUSTOMIZER ==========
const themes = {
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    green: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    orange: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
};

document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.body.style.background = themes[theme];
        showNotification(`Theme changed to ${theme}! 🎨`, 'success');
        addTerminalOutput(`$ Theme changed to ${theme}`);
    });
});

// ========== FILE UPLOAD ==========
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileList = document.getElementById('fileList');

uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    fileList.innerHTML = '';
    
    files.forEach(file => {
        const fileSize = (file.size / 1024).toFixed(2);
        const fileElement = document.createElement('div');
        fileElement.className = 'bg-white/10 rounded p-2 mb-2';
        fileElement.innerHTML = `
            <i class="fas fa-file mr-2"></i>
            ${file.name} (${fileSize} KB)
            <span class="text-green-400 float-right">
                <i class="fas fa-check-circle"></i> Uploaded
            </span>
        `;
        fileList.appendChild(fileElement);
        showNotification(`${file.name} uploaded successfully! 📁`, 'success');
        addTerminalOutput(`$ File uploaded: ${file.name}`);
    });
});

// ========== INTERACTIVE TERMINAL ==========
const terminal = document.getElementById('terminal');
const terminalInput = document.getElementById('terminalInput');
const clearTerminalBtn = document.getElementById('clearTerminal');

const commands = {
    help: () => {
        return `Available commands:
- help: Show this help message
- clear: Clear terminal
- theme: Change theme colors
- stats: Show current statistics
- echo [text]: Echo your text
- date: Show current date and time
- whoami: Show user information
- github: Open GitHub repository`;
    },
    clear: () => {
        terminal.innerHTML = '<div>Terminal cleared.</div><div class="mt-2">$ <span id="terminalInput" contenteditable="true" class="outline-none inline-block min-w-[200px]"></span></div>';
        reattachTerminalInput();
        return null;
    },
    theme: () => {
        showNotification('Click on any theme button above!', 'info');
        return 'Opening theme selector...';
    },
    stats: () => {
        const users = document.getElementById('userCount').textContent;
        const perf = document.getElementById('performanceScore').textContent;
        return `Current Stats:
- Active Users: ${users}
- Performance Score: ${perf}
- Uptime: ${uptimeSeconds}s
- Lines of Code: ${document.getElementById('linesOfCode').textContent}`;
    },
    echo: (args) => args.join(' ') || 'Nothing to echo',
    date: () => new Date().toString(),
    whoami: () => `User: ${navigator.userAgent.split(' ').slice(0, 3).join(' ')} | Platform: ${navigator.platform}`,
    github: () => {
        window.open('https://github.com', '_blank');
        return 'Opening GitHub...';
    }
};

function addTerminalOutput(text) {
    const outputDiv = document.createElement('div');
    outputDiv.className = 'mt-1 text-gray-300';
    outputDiv.textContent = text;
    terminal.insertBefore(outputDiv, terminal.lastElementChild);
    terminal.scrollTop = terminal.scrollHeight;
}

function reattachTerminalInput() {
    const newInput = document.getElementById('terminalInput');
    if(newInput) {
        newInput.focus();
        newInput.addEventListener('keypress', (e) => {
            if(e.key === 'Enter') {
                e.preventDefault();
                const command = newInput.textContent.trim();
                if(command) {
                    addTerminalOutput(`$ ${command}`);
                    processCommand(command);
                    newInput.textContent = '';
                }
            }
        });
    }
}

function processCommand(commandLine) {
    const parts = commandLine.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    if(commands[cmd]) {
        const result = commands[cmd](args);
        if(result) addTerminalOutput(result);
    } else {
        addTerminalOutput(`Command not found: ${cmd}. Type 'help' for available commands.`);
    }
}

clearTerminalBtn.addEventListener('click', () => {
    commands.clear();
    showNotification('Terminal cleared!', 'info');
});

reattachTerminalInput();

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    
    const colors = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        error: 'bg-gradient-to-r from-red-500 to-pink-500',
        info: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    };
    
    notification.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-3 transform transition-all duration-300 translate-x-full`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notificationArea.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    // Ctrl + K for terminal focus
    if(e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        terminalInput.focus();
        showNotification('Terminal focused!', 'info');
    }
    
    // Ctrl + H for help
    if(e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        addTerminalOutput(commands.help());
    }
    
    // Esc for clearing
    if(e.key === 'Escape') {
        terminalInput.textContent = '';
    }
});

// ========== ADDITIONAL FEATURES ==========
// Drag and drop file upload
document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if(files.length > 0) {
        const fileInputEvent = { target: { files: files } };
        fileInput.dispatchEvent(new Event('change'));
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
        showNotification(`${files.length} file(s) dropped! 📁`, 'success');
    }
});

// Console greeting
console.log('%c✨ NexusUI Pro v2.0 ✨', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to the next-generation interactive experience!', 'color: #a0e9ff; font-size: 14px;');
console.log('%cType "help" in the terminal to get started!', 'color: #43e97b; font-size: 12px;');

// Export for global use
window.showNotification = showNotification;
window.addTerminalOutput = addTerminalOutput;

showNotification('System ready! 🚀', 'success');
