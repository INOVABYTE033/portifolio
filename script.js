```javascript
// ==============================
// MENU E NAVEGAÇÃO
// ==============================

document.querySelectorAll('nav a').forEach(link => {

    link.addEventListener('click', function () {

        const destino = this.getAttribute('href');

        if (destino.startsWith('#')) {

            const elemento = document.querySelector(destino);

            if (elemento) {
                elemento.scrollIntoView({
                    behavior: 'smooth'
                });
            }

        }

    });

});


// ==============================
// EFEITO AO ROLAR A PÁGINA
// ==============================

window.addEventListener('scroll', function () {

    const header = document.querySelector('header');

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

});


// ==============================
// ANIMAÇÃO DAS SEÇÕES
// ==============================

const secoes = document.querySelectorAll('section');

const observador = new IntersectionObserver((entradas) => {

    entradas.forEach(entrada => {

        if (entrada.isIntersecting) {
            entrada.target.classList.add('visivel');
        }

    });

}, {
    threshold: 0.15
});


secoes.forEach(secao => {
    observador.observe(secao);
});
```
