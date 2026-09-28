// Aguarda todo o HTML carregar antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');

    // Controla a cor do menu ao rolar a página
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
