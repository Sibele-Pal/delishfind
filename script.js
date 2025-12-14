document.addEventListener("DOMContentLoaded", () => {

  const apiKey = "ff8bd95ae29c45f6b0f6fa4178c1cda7";

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");
  const regionFilter = document.getElementById("region-filter");
  const recipeList = document.getElementById("recipe-list");
  const favoritesList = document.getElementById("favorites-list");

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) {
      recipeList.innerHTML = "<p style='text-align:center'>Enter a search term</p>";
      return;
    }
    fetchRecipes(query, regionFilter.value);
  });

  async function fetchRecipes(query, region) {
    recipeList.innerHTML = "<p style='text-align:center'>Loading...</p>";
    const cuisine = region ? `&cuisine=${region}` : "";

    try {
      const res = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${query}${cuisine}&number=6&addRecipeInformation=true&addRecipeNutrition=true&apiKey=${apiKey}`
      );
      const data = await res.json();
      displayRecipes(data.results || []);
    } catch {
      recipeList.innerHTML = "<p style='text-align:center'>API Error</p>";
    }
  }

  function displayRecipes(recipes) {
    recipeList.innerHTML = recipes.map(r => {
      const calories =
        r.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || "N/A";

      let fullText = "Procedure not available.";
      if (r.analyzedInstructions?.length) {
        fullText = r.analyzedInstructions[0].steps.map(s => s.step).join(" ");
      } else if (r.summary) {
        fullText = r.summary.replace(/<[^>]*>/g, "");
      }

      const shortText = fullText.slice(0, 120);
      const isFav = favorites.some(f => f.id === r.id);

      return `
        <div class="recipe-card">
          <img src="${r.image}">
          <h3>${r.title}</h3>

          <div class="recipe-info">
            <span>⏱ ${r.readyInMinutes} min</span>
            <span>🔥 ${calories} kcal</span>
          </div>

          <p class="procedure">
            <span id="short-${r.id}">${shortText}...</span>
            <span id="full-${r.id}" style="display:none;">${fullText}</span>
          </p>

          <button class="read-btn" onclick="toggleText(${r.id}, this)">Read more</button>

          <button class="fav-btn ${isFav ? "remove" : ""}"
            onclick="toggleFavorite(${r.id}, '${r.title.replace(/'/g,"\\'")}', '${r.image}')">
            ${isFav ? "❌ Remove Favorite" : "❤️ Add Favorite"}
          </button>
        </div>
      `;
    }).join("");
  }

  window.toggleText = (id, btn) => {
    const shortText = document.getElementById(`short-${id}`);
    const fullText = document.getElementById(`full-${id}`);

    if (fullText.style.display === "none") {
      fullText.style.display = "inline";
      shortText.style.display = "none";
      btn.textContent = "Read less";
    } else {
      fullText.style.display = "none";
      shortText.style.display = "inline";
      btn.textContent = "Read more";
    }
  };

  window.toggleFavorite = (id, title, image) => {
    const index = favorites.findIndex(f => f.id === id);

    if (index === -1) favorites.push({ id, title, image });
    else favorites.splice(index, 1);

    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();

    if (searchInput.value.trim())
      fetchRecipes(searchInput.value, regionFilter.value);
  };

  function renderFavorites() {
    if (favorites.length === 0) {
      favoritesList.innerHTML =
        "<p style='text-align:center'>No favorites yet</p>";
      return;
    }

    favoritesList.innerHTML = favorites.map(f => `
      <div class="recipe-card">
        <img src="${f.image}">
        <h3>${f.title}</h3>
        <button class="fav-btn remove"
          onclick="toggleFavorite(${f.id}, '${f.title.replace(/'/g,"\\'")}', '${f.image}')">
          ❌ Remove Favorite
        </button>
      </div>
    `).join("");
  }

  renderFavorites();
});
