// Örnek veri yapısı
let depoData = JSON.parse(localStorage.getItem('depoData')) || {
    depo1: [
        {
            siraNo: "1",
            emanetNo: "2023/1",
            dolapNo: "A1",
            rafNo: "R1",
            notlar: "Örnek kayıt 1"
        }
    ],
    depo2: [],
    feto: [],
    eskiFeto: [],
    buro: []
};

// Aktif depo
let activeDepo = 'depo1';

// Modal elementleri
const editModal = document.getElementById('editModal');
const addModal = document.getElementById('addModal');
const closeButtons = document.getElementsByClassName('close');
const editForm = document.getElementById('editForm');
const addForm = document.getElementById('addForm');
const themeSwitch = document.querySelector('.theme-switch__checkbox');
const searchInput = document.getElementById('searchInput');

// Tema değiştirme ve kaydetme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'dark';

themeSwitch.addEventListener('change', () => {
    const newTheme = themeSwitch.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Arama event listener'ı
searchInput.addEventListener('input', search);

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

// Form doğrulama fonksiyonu
function validateForm(formData) {
    for (let [key, value] of Object.entries(formData)) {
        if (!value || value.trim() === '') {
            showNotification(`${key} alanı boş bırakılamaz!`, true);
            return false;
        }
    }
    return true;
}

// Veriyi localStorage'a kaydet
function saveToLocalStorage() {
    localStorage.setItem('depoData', JSON.stringify(depoData));
}

// Depo görüntüleme fonksiyonu
function showDepo(depoName) {
    activeDepo = depoName;
    
    // Tüm butonlardan active sınıfını kaldır
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Tıklanan butona active sınıfını ekle
    document.querySelector(`button[onclick="showDepo('${depoName}')"]`).classList.add('active');
    
    // Depo Adı sütununu gizle
    document.getElementById('depoAdiHeader').style.display = 'none';
    
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    depoData[depoName].forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.siraNo}</td>
            <td>${item.emanetNo}</td>
            <td>${item.dolapNo}</td>
            <td>${item.rafNo}</td>
            <td>${item.notlar}</td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            row.style.transform = 'scale(0.98)';
            setTimeout(() => {
                row.style.transform = 'scale(1)';
                editItem(index);
            }, 150);
        });
        
        tableBody.appendChild(row);
    });
}

// Bütün emanetleri görüntüleme fonksiyonu
function showAllItems() {
    // Tüm butonlardan active sınıfını kaldır
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Bütün Emanetler butonuna active sınıfını ekle
    document.querySelector('button[onclick="showAllItems()"]').classList.add('active');
    
    // Depo Adı sütununu göster
    document.getElementById('depoAdiHeader').style.display = '';
    
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Tüm depolardaki verileri birleştir
    const allItems = Object.entries(depoData).reduce((acc, [depoName, items]) => {
        return acc.concat(items.map(item => ({...item, depoAdi: depoName})));
    }, []);

    // Verileri sıra numarasına göre sırala
    allItems.sort((a, b) => a.siraNo.localeCompare(b.siraNo, undefined, {numeric: true}));

    if (allItems.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">Kayıt bulunamadı</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    allItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.siraNo}</td>
            <td>${item.emanetNo}</td>
            <td>${item.dolapNo}</td>
            <td>${item.rafNo}</td>
            <td>${item.notlar}</td>
            <td>${formatDepoName(item.depoAdi)}</td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            row.style.transform = 'scale(0.98)';
            setTimeout(() => {
                row.style.transform = 'scale(1)';
                editItemFromAll(item.depoAdi, findItemIndex(item));
            }, 150);
        });
        
        tableBody.appendChild(row);
    });
}

// Depo adını formatla
function formatDepoName(depoName) {
    const depoNames = {
        'depo1': 'Depo 1',
        'depo2': 'Depo 2',
        'feto': 'Fetö',
        'eskiFeto': 'Eski Fetö',
        'buro': 'Büro'
    };
    return depoNames[depoName] || depoName;
}

// Tüm emanetler listesinden düzenleme için item index'ini bul
function findItemIndex(targetItem) {
    return depoData[targetItem.depoAdi].findIndex(item => 
        item.siraNo === targetItem.siraNo && 
        item.emanetNo === targetItem.emanetNo
    );
}

// Tüm emanetler listesinden düzenleme
function editItemFromAll(depoName, index) {
    activeDepo = depoName;
    editItem(index);
}

