document.addEventListener('DOMContentLoaded', function() {

    const tabs = document.querySelectorAll('.nav-bar .bn3');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            document.querySelectorAll('.tab-content').forEach(section => {
                section.style.display = 'none';
            });

            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
    document.querySelector('.live-games-link').addEventListener('click', function() {
        fetchLiveGames(); // Fetch and display live games when the "Live Bets" tab is clicked
    });
});

async function fetchLiveGames() {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all'; // Example URL, adjust according to your API
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
        displayLiveGames(data.response); // Pass the live games data to the display function
    } catch (error) {
        console.error('Error fetching live games:', error);
    }
}

function displayLiveGames(games) {
    const container = document.getElementById('live-games'); // Ensure this is the correct container ID
    container.innerHTML = ''; // Clear previous content

    if (!games || games.length === 0) {
        const noGamesMessage = document.createElement('div');
        noGamesMessage.textContent = 'No live games at the moment.';
        // Apply inline styles to make the message larger and more noticeable
        noGamesMessage.style.padding = '20px';
        noGamesMessage.style.margin = '20px 0';
        noGamesMessage.style.backgroundColor = '#f2f2f2'; // Light grey background
        noGamesMessage.style.color = '#333'; // Darker text color for contrast
        noGamesMessage.style.textAlign = 'center';
        noGamesMessage.style.borderRadius = '5px';
        noGamesMessage.style.fontSize = '20px'; // Larger font size
        container.appendChild(noGamesMessage);
        return;
    }

    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.innerHTML = `
            <div class="teams">
                <div class="team home-team">
                    <img src="${game.teams.home.logo}" alt="${game.teams.home.name}" class="team-logo">
                    <span class="team-name">${game.teams.home.name}</span>
                    <span class="score">${game.goals.home !== null ? game.goals.home : '-'}</span>
                </div>
                <span class="vs">vs</span>
                <div class="team away-team">
                    <span class="score">${game.goals.away !== null ? game.goals.away : '-'}</span>
                    <span class="team-name">${game.teams.away.name}</span>
                    <img src="${game.teams.away.logo}" alt="${game.teams.away.name}" class="team-logo">
                </div>
            </div>
        `;
        gameCard.addEventListener('click', () => displayGameDetails(game.fixture.id));

        container.appendChild(gameCard);
    });
    
}

// Function to display game details including statistics, events, and venue information
async function displayGameDetails(gameId) {
    const statsUrl = `https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics?fixture=${gameId}`;
    const eventsUrl = `https://api-football-v1.p.rapidapi.com/v3/fixtures/events?fixture=${gameId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f33387c838msh57d5f5abaefe508p1a5bf4jsnefd641827203',
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const [statsResponse, eventsResponse] = await Promise.all([
            fetch(statsUrl, options),
            fetch(eventsUrl, options)
        ]);
        const statsData = await statsResponse.json();
        const eventsData = await eventsResponse.json();

        showGameDetailsModal(statsData, eventsData); // Show details in a modal
    } catch (error) {
        console.error('Error fetching game details:', error);
    }
}

// Function to show the modal with game details
function showGameDetailsModal(statsData, eventsData, venueData) {
    let modal = document.getElementById('game-details-modal');
    if (modal) {
        modal.remove();
    }

    modal = document.createElement('div');
    modal.id = 'game-details-modal';
    modal.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        padding: 20px;
        background: #FFF;
        color: #000;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-height: 80vh;
        overflow-y: auto;
        width: 80%;
        max-width: 600px;
    `;

    modal.innerHTML = '<h2>Game Details</h2>';
    
    // Populate the timeline with events
    if (eventsData && eventsData.response && eventsData.response.length > 0) {
        const eventsSection = document.createElement('div');
        eventsSection.innerHTML = '<h3>Events Timetable</h3>';
        const timetable = document.createElement('table');
        timetable.style.width = '100%';
        timetable.innerHTML = `<tr>
                                    <th>Time</th>
                                    <th>Team</th>
                                    <th>Event</th>
                               </tr>`;

        eventsData.response.forEach(event => {
            const row = timetable.insertRow(-1);
            const timeCell = row.insertCell(0);
            const teamCell = row.insertCell(1);
            const eventCell = row.insertCell(2);

            timeCell.textContent = `${event.time.elapsed}'`;
            teamCell.textContent = event.team.name;
            eventCell.textContent = event.detail;
        });

        eventsSection.appendChild(timetable);
        modal.appendChild(eventsSection);
    } else {
        const noEvents = document.createElement('p');
        noEvents.textContent = 'No events available for this game.';
        modal.appendChild(noEvents);
    }

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style = 'margin-top: 20px; padding: 10px 20px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;';
    closeButton.addEventListener('click', () => modal.remove());
    modal.appendChild(closeButton);

    document.body.appendChild(modal);
}


