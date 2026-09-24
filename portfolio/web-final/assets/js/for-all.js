let lastScrollTop = 0;
const navbar = document.querySelector('nav.primary');

window.addEventListener('scroll', function() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > lastScrollTop) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }

  lastScrollTop = scrollTop;
});

/* Had help from chat gpt on the hiding when scrolling*/