document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener("scroll", revealOnScroll);
    window.addEventListener("load", revealOnScroll);
    
    fetch('reviews/reviews.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('test126352718');
            }
            return response.json();
        })
        .then(reviews => {
            const latestReviews = [reviews[2], reviews[1]]; 
            const leftReviewCard = document.getElementById('latest-review-left');
            leftReviewCard.innerHTML = `
                <img src="${latestReviews[0].image}" alt="${latestReviews[0].animeTitle}">
                <h3>${latestReviews[0].title}</h3>
                <p>Author: ${latestReviews[0].author}</p>
                <p>${latestReviews[0].description}</p>
                <a href="${latestReviews[0].link}" class="read-more">Read more</a>
            `;

            const rightReviewCard = document.getElementById('latest-review-right');
            rightReviewCard.innerHTML = `
                <img src="${latestReviews[1].image}" alt="${latestReviews[1].animeTitle}">
                <h3>${latestReviews[1].title}</h3>
                <p>Author: ${latestReviews[1].author}</p>
                <p>${latestReviews[1].description}</p>
                <a href="${latestReviews[1].link}" class="read-more">Read more</a>
            `;
        })
        .catch(error => {
            console.error('error geting json beep bop', error);
        });
});

function revealOnScroll() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('show');
        } else {
            element.classList.remove('show');
        }
    });
}
