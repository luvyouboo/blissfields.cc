const API_URL = 'https://name.urname.workers.dev/api/nowplaying';
const POLL_MS = 30_000; // refresh every 30s

// Elements
const els = {
  albumArt:    document.getElementById('album-art'),
  trackName:   document.getElementById('track-name'),
  trackArtist: document.getElementById('track-artist'),
  trackAlbum:  document.getElementById('track-album'),
  progressBar: document.getElementById('progress-bar'),
  sectionLabel: document.querySelector('#now-playing-wrap .section-label'),
};

async function fetchNowPlaying() {
  try {
    const res  = await fetch(API_URL);
    if (!res.ok) return;
    const data = await res.json();

    // Section label — swap between "Now Playing" and "Recently Listened To"
    els.sectionLabel.textContent = data.nowPlaying
      ? 'Now Playing'
      : 'Recently Listened To';

    els.trackName.textContent   = data.name   || '—';
    els.trackArtist.textContent = data.artist ? `by ${data.artist}` : '';
    els.trackAlbum.textContent  = data.album  ? `on ${data.album}`  : '';

    if (data.art) {
      els.albumArt.src = 'img/404.png';
      const tmp = new Image();
      tmp.onload  = () => { els.albumArt.src = data.art; };
      tmp.onerror = () => { els.albumArt.src = 'img/404.png'; };
      tmp.src = data.art;
    } else {
      els.albumArt.src = 'img/404.png';
    }

    if (data.nowPlaying) {
      els.progressBar.style.transition = 'none';
      els.progressBar.style.width      = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          els.progressBar.style.transition = `width ${POLL_MS}ms linear`;
          els.progressBar.style.width      = '100%';
        });
      });
    } else {
      // Static bar at ~30% to hint at a past track
      els.progressBar.style.transition = 'width 0.6s ease';
      els.progressBar.style.width      = '100%';
    }

  } catch (err) {
    console.warn('[lastfm] fetch failed:', err);
  }
}

// Init
fetchNowPlaying();
setInterval(fetchNowPlaying, POLL_MS);