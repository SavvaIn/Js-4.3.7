const searchInput = document.querySelector("#formData");
let isWaiting = true;
const apiUrl = "https://api.github.com/search/repositories";
const resultContainer = document.getElementById("searchResult");
const savedContainer = document.getElementById("savedResult");

searchInput.addEventListener("input", debounce);

function debounce() {
  if (isWaiting) {
    isWaiting = false;
    setTimeout(() => (isWaiting = true), 400);
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
      fetchGitHubData(searchTerm);
    } else {
      clearResults(resultContainer);
    }
  }
}

function fetchGitHubData(searchTerm) {
  const url = `${apiUrl}?q=${searchTerm}&per_page=5`;

  fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const results = data.items;
      if (!results) {
        throw new Error("Превышен лимит запросов");
      }
      if (results.length === 0) {
        throw new Error("Репозиторий с таким именем не найден");
      }

      clearResults(resultContainer);

      for (const result of results) {
        const button = document.createElement("button");
        button.textContent = result.name;
        button.classList.add("search-result__button");
        button.addEventListener("click", () => {
          displaySavedResult(result);
        });
        resultContainer.appendChild(button);
      }
    })
    .catch((error) => {
      searchInput.value = "";
      clearResults(resultContainer);
      displayError(error.message);
    });
}

function displaySavedResult(result) {
  const section = document.createElement("section");
  const savedBlock = document.createElement("div");
  const closeButton = document.createElement("button");

  savedBlock.classList.add("saved-block");
  savedBlock.innerHTML = `
    Name: ${result.name}<br>Owner: ${result.owner.login}<br>Stars: ${result.stargazers_count}
  `;

  closeButton.classList.add("cross");
  closeButton.addEventListener("click", () => {
    section.remove();
  });

  section.classList.add("section");
  section.appendChild(savedBlock);
  section.appendChild(closeButton);

  savedContainer.appendChild(section);

  clearResults(resultContainer);
  searchInput.value = "";
}

function displayError(errorMessage) {
  const errorMessageElement = document.createElement("p");
  errorMessageElement.textContent = errorMessage;
  resultContainer.appendChild(errorMessageElement);
}

function clearResults(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

savedContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (target.tagName === "BUTTON" && target.classList.contains("cross")) {
    target.parentNode.remove();
  }
});
