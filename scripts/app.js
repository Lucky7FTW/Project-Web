document.addEventListener('DOMContentLoaded', function() {
    // Event listener for "Live Bets" link
    document.querySelector('.live-bets-link').addEventListener('click', fetchLiveOdds);
    // Event listener for "Upcoming Games" link
    document.querySelector('.upcoming-games-link').addEventListener('click', fetchUpcomingGames);
    document.querySelector('.upcoming-games-link').addEventListener('click', function() {
        // Display the filters container
        document.getElementById('filters-container').style.display = 'block';

        // Optionally, you might want to automatically fetch and display today's games
        // or clear previous game listings
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('game-date-picker').value = today; // Set the date picker to today
        // You can also call fetchFilteredGames here if you want to immediately show today's games
        // fetchFilteredGames(today, ''); // This line is optional and depends on your UX design
        document.getElementById('flashscore-link').addEventListener('click', function() {
            var widgetContainer = document.getElementById('flashscore-widget-container');
            if (widgetContainer.style.display === 'none') {
                widgetContainer.style.display = 'block';
            } else {
                widgetContainer.style.display = 'none';
            }
        });
    });
});

document.querySelector('.upcoming-games-link').addEventListener('click', () => {
    // Show the date picker container
    document.getElementById('date-picker-container').style.display = 'block';
});

document.getElementById('apply-filters').addEventListener('click', async () => {
    const selectedDate = document.getElementById('game-date-picker').value;
    const teamName = document.getElementById('team-name-input').value.trim();

    if (!selectedDate) {
        alert('Please select a date.');
        return;
    }

    await fetchFilteredGames(selectedDate, teamName);
});

async function fetchFilteredGames(date, teamName = '') {
    // Format the date to YYYY-MM-DD if it's not already
    const formattedDate = new Date(date).toISOString().split('T')[0];

    let url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${formattedDate}`;
    if (teamName) {
        url += `&team=${encodeURIComponent(teamName)}`; // Adjust if your API uses a different parameter for team filtering
    }

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f33387c838msh57d5f5abaefe508p1a5bf4jsnefd641827203', // Use your actual API key
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayUpcomingGames(data); // Make sure this function is equipped to handle the response
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchGamesByDate(date) {
    const formattedDate = new Date(date).toISOString().split('T')[0]; // Ensure the date is in the correct format
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${formattedDate}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f33387c838msh57d5f5abaefe508p1a5bf4jsnefd641827203',
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayUpcomingGames(data); // You might need to adjust this function to handle the new structure
    } catch (error) {
        console.error('Error fetching games by date:', error);
    }
}

async function fetchLiveOdds() {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/odds/live';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f33387c838msh57d5f5abaefe508p1a5bf4jsnefd641827203', // Replace with your actual API key
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
    const today = new Date().toISOString().split('T')[0];

    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f33387c838msh57d5f5abaefe508p1a5bf4jsnefd641827203', // Use your actual API key here
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayUpcomingGames(data); // Make sure this function is ready to handle the display logic
    } catch (error) {
        console.error('Error fetching today\'s games:', error);
    }
}
function displayUpcomingGames(data) {
    const container = document.getElementById('live-games'); // Ensure this is the correct container for upcoming games
    container.innerHTML = ''; // Clear previous content

    if (!data.response || data.response.length === 0) {
        container.textContent = 'No upcoming games available at the moment.';
        return;
    }

    const gamesList = document.createElement('div');
    gamesList.className = 'games-list';

    data.response.forEach((game, index) => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';

        gameCard.innerHTML = `
            <div class="game-date">${new Date(game.fixture.date).toLocaleString()}</div>
            <div class="teams">
                <div class="team home-team">
                    <img src="${game.teams.home.logo}" alt="${game.teams.home.name}" class="team-logo">
                    <span class="team-name">${game.teams.home.name}</span>
                </div>
                <span class="vs">vs</span>
                <div class="team away-team">
                    <img src="${game.teams.away.logo}" alt="${game.teams.away.name}" class="team-logo">
                    <span class="team-name">${game.teams.away.name}</span>
                </div>
            </div>
        `;

        gamesList.appendChild(gameCard);
    });

    container.appendChild(gamesList);
}