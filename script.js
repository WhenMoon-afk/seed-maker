document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // =====================
    // SEED MAKER
    // =====================
    const entropyBox = document.getElementById('entropy-box');
    const entropyProgress = document.getElementById('entropy-progress');
    const timeBtn = document.getElementById('time-btn');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const result = document.getElementById('result');
    const lengthPreset = document.getElementById('length-preset');
    const historyList = document.getElementById('history-list');
    const clearBtn = document.getElementById('clear-btn');
    
    const useLower = document.getElementById('use-lower');
    const useUpper = document.getElementById('use-upper');
    const useNumbers = document.getElementById('use-numbers');
    const useSpecial = document.getElementById('use-special');
    
    let entropyPool = new Uint32Array(256);
    let entropyIndex = 0;
    let mouseEntropy = 0;
    const mouseEntropyTarget = 50;
    let lastX = 0, lastY = 0;
    
    function initSeedMaker() {
        addEntropy(Date.now());
        addEntropy(performance.now() * 1000);
        addEntropy(screen.width * screen.height);
        
        if (window.crypto?.getRandomValues) {
            const seed = new Uint32Array(32);
            crypto.getRandomValues(seed);
            seed.forEach(v => addEntropy(v));
        }
        
        loadHistory();
    }
    
    function addEntropy(value) {
        entropyPool[entropyIndex % entropyPool.length] ^= Math.floor(value);
        entropyIndex++;
    }
    
    entropyBox.addEventListener('mousemove', (e) => {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            addEntropy((e.clientX << 16) | e.clientY);
            addEntropy(performance.now() * 1000);
            
            if (mouseEntropy < mouseEntropyTarget) {
                mouseEntropy++;
                const pct = (mouseEntropy / mouseEntropyTarget) * 100;
                entropyProgress.style.width = pct + '%';
                
                if (mouseEntropy >= mouseEntropyTarget) {
                    entropyBox.classList.add('complete');
                }
            }
        }
    });
    
    timeBtn.addEventListener('click', () => {
        const t1 = performance.now();
        let x = 0;
        for (let i = 0; i < 10000; i++) x += Math.sqrt(i);
        const t2 = performance.now();
        
        addEntropy(t1 * 1000000);
        addEntropy(t2 * 1000000);
        addEntropy(x);
        
        timeBtn.textContent = 'Added!';
        setTimeout(() => timeBtn.textContent = 'Add Time Entropy', 1000);
    });
    
    generateBtn.addEventListener('click', () => {
        const length = parseInt(lengthPreset.value);
        let charset = '';
        
        if (useLower.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useUpper.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useNumbers.checked) charset += '0123456789';
        if (useSpecial.checked) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
        
        if (!charset) {
            charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            useLower.checked = useUpper.checked = useNumbers.checked = true;
        }
        
        let output = '';
        const randomBytes = new Uint8Array(length);
        
        if (window.crypto?.getRandomValues) {
            crypto.getRandomValues(randomBytes);
        }
        
        for (let i = 0; i < length; i++) {
            const poolValue = entropyPool[i % entropyPool.length] & 0xFF;
            const combined = randomBytes[i] ^ poolValue;
            output += charset[combined % charset.length];
        }
        
        result.value = output;
        addToHistory(output);
    });
    
    copyBtn.addEventListener('click', () => {
        if (result.value) {
            navigator.clipboard.writeText(result.value).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => copyBtn.textContent = 'Copy', 1500);
            });
        }
    });
    
    function addToHistory(str) {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = str;
        item.addEventListener('click', () => {
            result.value = str;
        });
        
        historyList.insertBefore(item, historyList.firstChild);
        
        let history = JSON.parse(localStorage.getItem('seedHistory') || '[]');
        history.unshift(str);
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('seedHistory', JSON.stringify(history));
        
        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
    
    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('seedHistory') || '[]');
        history.forEach(str => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.textContent = str;
            item.addEventListener('click', () => {
                result.value = str;
            });
            historyList.appendChild(item);
        });
    }
    
    clearBtn.addEventListener('click', () => {
        historyList.innerHTML = '';
        localStorage.removeItem('seedHistory');
    });
    
    document.addEventListener('click', (e) => {
        addEntropy((e.clientX << 16) | e.clientY);
    });
    
    document.addEventListener('keydown', (e) => {
        addEntropy((e.keyCode << 16) | performance.now());
    });
    
    initSeedMaker();

    // =====================
    // TEXT COUNTER
    // =====================
    const counterInput = document.getElementById('counter-input');
    const counterClear = document.getElementById('counter-clear');
    
    const charCount = document.getElementById('char-count');
    const charNoSpace = document.getElementById('char-no-space');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');
    const sentenceCount = document.getElementById('sentence-count');
    const paragraphCount = document.getElementById('paragraph-count');
    
    const tokensGpt = document.getElementById('tokens-gpt');
    const tokensClaude = document.getElementById('tokens-claude');
    const tokensSimple = document.getElementById('tokens-simple');
    
    function updateCounts() {
        const text = counterInput.value;
        
        // Character counts
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        
        // Word count
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        // Line count
        const lines = text === '' ? 0 : text.split(/\n/).length;
        
        // Sentence count (rough: split on . ! ?)
        const sentences = text.trim() === '' ? 0 : 
            (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0);
        
        // Paragraph count (split on double newlines)
        const paragraphs = text.trim() === '' ? 0 :
            text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0);
        
        // Update display
        charCount.textContent = chars.toLocaleString();
        charNoSpace.textContent = charsNoSpaces.toLocaleString();
        wordCount.textContent = words.toLocaleString();
        lineCount.textContent = lines.toLocaleString();
        sentenceCount.textContent = sentences.toLocaleString();
        paragraphCount.textContent = paragraphs.toLocaleString();
        
        // Token estimates
        // GPT: roughly 1 token per 4 chars for English, or ~1.3 tokens per word
        const gptTokens = Math.ceil(chars / 4);
        // Claude: similar to GPT, slightly different for some content
        const claudeTokens = Math.ceil(words * 1.35);
        // Simple: chars / 4
        const simpleTokens = Math.ceil(chars / 4);
        
        tokensGpt.textContent = chars === 0 ? '~0' : `~${gptTokens.toLocaleString()}`;
        tokensClaude.textContent = chars === 0 ? '~0' : `~${claudeTokens.toLocaleString()}`;
        tokensSimple.textContent = chars === 0 ? '~0' : `~${simpleTokens.toLocaleString()}`;
    }
    
    counterInput.addEventListener('input', updateCounts);
    
    counterClear.addEventListener('click', () => {
        counterInput.value = '';
        updateCounts();
    });
    
    // Initialize counts
    updateCounts();
});