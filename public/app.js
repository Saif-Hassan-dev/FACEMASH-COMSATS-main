let users = [];
let selectedPicId = null;
let isAdmin = false;

// Fetch users from server
async function fetchUsers() {
    const res = await fetch('/api/users');
    users = await res.json();
}

// Get two random users
function getRandomPair() {
    if (users.length < 2) return [];
    let idx1 = Math.floor(Math.random() * users.length);
    let idx2;
    do {
        idx2 = Math.floor(Math.random() * users.length);
    } while (idx1 === idx2);
    return [users[idx1], users[idx2]];
}

// Render images
function renderImages() {
    const pair = getRandomPair();
    const container = document.getElementById('image-container');
    selectedPicId = null;
    document.getElementById('vote-button').disabled = true;

    if (pair.length < 2) {
        container.innerHTML = '<p style="text-align:center;">Not enough users to vote. Please upload more!</p>';
        return;
    }
    const [img1, img2] = pair;
    container.innerHTML = `
        <div class="pic-card" data-id="${img1.id}">
            <img src="${img1.imageUrl}" alt="${img1.name}" class="vote-img" style="cursor:pointer;">
            <div class="pic-name">${img1.name}</div>
        </div>
        <div class="pic-card" data-id="${img2.id}">
            <img src="${img2.imageUrl}" alt="${img2.name}" class="vote-img" style="cursor:pointer;">
            <div class="pic-name">${img2.name}</div>
        </div>
    `;

    // Add click listeners to images for selection
   document.querySelectorAll('.pic-card').forEach(card => {
    card.onclick = function() {
        document.querySelectorAll('.pic-card').forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        selectedPicId = this.getAttribute('data-id');
        document.getElementById('vote-button').disabled = false;
    };
});
}

// Handle upload
document.getElementById('upload-form').onsubmit = async function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('upload-image');
    const nameInput = document.getElementById('upload-name');
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('name', nameInput.value);

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });
    if (res.ok) {
        await fetchUsers();
        renderImages();
        renderLeaderboard(); 
        this.reset();
        document.getElementById('upload-section').style.display = 'none';
        document.getElementById('show-upload-btn').style.display = 'block';
    }
};

// Show upload section
document.getElementById('show-upload-btn').onclick = function() {
    document.getElementById('upload-section').style.display = 'block';
    this.style.display = 'none';
};

// Admin login UI toggle
function setupAdminLoginToggle() {
    const showBtn = document.getElementById('show-admin-login-btn');
    const loginSection = document.getElementById('admin-login-section');
    showBtn.onclick = function() {
        loginSection.style.display = loginSection.style.display === 'block' ? 'none' : 'block';
    };
    // Hide login section if clicked outside
    document.addEventListener('click', function(e) {
        if (!loginSection.contains(e.target) && e.target !== showBtn) {
            loginSection.style.display = 'none';
        }
    });
}

// Initial load
window.onload = async function() {
    await fetchUsers();
    renderImages();
    renderLeaderboard(); 
    setupAdminUI();
    setupAdminLoginToggle();
};

// Handle image selection and voting
document.getElementById('voting-section').onclick = async function(e) {
    if (e.target.id === 'vote-button' && selectedPicId) {
        await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ winnerId: selectedPicId })
        });
        await fetchUsers();
        renderImages();
        renderLeaderboard(); 
    }
};

// FOR SKKIPING VOTE
document.getElementById('skip-button').onclick = function() {
    // Animate fade out for both cards
    document.querySelectorAll('.pic-card').forEach(card => card.classList.add('fade-out'));
    // Wait for animation, then show new pair
    setTimeout(() => {
        renderImages();
        selectedPicId = null;
        document.getElementById('vote-button').disabled = true;
    }, 500); // Match the CSS transition duration
};

// Handle image preview on upload
document.getElementById('upload-image').onchange = function(event) {
    const preview = document.getElementById('preview-img');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
};

document.getElementById('close-upload-btn').onclick = function() {
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('show-upload-btn').style.display = 'block';
};

// Admin UI logic
function setupAdminUI() {
    const loginBtn = document.getElementById('admin-login-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const status = document.getElementById('admin-status');
    loginBtn.onclick = async function() {
        const pwd = document.getElementById('admin-password').value;
        const resp = await fetch('/api/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        if (resp.ok) {
            isAdmin = true;
            status.textContent = 'Admin logged in';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            document.getElementById('admin-password').style.display = 'none';
            document.getElementById('admin-login-section').style.display = 'none';
            renderLeaderboard();
        } else {
            const err = await resp.json();
            status.textContent = err.error || 'Wrong password';
            setTimeout(() => status.textContent = '', 2000);
        }
    };
    logoutBtn.onclick = function() {
        isAdmin = false;
        status.textContent = '';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        document.getElementById('admin-password').style.display = 'inline-block';
        renderLeaderboard();
    };
}

// rendering leaderboard
async function renderLeaderboard() {
    const res = await fetch('/api/leaderboard');
    const users = await res.json();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = users.map(
    (u, i) => `<li style="margin:12px 0;font-size:1.2em;">
        <strong>#${i+1}</strong> ${u.name} <span style="float:right;">${u.votes} votes</span> ${isAdmin ? `<button class=\"delete-user-btn\" data-id=\"${u.id}\" style=\"margin-left:10px; color:#fff; background:#d9534f; border:none; border-radius:4px; padding:2px 8px; cursor:pointer; font-size:0.9em;\">Delete</button>` : ''}
    </li>`
).join('');
    // Add event listeners for delete buttons if admin
    if (isAdmin) {
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.onclick = async function() {
                if (confirm('Are you sure you want to delete this user?')) {
                    const resp = await fetch('/api/delete-user', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: btn.getAttribute('data-id') })
                    });
                    if (resp.ok) {
                        await fetchUsers();
                        renderImages();
                        renderLeaderboard();
                    } else {
                        let msg = 'Failed to delete user.';
                        try {
                            const err = await resp.json();
                            if (err && err.error) msg = err.error;
                        } catch {}
                        alert(msg);
                    }
                }
            };
        });
    }
}