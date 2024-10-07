let currentCoords = null;

const getLocationBtn = document.getElementById('getLocationBtn');
const coordsOutput = document.getElementById('coords');

getLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            currentCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            coordsOutput.textContent = `Широта: ${currentCoords.latitude}, Долгота: ${currentCoords.longitude}`;
        }, () => {
            coordsOutput.textContent = "Не удалось определить местоположение.";
        });
    } else {
        coordsOutput.textContent = "Геолокация не поддерживается вашим браузером.";
    }
});

const localStorageForm = document.getElementById('localStorageForm');
const localStorageList = document.getElementById('localStorageList');

window.onload = () => {
    loadLocalStorageData();
    loadIndexedDBData();
};

localStorageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = document.getElementById('commentInput').value;
    if (currentCoords) {
        const data = {
            comment: comment,
            coords: currentCoords
        };
        saveToLocalStorage(data);
        loadLocalStorageData();
    } else {
        alert('Пожалуйста, сначала определите местоположение.');
    }
});

function saveToLocalStorage(data) {
    const storageData = JSON.parse(localStorage.getItem('comments')) || [];
    storageData.push(data);
    localStorage.setItem('comments', JSON.stringify(storageData));
}

function loadLocalStorageData() {
    const storageData = JSON.parse(localStorage.getItem('comments')) || [];
    localStorageList.innerHTML = '';
    storageData.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `Комментарий: ${item.comment}, Широта: ${item.coords.latitude}, Долгота: ${item.coords.longitude}`;
        localStorageList.appendChild(li);
    });
}

let db;
const request = indexedDB.open('commentsDB', 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    const store = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
    store.createIndex('comment', 'comment', { unique: false });
    store.createIndex('coords', 'coords', { unique: false });
};

request.onsuccess = (e) => {
    db = e.target.result;
};

request.onerror = (e) => {
    console.error('Ошибка при работе с IndexedDB:', e.target.errorCode);
};

const indexedDBForm = document.getElementById('indexedDBForm');
const indexedDBList = document.getElementById('indexedDBList');

indexedDBForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = document.getElementById('dbCommentInput').value;
    if (currentCoords) {
        const transaction = db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        const data = {
            comment: comment,
            coords: currentCoords
        };
        store.add(data);
        loadIndexedDBData();
    } else {
        alert('Пожалуйста, сначала определите местоположение.');
    }
});

function loadIndexedDBData() {
    const transaction = db.transaction(['comments'], 'readonly');
    const store = transaction.objectStore('comments');
    const request = store.getAll();

    request.onsuccess = () => {
        indexedDBList.innerHTML = '';
        request.result.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `Комментарий: ${item.comment}, Широта: ${item.coords.latitude}, Долгота: ${item.coords.longitude}`;
            indexedDBList.appendChild(li);
        });
    };
}
