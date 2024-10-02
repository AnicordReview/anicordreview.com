function revealOnScroll() {
    const fadeIns = document.querySelectorAll('.fade-in');
    const windowHeight = window.innerHeight;

    fadeIns.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const offset = 150; 

        if (elementTop < windowHeight - offset) {
            element.classList.add('show');
        }
    });
}

//hallo
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);
