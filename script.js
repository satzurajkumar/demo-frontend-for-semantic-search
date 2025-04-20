const searchInput = document.getElementById("searchInput");
const suggestionsDropdown = document.getElementById("suggestionsDropdown");
const backendUrl = "https://search-rndr.onrender.com"; // Your backend server address /check before running/testing

let debounceTimeout;

// --- Debounce Function ---
// Limits the rate at which a function can fire.
// Useful here to prevent sending API requests on every single keystroke.
function debounce(func, delay) {
	return function (...args) {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}

// --- Function to Fetch Suggestions ---
async function fetchSuggestions(query) {
	if (query.length < 1) {
		// Don't search if input is too short
		suggestionsDropdown.style.display = "none";
		suggestionsDropdown.innerHTML = "";
		return;
	}

	try {
		// Use encodeURIComponent to handle special characters in the query
		const response = await fetch(`${backendUrl}/search`, {
			// Adding method type
			method: "POST",

			// Adding body or contents to send
			body: JSON.stringify({
				query: query,
				top_k: 2,
			}),

			// Adding headers to the request
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		});

		if (!response.ok) {
			console.error("Network response was not ok:", response.statusText);
			suggestionsDropdown.style.display = "none"; // Hide on error
			return;
		}

		const suggestions = await response.json();
		displaySuggestions(suggestions.results);
	} catch (error) {
		console.error("Error fetching suggestions:", error);
		suggestionsDropdown.style.display = "none"; // Hide on error
	}
}

// --- Function to Display Suggestions ---
function displaySuggestions(suggestions) {
	suggestionsDropdown.innerHTML = ""; // Clear previous suggestions

	if (suggestions.length === 0) {
		suggestionsDropdown.style.display = "none";
		return;
	}

	suggestions.forEach((suggestion) => {
		const suggestionItem = document.createElement("div");
		suggestionItem.textContent = suggestion.text;
		suggestionItem.addEventListener("click", () => {
			searchInput.value = suggestion; // Fill input with clicked suggestion
			suggestionsDropdown.style.display = "none"; // Hide dropdown
			suggestionsDropdown.innerHTML = ""; // Clear suggestions
			// Optional: You might want to automatically trigger a full search here
			// e.g., window.location.href = `/search?q=${encodeURIComponent(suggestion)}`;
			console.log(`Selected: ${suggestion}`);
		});
		suggestionsDropdown.appendChild(suggestionItem);
	});

	suggestionsDropdown.style.display = "block"; // Show dropdown
}

// --- Event Listener for Input ---
// Use the debounced function to fetch suggestions
const debouncedFetchSuggestions = debounce(fetchSuggestions, 400); // Adjust delay (ms) as needed

searchInput.addEventListener("input", (event) => {
	const query = event.target.value.trim();
	debouncedFetchSuggestions(query);
});

// --- Hide Dropdown When Clicking Outside ---
document.addEventListener("click", (event) => {
	// Check if the click was outside the search input and the dropdown
	if (
		!searchInput.contains(event.target) &&
		!suggestionsDropdown.contains(event.target)
	) {
		suggestionsDropdown.style.display = "none";
	}
});

// Optional: Hide dropdown on Escape key press
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		suggestionsDropdown.style.display = "none";
	}
});
