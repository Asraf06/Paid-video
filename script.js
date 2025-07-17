// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  }
  if (localStorage.getItem('darkMode') === 'true') toggleDarkMode();
  
  // Fetch Data
  async function fetchData() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    try {
      const res = await fetch('data.json');
      if (!res.ok) throw new Error('Failed to load data');
      return await res.json();
    } catch (err) {
      document.querySelector('.container').innerHTML += '<p>Error: ' + err.message + '</p>';
    } finally {
      loader.style.display = 'none';
    }
  }
  
  // Load Data Function
  async function loadData(type, subject = '', chapter = '') {
    const data = await fetchData();
    if (!data) return;
  
    let container;
    if (type === 'subjects') {
      container = document.getElementById('subjects');
      data.subjects.forEach(sub => {
        container.innerHTML += `
          <div class="card fade-in">
            <img src="1.png" style="width: 400px; height: 200px; object-fit: cover;" alt="Image">
            <div class="card-body">
              <h3>${sub.name}</h3>
              <a href="subject.html?subject=${encodeURIComponent(sub.name)}" class="btnn-view">View Chapters</a>
            </div>
          </div>
        `;
      });
    } else if (type === 'chapters') {
      container = document.getElementById('chapters');
      const subData = data.subjects.find(s => s.name === subject);
      if (!subData) return;
      subData.chapters.forEach(chap => {
        container.innerHTML += `
          <div class="card fade-in">
            <img src="pngaaa.com-3432347 (1).png" style="width: 100px; height: 200px; object-fit: cover;" alt="Image">
            <div class="card-body">
              <h3>${chap.name}</h3>
              <a href="chapter.html?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chap.name)}" class="btnn-view">View Videos</a>
            </div>
          </div>
        `;
      });
    } else if (type === 'videos') {
      container = document.getElementById('videos');
      const subData = data.subjects.find(s => s.name === subject);
      if (!subData) return;
      const chapData = subData.chapters.find(c => c.name === chapter);
      if (!chapData) return;
  
      const watched = JSON.parse(localStorage.getItem('watched') || '[]');
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const totalVideos = chapData.videos.length;
      let watchedCount = 0;
  
      chapData.videos.forEach((vid, index) => {
        const isWatched = watched.includes(vid.link);
        const isFavorite = favorites.some(f => f.link === vid.link);
        if (isWatched) watchedCount++;
        container.innerHTML += `
          <div class="card fade-in">
            <img src="${vid.thumbnail}" alt="${vid.topic}">
            <div class="card-body">
              <h3>${index + 1}. ${vid.topic}</h3>
              <a href="video.html?link=${encodeURIComponent(vid.link)}" class="btnn">Play Video</a>
              <span class="icon watched ${isWatched ? 'active' : ''}" onclick="toggleWatched('${vid.link}', this)">✔️</span>
              <span class="icon favorite ${isFavorite ? 'active' : ''}" onclick="toggleFavorite({topic: '${vid.topic}', thumbnail: '${vid.thumbnail}', link: '${vid.link}'}, this)">❤️</span>
            </div>
          </div>
        `;
      });
  
      const progress = (watchedCount / totalVideos) * 100;
      document.getElementById('progressFill').style.width = `${progress}%`;
    }
  }
  
  // Search Function
  function searchItems(query, type) {
    const items = document.querySelectorAll(`#${type} .card`);
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
    });
  }
  
  // Progress Tracking
  function toggleWatched(link, element) {
    let watched = JSON.parse(localStorage.getItem('watched') || '[]');
    if (watched.includes(link)) {
      watched = watched.filter(l => l !== link);
      element.classList.remove('active');
    } else {
      watched.push(link);
      element.classList.add('active');
    }
    localStorage.setItem('watched', JSON.stringify(watched));
    // Update progress if on chapter page
    if (document.getElementById('progressFill')) location.reload();
  }
  
  function markAsWatched(link) {
    let watched = JSON.parse(localStorage.getItem('watched') || '[]');
    if (!watched.includes(link)) {
      watched.push(link);
      localStorage.setItem('watched', JSON.stringify(watched));
    }
  }
  
  // Favorites
  function toggleFavorite(video, element) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(f => f.link === video.link);
    if (index > -1) {
      favorites.splice(index, 1);
      element.classList.remove('active');
    } else {
      favorites.push(video);
      element.classList.add('active');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  
  async function loadFavorites() {
    const container = document.getElementById('favorites');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (favorites.length === 0) {
      container.innerHTML = '<p>No favorites yet.</p>';
      return;
    }
    favorites.forEach(vid => {
      container.innerHTML += `
        <div class="card fade-in">
          <img src="${vid.thumbnail}" alt="${vid.topic}">
          <div class="card-body">
            <h3>${vid.topic}</h3>
            <a href="video.html?link=${encodeURIComponent(vid.link)}" class="btn">Play Video</a>
            <span class="icon favorite active" onclick="toggleFavorite({link: '${vid.link}'}, this)">❤️</span>
          </div>
        </div>
      `;
    });
  }