// Arama fonksiyonu
function search() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Bütün Emanetler seçili ise
    if (document.querySelector('button[onclick="showAllItems()"]').classList.contains('active')) {
        const allItems = Object.entries(depoData).reduce((acc, [depoName, items]) => {
            return acc.concat(items.map(item => ({
                ...item, 
                depoAdi: depoName,
                formattedDepoName: formatDepoName(depoName) // Formatlanmış depo adını ekle
            })));
        }, []);

        const filteredData = allItems.filter(item =>
            Object.values(item).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchText);
                }
                return false;
            }) || formatDepoName(item.depoAdi).toLowerCase().includes(searchText) // Formatlanmış depo adında da ara
        );

        if (filteredData.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">Sonuç bulunamadı</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }

        filteredData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.siraNo}</td>
                <td>${item.emanetNo}</td>
                <td>${item.dolapNo}</td>
                <td>${item.rafNo}</td>
                <td>${item.notlar}</td>
                <td>${formatDepoName(item.depoAdi)}</td>
            `;
            
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => {
                row.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    row.style.transform = 'scale(1)';
                    editItemFromAll(item.depoAdi, findItemIndex(item));
                }, 150);
            });
            
            tableBody.appendChild(row);
        });
        return;
    }

    // Tek depo seçili ise mevcut arama fonksiyonu
    if (!depoData[activeDepo]) {
        showNotification('Depo verisi bulunamadı!', true);
        return;
    }

    const filteredData = depoData[activeDepo].filter(item => 
        Object.values(item).some(value => {
            if (typeof value === 'string') {
                return value.toLowerCase().includes(searchText);
            }
            return false;
        })
    );

    if (filteredData.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" style="text-align: center;">Sonuç bulunamadı</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.siraNo}</td>
            <td>${item.emanetNo}</td>
            <td>${item.dolapNo}</td>
            <td>${item.rafNo}</td>
            <td>${item.notlar}</td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
            row.style.transform = 'scale(0.98)';
            setTimeout(() => {
                row.style.transform = 'scale(1)';
                editItem(index);
            }, 150);
        });
        
        tableBody.appendChild(row);
    });
}

// Düzenleme modalını aç
function editItem(index) {
    const item = depoData[activeDepo][index];
    document.getElementById('siraNo').value = item.siraNo;
    document.getElementById('emanetNo').value = item.emanetNo;
    document.getElementById('dolapNo').value = item.dolapNo;
    document.getElementById('rafNo').value = item.rafNo;
    document.getElementById('notlar').value = item.notlar;
    
    editModal.style.display = 'block';
    editForm.onsubmit = (e) => {
        e.preventDefault();
        saveEdit(index);
    };
}

// Düzenlemeyi kaydet
function saveEdit(index) {
    const formData = {
        siraNo: document.getElementById('siraNo').value,
        emanetNo: document.getElementById('emanetNo').value,
        dolapNo: document.getElementById('dolapNo').value,
        rafNo: document.getElementById('rafNo').value,
        notlar: document.getElementById('notlar').value
    };

    if (!validateForm(formData)) return;

    try {
        depoData[activeDepo][index] = formData;
        saveToLocalStorage();
        editModal.style.display = 'none';
        
        // Bütün Emanetler görünümündeyse, o görünüme geri dön
        if (document.querySelector('button[onclick="showAllItems()"]').classList.contains('active')) {
            showAllItems();
        } else {
            showDepo(activeDepo);
        }
        
        showNotification('Kayıt başarıyla güncellendi!');
    } catch (error) {
        showNotification('Kayıt güncellenirken bir hata oluştu!', true);
        console.error('Güncelleme hatası:', error);
    }
}

// Veri ekleme modalını aç
function showAddModal() {
    addModal.style.display = 'block';
    addForm.onsubmit = (e) => {
        e.preventDefault();
        saveNewItem();
    };
}

// Veri ekleme modalını kapat
function closeAddModal() {
    addModal.style.display = 'none';
}

// Yeni veriyi kaydet
function saveNewItem() {
    const formData = {
        siraNo: document.getElementById('newSiraNo').value,
        emanetNo: document.getElementById('newEmanetNo').value,
        dolapNo: document.getElementById('newDolapNo').value,
        rafNo: document.getElementById('newRafNo').value,
        notlar: document.getElementById('newNotlar').value
    };

    if (!validateForm(formData)) return;

    try {
        if (!Array.isArray(depoData[activeDepo])) {
            depoData[activeDepo] = [];
        }
        
        depoData[activeDepo].push(formData);
        saveToLocalStorage();
        addModal.style.display = 'none';
        addForm.reset();
        
        // Bütün Emanetler görünümündeyse, o görünüme geri dön
        if (document.querySelector('button[onclick="showAllItems()"]').classList.contains('active')) {
            showAllItems();
        } else {
            showDepo(activeDepo);
        }
        
        showNotification('Yeni kayıt başarıyla eklendi!');
    } catch (error) {
        showNotification('Kayıt eklenirken bir hata oluştu!', true);
        console.error('Ekleme hatası:', error);
    }
}

// Modal kapatma olayları
Array.from(closeButtons).forEach(btn => {
    btn.onclick = function() {
        editModal.style.display = 'none';
        addModal.style.display = 'none';
    }
});

window.onclick = (event) => {
    if (event.target == editModal) {
        editModal.style.display = 'none';
    }
    if (event.target == addModal) {
        addModal.style.display = 'none';
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // İlk veriyi localStorage'a kaydet (eğer boşsa)
    if (!localStorage.getItem('depoData')) {
        saveToLocalStorage();
    }
    
    // İlk depoyu göster
    showDepo('depo1');
    
    // İlk butonu aktif olarak işaretle
    document.querySelector('button[onclick="showDepo(\'depo1\')"]').classList.add('active');
    
    // Arama input'una event listener ekle
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            search();
        });
    }
});

// Çıkış yapma fonksiyonu
function logout() {
    // Oturum bilgisini temizle
    sessionStorage.removeItem('isLoggedIn');
    
    // Bildirim göster
    showNotification('Çıkış yapılıyor...');
    
    // Login sayfasına yönlendir
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
} 