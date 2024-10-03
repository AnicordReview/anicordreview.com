document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', function () {
        const options = this.options;
        for (let i = 0; i < options.length; i++) {
            options[i].style.color = '#333333'; 
        }
        options[this.selectedIndex].style.color = '#333333';
    });

    const options = select.options;
    for (let i = 0; i < options.length; i++) {
        options[i].style.color = '#333333'; 
    }
});
