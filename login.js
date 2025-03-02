// SHA-256 hash fonksiyonu
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Kullanıcı bilgileri (şifre hash'lenmiş durumda)
const VALID_USERNAME = 'admin';
const VALID_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // 'admin' kelimesinin SHA-256 hash'i

// Bildirim fonksiyonu
function showNotification(message, isError = false) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: isError ? "#ff4444" : "#00C851",
        }
    }).showToast();
}

// Tema değiştirme
const themeSwitch = document.querySelector('.theme-switch__checkbox');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'dark';

themeSwitch.addEventListener('change', () => {
    const newTheme = themeSwitch.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Giriş formu işleme
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Kullanıcı adı kontrolü
    if (username !== VALID_USERNAME) {
        showNotification('Geçersiz kullanıcı adı!', true);
        return;
    }
    
    // Şifre kontrolü
    const passwordHash = await sha256(password);
    if (passwordHash !== VALID_PASSWORD_HASH) {
        showNotification('Geçersiz şifre!', true);
        return;
    }
    
    // Başarılı giriş
    showNotification('Giriş başarılı! Yönlendiriliyorsunuz...');
    
    // Oturum bilgisini kaydet
    sessionStorage.setItem('isLoggedIn', 'true');
    
    // Ana sayfaya yönlendir
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}); 