document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInputHomePage");
  const dropdownResults = document.getElementById("dropdownResults");
  const tagsContainer = document.getElementById("tagsContainer");

  let jsonData = {}; // To store fetched JSON data
  let selectedTags = new Set(); // To keep track of selected tags

  // Fetch JSON data
  fetch("./travel_recommendation_api.json") // Replace with actual file path
    .then((response) => response.json())
    .then((data) => {
      jsonData = data;
    })
    .catch((error) => console.error("Error loading JSON:", error));

  // Handle user input for search
  searchInput.addEventListener("keyup", function () {
    const query = searchInput.value.trim().toLowerCase();
    dropdownResults.innerHTML = "";

    if (query.length === 0) {
      dropdownResults.classList.remove("show");
      return;
    }

    let results = searchInJSON(query, jsonData);
    // console.log(results);

if (
  results["countries"].length > 0 ||
  results["beaches"].length > 0 ||
  results["temples"].length > 0
) {
  dropdownResults.innerHTML = ""; // Clear previous results

  for (const category in results) {
    results[category].forEach((item) => {
        console.log(item);
      // Handle countries separately since they contain cities
      if (category === "countries") {
        // Display the country itself
        const countryCard = document.createElement("div");
        countryCard.classList.add("city-card");

        item.cities.forEach(city => {
            countryCard.innerHTML = `
              <img src="${city.imageUrl}" alt="${city.name}">
              <div class="city-info">
                <h5>${city.name}</h5>
                <p>${city.description}.</p>
                <a href="#" data-id="${item.name + "_" + item.id}" class="btn btn-success btn-sm visitButton">Visit</a>
              </div>
            `;
    
            dropdownResults.appendChild(countryCard);
        })


        // Display all cities inside the country
        item.cities.forEach((city) => {
          const cityCard = document.createElement("div");
          cityCard.classList.add("city-card");

          cityCard.innerHTML = `
            <img src="${city.imageUrl}" alt="${city.name}">
            <div class="city-info">
              <h5>${city.name} (City in ${item.name})</h5>
              <p>${city.description || "A beautiful city in " + item.name}.</p>
              <a href="#" data-id="city_${city.id}" class="btn btn-success btn-sm visitButton">Visit</a>
            </div>
          `;

          dropdownResults.appendChild(cityCard);
        });
      } else {
        // Handle beaches & temples normally
        const card = document.createElement("div");
        card.classList.add("city-card");

        card.innerHTML = `
          <img src="${item.imageUrl}" alt="${item.name}">
          <div class="city-info">
            <h5>${item.name}</h5>
            <p>${item.description}</p>
            <a href="#" data-id="${category + "_" + item.id}" class="btn btn-success btn-sm visitButton">Visit</a>
          </div>
        `;

        dropdownResults.appendChild(card);
      }
    });
  }

  dropdownResults.classList.add("show");


    //   results.forEach((item) => {
    //     let listItem = document.createElement("a");
    //     listItem.href = "#";
    //     listItem.classList.add("dropdown-item");
    //     listItem.textContent = item;
    //     listItem.addEventListener("click", function (event) {
    //         event.preventDefault();
    //         addTag(item);
    //         searchInput.value = "";
    //         dropdownResults.classList.remove("show");
    //     });
    //     console.log(item);
    //   });

    }  else {
      dropdownResults.classList.remove("show");
    }
  });

  function searchInJSON(query, data) {
    query = query.toLowerCase().trim();
  
    let results = {
      countries: [],
      temples: [],
      beaches: []
    };
  
    // Search in countries and cities
    for (const country of data.countries || []) {
      if (country.name.toLowerCase().includes(query)) {
        // If country matches, push full country object
        results.countries.push(country);
      } else {
        // If searching for a city, only add that specific city, not the whole country
        for (const city of country.cities) {
          if (city.name.toLowerCase().includes(query)) {
            results.countries.push({
              ...country,  // Keep country info
              cities: [city] // Only include the matching city
            });
          }
        }
      }
    }
  
    // Search in temples
    for (const temple of data.temples || []) {
      if (temple.name.toLowerCase().includes(query)) {
        results.temples.push(temple);
      }
    }
  
    // Search in beaches
    for (const beach of data.beaches || []) {
      if (beach.name.toLowerCase().includes(query)) {
        results.beaches.push(beach);
      }
    }
  
    return results;
  }
  


  // Function to add tag
  function addTag(tagName) {
    if (selectedTags.has(tagName)) return; // Prevent duplicate tags
    selectedTags.add(tagName);

    let tagElement = document.createElement("span");
    tagElement.classList.add("tag");
    tagElement.textContent = tagName;

    let removeBtn = document.createElement("span");
    removeBtn.classList.add("remove-tag");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", function () {
      tagsContainer.removeChild(tagElement);
      selectedTags.delete(tagName);
    });

    tagElement.appendChild(removeBtn);
    tagsContainer.insertBefore(tagElement, searchInput);
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".input-container")) {
      dropdownResults.classList.remove("show");
    }
  });










  const postsContainer = document.querySelector("#posts .container");

  function displayPosts(posts) {
    // console.log(posts);
    postsContainer.innerHTML = ""; // Clear previous content

    if (posts.length === 0) {
        postsContainer.innerHTML = "<p class='no-results'>No posts found.</p>";
        return;
    }

    posts.forEach((post, index) => {
        const postSection = document.createElement("div");
        postSection.classList.add("post-section");

        // Create elements separately
        const imageDiv = document.createElement("div");
        imageDiv.classList.add("post-image");
        imageDiv.innerHTML = `<img src="${post.imageUrl}" alt="${post.name}">`;

        const infoDiv = document.createElement("div");
        infoDiv.classList.add("post-info");
        infoDiv.innerHTML = `<h3>${post.name}</h3><p>${post.description}</p>`;

        postSection.appendChild(imageDiv);
        postSection.appendChild(infoDiv);
        // Append elements in alternating order
        

        postsContainer.appendChild(postSection);
    });
}


  function filterAndDisplayPosts() {
    if (selectedTags.size === 0) {
      // Show everything
      let allPosts = [
        ...jsonData.beaches,
        ...jsonData.temples,
        ...jsonData.countries.flatMap((country) => country.cities),
      ];
      displayPosts(allPosts);
    } else {
      let filteredPosts = [];

      selectedTags.forEach((tag) => {
        if (jsonData[tag]) {
          filteredPosts.push(...jsonData[tag]);
        } else {
            jsonData['countries'].forEach(item => {
                if (item.name == tag) {
                    filteredPosts.push(...item.cities);
                }
            })
        }
      });
      console.log(filteredPosts);
      displayPosts(filteredPosts);
    }
  }

  // Initial display
  setTimeout(filterAndDisplayPosts, 1000); // Delay to ensure JSON loads

  // Listen for tag selection
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("visitButton")) {
      const tag = event.target.dataset.id.split("_")[0];
      addTag(tag);
      filterAndDisplayPosts();
    }
  });

  // Listen for tag removal
  document.getElementById("tagsContainer").addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-tag")) {
      filterAndDisplayPosts();
    }
  });


});

