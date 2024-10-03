document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', function () {
        if (this.value === "All") {
            this.style.borderColor = '#ff6b81';
        } else {
            this.style.borderColor = '#333333'; 
        }
    });
    
    if (select.value === "All") {
        select.style.borderColor = '#ff6b81'; 
    } else {
        select.style.borderColor = '#333333'; 
    }
});
