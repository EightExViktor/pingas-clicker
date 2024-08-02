// Autoplay bg music after first interaction with the page
document.addEventListener('click', _ => {
  const bgAudio = document.querySelector('#victory')
  bgAudio.play();
  bgAudio.addEventListener('pause', e => e.target.play());
}, { once: true });