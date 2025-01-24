const pokeapi = "https://pokeapi.co/api/v2/pokemon?limit=20&offset=0";
const pokemonListContainer = document.getElementById("pokemonOptions");
const selectedPokemonContainer = document.getElementById("selected-cards");
const clearSelectionButton = document.getElementById("clear-selection");

async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const detailedPokemon = await Promise.all(
            data.results.map(async (pokemon) => {
                const res = await fetch(pokemon.url);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return await res.json();
            })
        );
        renderPokemonList(detailedPokemon);
    } catch (error) {
        console.error('Error connecting to the API:', error);
    }
}

function renderPokemonList(pokemonArray) {
    pokemonListContainer.innerHTML = "";
    pokemonArray.forEach((pokemon) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("pokemon-card");
        const statsList = pokemon.stats
            .map(stat => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
            .join("");

        pokemonCard.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" />
        <h3>${pokemon.name}</h3> 
        <ul>${statsList}</ul>
        `;

        pokemonCard.addEventListener("click", () => {
            addPokemonToSelection(pokemon);
        });

        pokemonListContainer.appendChild(pokemonCard);
    });
}


function addPokemonToSelection(pokemon) {
    let selectedPokemon = JSON.parse(localStorage.getItem("selectedPokemon")) || [];


    if (!selectedPokemon.some(p => p.id === pokemon.id)) {
        selectedPokemon.push({
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprites.front_default,
            stats: pokemon.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`)
        });
    }

    localStorage.setItem("selectedPokemon", JSON.stringify(selectedPokemon));
    renderSelectedPokemon();
}


function renderSelectedPokemon() {
    const selectedPokemon = JSON.parse(localStorage.getItem("selectedPokemon")) || [];

    selectedPokemonContainer.innerHTML = "";
    selectedPokemon.forEach((pokemon) => {
        const pokemonCard = document.createElement("div");
        pokemonCard.classList.add("selected-pokemon-card");
        const statsList = pokemon.stats
            .map(stat => `<li>${stat}</li>`)
            .join("");

        pokemonCard.innerHTML = `
        <img src="${pokemon.image}" alt="${pokemon.name}" />
        <h3>${pokemon.name}</h3>
        <ul>${statsList}</ul>
        <button class="remove-button">Eliminar</button>
        `;

        pokemonCard.querySelector(".remove-button").addEventListener("click", () => {
            removePokemonFromSelection(pokemon.id);
        });

        selectedPokemonContainer.appendChild(pokemonCard);
    });
}


function removePokemonFromSelection(pokemonId) {
    let selectedPokemon = JSON.parse(localStorage.getItem("selectedPokemon")) || [];
    selectedPokemon = selectedPokemon.filter(pokemon => pokemon.id !== pokemonId);
    localStorage.setItem("selectedPokemon", JSON.stringify(selectedPokemon));
    renderSelectedPokemon();
}


function clearAllSelectedPokemon() {
    localStorage.removeItem("selectedPokemon");
    selectedPokemonContainer.innerHTML = "";
}

function initializeApp() {
    renderSelectedPokemon();
    fetchPokemonData(pokeapi);
    clearSelectionButton.addEventListener("click", clearAllSelectedPokemon);
}

initializeApp();