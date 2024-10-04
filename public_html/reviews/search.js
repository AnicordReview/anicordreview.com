document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector("#search-bar");
    const titleDropdown = document.querySelector("#filter-anime");
    const seasonDropdown = document.querySelector("#filter-season");
    const typeDropdown = document.querySelector("#filter-type");
    const authorDropdown = document.querySelector("#filter-author");
    const nsfwCheckbox = document.querySelector("#filter-nsfw");
    const mediumDropdown = document.querySelector("#filter-medium");
    const reviewsGrid = document.querySelector("#reviews-container");

    fetch('reviews.json')
        .then(response => response.json())
        .then(reviews => {
            populateDropdowns(reviews); 
            renderReviews(reviews.filter(review => !review.nsfw));

            searchBar.addEventListener("input", () => filterReviews(reviews));
            titleDropdown.addEventListener("change", () => filterReviews(reviews));
            seasonDropdown.addEventListener("change", () => filterReviews(reviews));
            typeDropdown.addEventListener("change", () => filterReviews(reviews));
            authorDropdown.addEventListener("change", () => filterReviews(reviews));
            nsfwCheckbox.addEventListener("change", () => filterReviews(reviews));
            mediumDropdown.addEventListener("change", () => filterReviews(reviews));
        })
        .catch(error => console.error("error test123", error));

    function renderReviews(reviews) {
        reviewsGrid.innerHTML = "";
        reviews.forEach(review => {
        const reviewCard = `
            <div class="review-card">
                <img src="${review.image}" alt="${review.title}">
                <h3>${review.title}</h3>
                <h4 class="review-author">${review.author}</h4> 
                <p>${review.description}</p> 
                <a href="${review.link}" class="read-more">Read more</a>
            </div>
        `;
        reviewsGrid.innerHTML += reviewCard;
    });
}


    function filterReviews(reviews) {
        const searchText = searchBar.value.toLowerCase();
        const selectedTitle = titleDropdown.value;
        const selectedSeason = seasonDropdown.value;
        const selectedType = typeDropdown.value;
        const selectedAuthor = authorDropdown.value;
        const selectedMedium = mediumDropdown.value;
        const showNSFW = nsfwCheckbox.checked;

        const filteredReviews = reviews.filter(review => {
            const matchesTitle = selectedTitle === "All" || review.animeTitle === selectedTitle;
            const matchesSeason = selectedSeason === "All" || review.season === selectedSeason;
            const matchesType = selectedType === "All" || review.type === selectedType;
            const matchesAuthor = selectedAuthor === "All" || review.author === selectedAuthor;
            const matchesMedium = selectedMedium === "All" || review.medium === selectedMedium;
            const matchesNSFW = showNSFW || !review.nsfw; 
            const matchesSearch = review.title.toLowerCase().includes(searchText) || review.author.toLowerCase().includes(searchText);

            return matchesTitle && matchesSeason && matchesType && matchesAuthor && matchesMedium && matchesNSFW && matchesSearch;
        });

        renderReviews(filteredReviews);
    }

    function populateDropdowns(reviews) {
        const uniqueTitles = new Set();
        const uniqueSeasons = new Set();
        const uniqueTypes = new Set();
        const uniqueMediums = new Set();
        const uniqueAuthors = new Set();

        reviews.forEach(review => {
            uniqueTitles.add(review.animeTitle);
            uniqueSeasons.add(review.season);
            uniqueTypes.add(review.type);
            uniqueMediums.add(review.medium);
            uniqueAuthors.add(review.author);
        });

        titleDropdown.innerHTML = '<option value="All">All Series</option>';
        uniqueTitles.forEach(title => {
            titleDropdown.innerHTML += `<option value="${title}">${title}</option>`;
        });

        seasonDropdown.innerHTML = '<option value="All">All Seasons</option>';
        uniqueSeasons.forEach(season => {
            seasonDropdown.innerHTML += `<option value="${season}">${season}</option>`;
        });

        typeDropdown.innerHTML = '<option value="All">All Types</option>';
        uniqueTypes.forEach(type => {
            typeDropdown.innerHTML += `<option value="${type}">${type}</option>`;
        });
      
        mediumDropdown.innerHTML = '<option value="All">All Mediums</option>';
        uniqueMediums.forEach(medium => {
            mediumDropdown.innerHTML += `<option value="${medium}">${medium}</option>`;
        });
        authorDropdown.innerHTML = '<option value="All">All Authors</option>';
        uniqueAuthors.forEach(author => {
            authorDropdown.innerHTML += `<option value="${author}">${author}</option>`;
        });
    }
});
