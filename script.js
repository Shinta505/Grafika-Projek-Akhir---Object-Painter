document.getElementById('currentYear').textContent = new Date().getFullYear();

// Script untuk partikel sederhana
const particleContainer = document.getElementById('particle-container');
const numParticles = 30; // Jumlah partikel

for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');

    const size = Math.random() * 15 + 5; // Ukuran partikel antara 5px dan 20px
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // Posisi acak di seluruh layar
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;

    // Durasi dan delay animasi acak untuk variasi
    particle.style.animationDuration = `${Math.random() * 10 + 15}s`; // 15-25 detik
    particle.style.animationDelay = `${Math.random() * 5}s`; // 0-5 detik

    particleContainer.appendChild(particle);
}