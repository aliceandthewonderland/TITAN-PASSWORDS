function generatePassword(minEntropy) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?"\'/\\`~';
    
    const charsetSize = lowercase.length + uppercase.length + numbers.length + symbols.length;
    const minLength = Math.ceil(minEntropy / Math.log2(charsetSize));
    const finalLength = minLength + Math.floor(Math.random() * 3);
    
    let password = '';
    let lastChar = '';
    let lastCharType = '';
    let consecutiveCount = 0;
    
    while (password.length < finalLength) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);

        let randomNum = array[0];
        let char;
        let charType;
        
        do {
            if (randomNum % 4 === 0) {
                char = lowercase[randomNum % lowercase.length];
                charType = 'lower';
            } else if (randomNum % 4 === 1) {
                char = uppercase[randomNum % uppercase.length];
                charType = 'upper';
            } else if (randomNum % 4 === 2) {
                char = numbers[randomNum % numbers.length];
                charType = 'number';
            } else {
                char = symbols[randomNum % symbols.length];
                charType = 'symbol';
            }
            
            randomNum = Math.floor(randomNum / 4);
            
        } while (
            char.toLowerCase() === lastChar.toLowerCase() || 
            (charType === lastCharType && consecutiveCount >= 2) 
        );
        
        if (charType === lastCharType) {
            consecutiveCount++;
        } else {
            consecutiveCount = 1;
        }
        
        password += char;
        lastChar = char;
        lastCharType = charType;
    }
    
    const entropy = Math.floor(Math.log2(Math.pow(charsetSize, password.length)));
    return { password, entropy, length: password.length };
}

function generatePasswords() {
    const entropyLevel = parseInt(document.getElementById('entropyLevel').value);
    const passwordList = document.getElementById('passwordList');
    
    const existingCopyOptions = document.querySelector('.copy-options-container');
    if (existingCopyOptions) {
        existingCopyOptions.remove();
    }
    
    passwordList.innerHTML = '';
    
    const passwords = Array.from({ length: 10 }, () => generatePassword(entropyLevel));
    
    const copyOptionsContainer = document.createElement('div');
    copyOptionsContainer.className = 'row justify-content-center mb-3 mt-4 copy-options-container';
    copyOptionsContainer.innerHTML = `
        <div class="col-auto">
            <button class="btn btn-primary me-2" onclick="copyRandomPassword()">Copy Random Password</button>
            <button class="btn btn-primary" onclick="copyAllPasswords()">Copy All Passwords</button>
        </div>
    `;
    passwordList.parentElement.insertBefore(copyOptionsContainer, passwordList);
    
    passwords.forEach(passData => {
        const passwordItem = document.createElement('div');
        passwordItem.className = 'password-item';
        
        const passwordText = document.createElement('div');
        passwordText.className = 'password-text';
        passwordText.textContent = passData.password;
        
        const infoContainer = document.createElement('div');
        infoContainer.className = 'info-container';
        
        const lengthBadge = document.createElement('span');
        lengthBadge.className = 'badge bg-secondary';
        lengthBadge.textContent = `Length: ${passData.length}`;
        
        const entropyBadge = document.createElement('span');
        entropyBadge.className = 'badge bg-danger entropy-badge';
        entropyBadge.textContent = `${passData.entropy} bits`;
        
        const copyButton = document.createElement('button');
        copyButton.className = 'btn btn-outline-light btn-sm copy-btn';
        copyButton.textContent = 'Copy Password';
        copyButton.onclick = () => copyToClipboard(passData.password);
        
        infoContainer.appendChild(lengthBadge);
        infoContainer.appendChild(entropyBadge);
        
        passwordItem.appendChild(passwordText);
        passwordItem.appendChild(infoContainer);
        passwordItem.appendChild(copyButton);
        
        passwordList.appendChild(passwordItem);
    });
}

// Scroll to top button
window.onscroll = function() {
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        scrollToTopBtn.style.display = "block";
    } else {
        scrollToTopBtn.style.display = "none";
    }
};

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove notification after 2 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Password copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
    });
}

function copyRandomPassword() {
    const passwordItems = document.querySelectorAll('.password-text');
    if (passwordItems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * passwordItems.length);
    const randomPassword = passwordItems[randomIndex].textContent;
    copyToClipboard(randomPassword);
}

function copyAllPasswords() {
    const passwordItems = document.querySelectorAll('.password-text');
    if (passwordItems.length === 0) return;
    const allPasswords = Array.from(passwordItems)
        .map(item => item.textContent)
        .join('\n');
    copyToClipboard(allPasswords);
}

const styles = document.createElement('style');
styles.textContent = `
    #scrollToTopBtn {
        display: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99;
        border: none;
        outline: none;
        background-color: #007bff;
        color: white;
        cursor: pointer;
        padding: 15px;
        border-radius: 50%;
        font-size: 18px;
        transition: opacity 0.3s;
    }

    #scrollToTopBtn:hover {
        background-color: #0056b3;
    }

    .copy-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }

    .copy-notification.fade-out {
        opacity: 0;
        transition: opacity 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(styles);

const scrollButton = document.createElement('button');
scrollButton.id = 'scrollToTopBtn';
scrollButton.innerHTML = 'Top';
scrollButton.onclick = scrollToTop;
document.body.appendChild(scrollButton); 