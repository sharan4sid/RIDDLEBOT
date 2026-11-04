// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get DOM elements
    const navLinks = document.querySelectorAll('.nav-link');
    const homeSection = document.getElementById('home-section');
    const gameSection = document.getElementById('game-section');
    const logoLink = document.getElementById('logo-link');

    // 2. Define navigation logic
    function showSection(sectionId) {
        // Toggle visibility of sections based on sectionId
        if (sectionId === 'home') {
            homeSection.classList.remove('hidden');
            gameSection.classList.add('hidden');
        } else if (sectionId === 'game') {
            homeSection.classList.add('hidden');
            gameSection.classList.remove('hidden');
        }

        // Update active class on navigation buttons
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 3. Attach Event Listeners to Nav Buttons
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if they were links
            const sectionId = e.currentTarget.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });

    // Logo click goes home
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('home');
        });
    }

    // 4. Initialize application state
    // Always start on Home section
    showSection('home');
});
