document.addEventListener('DOMContentLoaded', function() {
    // Event listener for "Live Bets" link
    document.querySelector('.live-bets-link').addEventListener('click', fetchLiveOdds);
    // Event listener for "Upcoming Games" link
    document.querySelector('.upcoming-games-link').addEventListener('click', fetchUpcomingGames);
});

async function fetchLiveOdds() {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/odds/live';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'ed4be25206a6d2113559eb2049ffbfad', // Replace with your actual API key
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayLiveOdds(data);
    } catch (error) {
        console.error('Error fetching live odds:', error);
    }
}

function displayLiveOdds(data) {
    const container = document.getElementById('live-games');
    container.innerHTML = ''; // Clear previous content

    if (!data.response || data.response.length === 0) {
        container.textContent = 'No live odds available at the moment.';
        return;
    }

    data.response.forEach((odd, index) => {
        const oddElement = document.createElement('div');
        oddElement.textContent = `Game ${index + 1}: Fixture ID ${odd.fixture.id}, Odds: ${odd.bookmakers[0].bets[0].values[0].odd}`;
        container.appendChild(oddElement);
    });
}
async function fetchUpcomingGames() {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?next=10'; // Example URL, adjust based on your needs
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'ed4be25206a6d2113559eb2049ffbfad', // Use your actual API key here
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayUpcomingGames(data);
    } catch (error) {
        console.error('Error fetching upcoming games:', error);
    }
}
function displayUpcomingGames(data) {
    const container = document.getElementById('live-games'); // Consider renaming this container if it's used for more than live games
    container.innerHTML = ''; // Clear previous content

    if (!data.response || data.response.length === 0) {
        container.textContent = 'No upcoming games available at the moment.';
        return;
    }

    // Example of displaying upcoming games
    data.response.forEach((game, index) => {
        const gameElement = document.createElement('div');
        gameElement.textContent = `Game ${index + 1}: ${game.teams.home.name} vs ${game.teams.away.name} on ${game.fixture.date}`;
        container.appendChild(gameElement);
    });
}