// change nav style on scroll
    window.addEventListener('scroll', () => {
      document.querySelector('nav').classList.toggle('window-scrolled', window.scrollY > 0);
    });

    // CONTACT BUTTONS (circular text buttons)
    const textButtons = document.querySelectorAll('.contact__btn');

    textButtons.forEach(textButton => {
      let text = textButton.querySelector('p');

      text.innerHTML = text.innerHTML.split('').map((character, index) => `<span style="transform: rotate(${index * 12}deg)">${character}</span>`).join('');
    });

    // Swiper.js
    // const swiper = new Swiper(".mySwiper", {
    //   slidesPerView: 1,
    //   spaceBetween: 20,
    //   pagination: {
    //     el: ".swiper-pagination",
    //     clickable: true,
    //   },
    //   breakpoints: {
    //     599: {
    //       slidesPerView: 2,
    //       spaceBetween: 40
    //     },
    //     1023: {
    //       slidesPerView: 3,
    //       spaceBetween: 60
    //     }
    //   }
    // });

    const openBtn = document.querySelector('#nav__toggle-open'),
          closeBtn = document.querySelector('#nav__toggle-close'),
          links = document.querySelector('.nav__links');

    const openNav = () => {
      links.style.display = 'flex';
      openBtn.style.display = 'none';
      closeBtn.style.display = 'inline-block';
    };

    const closeNav = () => {
        links.style.display = 'none';
        openBtn.style.display = 'inline-block';
        closeBtn.style.display = 'none';
    };

    openBtn.addEventListener('click', openNav);
    closeBtn.addEventListener('click', closeNav);

    links.querySelectorAll('li a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    new Slider(document.getElementById('slider'), {margin: 10});
    // new Slider(document.getElementById('slider'));





