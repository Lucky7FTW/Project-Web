import { storeBetDetails, getCurrentUserBalance, updateUserBalance } from './firebase.js';

// odds.js
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.upcoming-games-link').addEventListener('click', function() {
        document.getElementById('filters-container').style.display = 'block';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('game-date-picker').value = today;
    });

    document.getElementById('apply-filters').addEventListener('click', async () => {
        const selectedDate = document.getElementById('game-date-picker').value;
        if (!selectedDate) {
            alert('Please select a date.');
            return;
        }
        document.getElementById('filters-container').style.display = 'block';
        
        await fetchFilteredGames(selectedDate);
    });

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('game-date-picker').setAttribute('min', today);
});

async function fetchFilteredGames(date) {
    const formattedDate = new Date(date).toISOString().split('T')[0]; // Ensure the date is in the correct format
    let url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${formattedDate}`;
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
        // Filter out games that have already happened based on current time
        const upcomingGames = data.response.filter(game => {
            const gameTime = new Date(game.fixture.date).getTime();
            const now = new Date().getTime();
            return gameTime > now; // Only include games that are in the future
        });
        displayUpcomingGames({response: upcomingGames}); // Update the display with filtered games
    } catch (error) {
        console.error('Error fetching filtered games:', error);
    }
}

function displayUpcomingGames(data) {
    const container = document.getElementById('upcoming-games'); // Ensure this is the right container ID
    container.innerHTML = ''; // Clear previous content

    if (!data.response || data.response.length === 0) {
        container.textContent = 'No upcoming games available at the moment.';
        return;
    }

    const gamesList = document.createElement('div');
    gamesList.className = 'games-list';

    data.response.forEach((game) => {
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

        // Attach an event listener to the game card that triggers displayOdds when clicked
        gameCard.addEventListener('dblclick', function() {
            // Assuming you have a function to fetch odds data for the clicked game
            // and that function eventually calls displayOdds with the fetched data
            fetchAndDisplayOdds(game.fixture.id);
        });

        gamesList.appendChild(gameCard);
    });

    container.appendChild(gamesList);
}


async function fetchAndDisplayOdds(fixtureId) {
    const url = `https://api-football-v1.p.rapidapi.com/v3/predictions?fixture=${fixtureId}`;
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
        displayOdds(data,fixtureId); // Implement this function to display odds based on the fetched predictions
    } catch (error) {
        console.error('Error fetching odds:', error);
    }
}

function displayOdds(data,fixtureId) {
    // Check if a modal already exists and remove it
    const existingModal = document.getElementById('odds-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create the modal
    const modal = document.createElement('div');
    modal.id = 'odds-modal';
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

    if (data && data.response && data.response.length > 0) {
        const prediction = data.response[0].predictions;

        // Modal content with improved layout and styles
        modal.innerHTML = `<h2 style="margin-bottom: 16px;">Betting Quotas</h2>`;

        const oddsList = document.createElement('ul');
        oddsList.style.listStyle = 'none';
        oddsList.style.padding = '0';

        // Function to create list item for odds
        const createOddsItem = (label, odds,fixtureId) => {
            const item = document.createElement('li');
            item.style.padding = '10px';
            item.style.borderBottom = '1px solid #ddd';
            item.innerHTML = `<strong>${label}:</strong> <span style="cursor:pointer; text-decoration:underline; color:#007BFF;">${odds}</span>`;

            item.innerHTML = `
            <div><strong>${label}:</strong> ${odds}</div>
            <input type="number" placeholder="Bet Amount" min="1" class="bet-amount" style="margin-right: 10px;">
            <button class="place-bet">Place Bet</button>
            `;
            
            item.querySelector('.place-bet').addEventListener('click', async function() {
                const betAmount = parseFloat(item.querySelector('.bet-amount').value);
                if (!betAmount || betAmount <= 0) {
                    alert('Please enter a valid bet amount.');
                    return;
                }
                
                try {
                    const currentBalance = await getCurrentUserBalance();
                    if (betAmount > currentBalance) {
                        alert('Insufficient balance to place this bet.');
                        return;
                    }
            
                    const newBalance = currentBalance - betAmount;
                    await updateUserBalance(newBalance); // Assuming this function is implemented in your firebase.js
            
                    // Optional: Store the bet details
                    const betDetails = {
                        amount: betAmount,
                        fixtureId: fixtureId,
                        label: label, // Assuming 'label' is defined in your scope
                        odds: odds, // Assuming 'odds' is defined in your scope
                        placedOn: new Date().toISOString(),
                        claimed: false  // Adding the 'claimed' state with a default value of false
                    };
                    await storeBetDetails(betDetails); // Assuming this function is implemented in your firebase.js
            
                    alert(`Bet of ${betAmount} placed on: ${label} with odds of ${odds}. New balance: ${newBalance}`);
                } catch (error) {
                    console.error('Error placing bet:', error);
                    alert('Failed to place bet. Please try again.');
                }
            });

            return item;
        };

        // Assuming you have the percentages for home win, draw, and away win
        const homeWinPercentage = parseFloat(prediction.percent.home);
        const drawPercentage = parseFloat(prediction.percent.draw);
        const awayWinPercentage = parseFloat(prediction.percent.away);

        // Convert percentages to decimal odds
        const homeWinOdds = homeWinPercentage ? (100 / homeWinPercentage).toFixed(2) : "N/A";
        const drawOdds = drawPercentage ? (100 / drawPercentage).toFixed(2) : "N/A";
        const awayWinOdds = awayWinPercentage ? (100 / awayWinPercentage).toFixed(2) : "N/A";

        // Append odds to the list
        oddsList.appendChild(createOddsItem("Home Win Odds", homeWinOdds,fixtureId));
        oddsList.appendChild(createOddsItem("Draw Odds", drawOdds,fixtureId));
        oddsList.appendChild(createOddsItem("Away Win Odds", awayWinOdds,fixtureId));

        modal.appendChild(oddsList);

        // Close button code...
        const closeButton = document.createElement('button');
        closeButton.id = 'close-modal';
        closeButton.textContent = 'Close';
        closeButton.style = 'margin-top: 20px; padding: 10px 20px; background-color: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;';
        modal.appendChild(closeButton);

        // Event listener to close the modal
        closeButton.addEventListener('click', function() {
            modal.remove();
        });
    } else {
        modal.innerHTML = '<p>No prediction data available for this game.</p><button id="close-modal">Close</button>';
    }

    // Append the modal to the body
    document.body.appendChild(modal);

    // Event listener to close the modal
    document.getElementById('close-modal').addEventListener('click', function() {
        modal.remove();
    });
}