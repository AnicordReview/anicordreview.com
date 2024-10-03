document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', function() {
        const allOptions = this.querySelectorAll('option');
        allOptions.forEach(option => {
            if (option.value === "All") {
                option.style.color = "#ff6b81";
            } else {
                option.style.color = "#333333";
            }
        });
        this.style.borderColor = this.value === "All" ? "#ff6b81" : "#000000";
    });
});
