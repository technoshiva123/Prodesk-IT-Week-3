const profileContainer = document.getElementById('profileContainer');
const searchSection = document.getElementById('searchSection');
const battleSection = document.getElementById('battleSection');

document.getElementById('battleModeBtn').addEventListener('click', (e) => {
    searchSection.style.display = 'none';
    battleSection.style.display = 'block';
    e.target.classList.add('active-mode');
    document.getElementById('searchModeBtn').classList.remove('active-mode');
    profileContainer.innerHTML = "";
});

document.getElementById('searchModeBtn').addEventListener('click', (e) => {
    battleSection.style.display = 'none';
    searchSection.style.display = 'block';
    e.target.classList.add('active-mode');
    document.getElementById('battleModeBtn').classList.remove('active-mode');
    profileContainer.innerHTML = "";
});

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

document.getElementById('searchBtn').addEventListener('click', async () => {
    const user = document.getElementById('usernameInput').value.trim();
    if (!user) return;

    profileContainer.innerHTML = `<p>Loading...</p>`;
    try {
        const res = await fetch(`https://api.github.com/users/${user}`);
        if (!res.ok) throw new Error("User Not Found");
        const data = await res.json();

        const repoRes = await fetch(data.repos_url + "?sort=created&per_page=5");
        const repos = await repoRes.json();

        displaySingleUser(data, repos);
    } catch (err) {
        profileContainer.innerHTML = `<p style="color:var(--loser-red); margin-top:20px">${err.message}</p>`;
    }
});

function displaySingleUser(user, repos) {
    const reposHTML = repos.slice(0, 5).map(r => `
        <div style="margin-bottom: 8px;">
            <a href="${r.html_url}" target="_blank">${r.name}</a>
        </div>
    `).join('');

    profileContainer.innerHTML = `
        <div class="single-profile-card">
            <img src="${user.avatar_url}" class="avatar-large">
            <h2>${user.name || user.login}</h2>
            <a href="${user.html_url}" target="_blank" class="username-link">@${user.login}</a>
            <p style="margin: 20px 0; color: var(--text-grey); line-height: 1.6;">${user.bio || "No bio available"}</p>
            <p style="font-size: 12px; color: var(--text-grey);">Joined: ${formatDate(user.created_at)}</p>

            <div class="dashboard-stats">
                <div><span class="stat-label">Repos</span><span class="stat-val">${user.public_repos}</span></div>
                <div><span class="stat-label">Followers</span><span class="stat-val">${user.followers}</span></div>
            </div>

            <div class="latest-repos-list">
                <h4 style="margin-bottom:12px; font-size:14px;">Latest Repos:</h4>
                ${reposHTML || "No repos found"}
            </div>
        </div>
    `;
}

document.getElementById('battleBtn').addEventListener('click', async () => {
    const u1 = document.getElementById('user1Input').value.trim();
    const u2 = document.getElementById('user2Input').value.trim();
    if (!u1 || !u2) return;

    profileContainer.innerHTML = `<p>Combatants are readying...</p>`;
    try {
        const [p1, p2] = await Promise.all([
            fetch(`https://api.github.com/users/${u1}`).then(r => r.json()),
            fetch(`https://api.github.com/users/${u2}`).then(r => r.json())
        ]);

        const score1 = p1.followers + p1.public_repos;
        const score2 = p2.followers + p2.public_repos;

        profileContainer.innerHTML = `
            <div class="battle-grid">
                ${createBattleCard(p1, score1, score1 >= score2)}
                ${createBattleCard(p2, score2, score2 > score1)}
            </div>
        `;
    } catch (err) {
        profileContainer.innerHTML = `<p>Error in Battle!</p>`;
    }
});

function createBattleCard(user, score, isWinner) {
    return `
        <div class="profile-card ${isWinner ? 'winner-card' : 'loser-card'}" style="padding: 30px; border-radius: 18px; background: var(--card-bg); display: flex; flex-direction: column; align-items: center;">
            <span style="font-size:12px; font-weight:bold; margin-bottom:10px; color:${isWinner ? 'var(--winner-green)' : 'var(--loser-red)'}">
                ${isWinner ? '🏆 WINNER' : '💀 DEFEATED'}
            </span>
            <img src="${user.avatar_url}" style="width:80px; border-radius:50%; margin-bottom:15px;">
            <h3>${user.login}</h3>
            <div style="background:var(--bg-dark); width:100%; padding:15px; border-radius:10px; margin-top:15px; font-size:14px;">
                <p>Power Level: <b>${score}</b></p>
                <p style="color:var(--text-grey); margin-top:5px;">Followers: ${user.followers}</p>
            </div>
        </div>
    `;
}