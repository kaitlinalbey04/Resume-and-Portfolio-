// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  
  // Add fade animation styles for artist sections
  const style = document.createElement('style');
  style.textContent = `
    .artist-section {
      transition: opacity 0.8s ease;
    }
    
    .artist-section.fade-out {
      opacity: 0.2;
    }
    
    .artist-section.fade-in {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  const sections = document.querySelectorAll('.artist-section');
  const cards = document.querySelectorAll('.card');

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('fade-out');
          entry.target.classList.add('fade-in');
        } else {
          entry.target.classList.remove('fade-in');
          entry.target.classList.add('fade-out');
        }
      });
    }, {
      threshold: 0.3
    });

    sections.forEach(section => {
      section.classList.add('fade-in');
      sectionObserver.observe(section);
    });

    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1
    });

    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      cardObserver.observe(card);
    });
  } else {
    sections.forEach(section => section.classList.add('fade-in'));
    cards.forEach(card => card.style.opacity = '1');
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        if ('scrollBehavior' in document.documentElement.style) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        } else {
          target.scrollIntoView(true);
        }
      }
    });
  });

});