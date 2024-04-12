import { auth, ref, get, database } from './firebase.js';

document.getElementById('my-bets-tab').addEventListener('click', function() {
    const user = auth.currentUser; // Assuming you have Firebase's auth object available
    if (user) {
        document.getElementById('my-bets-section').style.display = 'block';
        loadUserBets(); // Load bets only if the user is logged in
    } else {
        document.getElementById('my-bets-section').style.display = 'none';
        alert('Please log in to view your bets.');
    }
});

async function loadUserBets() {
    const myBetsSection = document.getElementById('my-bets-section');
    if (myBetsSection.style.display === 'none') {
        console.log('My Bets section is not visible.');
        return; // Don't try to load or display bets if the section is not visible
    }

    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const betsRef = ref(database, `users/${userId}/bets`);
        try {
            const betsSnapshot = await get(betsRef);
            if (betsSnapshot.exists()) {
                const bets = betsSnapshot.val();
                const betsContainer = document.getElementById('my-bets-section');
                if (!betsContainer) {
                    console.error('Bets container not found in the DOM.');
                    return;
                }
                betsContainer.innerHTML = ''; // Clear previous content
                for (const betKey of Object.keys(bets)) {
                    try {
                        const bet = bets[betKey];
                        const gameDetails = await fetchGameDetails(bet.fixtureId);
                        const gameStatus = getGameStatus(gameDetails);
                        if (gameStatus === 'Finished') {
                            const betOutcome = getBetOutcome(gameDetails, bet.label);
                            
                            displayBet(gameDetails, bet);
                        } else {
                            console.log("Game not finished yet. Bet outcome will be determined after the game finishes.");
                            // Display bet without determining outcome
                            displayBet(gameDetails, bet);
                        }
                    } catch (error) {
                        console.error('Error processing bet:', error);
                    }
                }
            } else {
                console.log("No bets found for this user.");
                betsContainer.textContent = 'No bets found.';
            }
        } catch (error) {
            console.error('Error fetching bets:', error);
        }
    } else {
        console.log("No user signed in.");
    }
}

async function fetchGameDetails(fixtureId) {
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${fixtureId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'f33387c838msh57d5f5abaefe508p1a5bf4jsnefd641827203',
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Failed to fetch game details');
    const data = await response.json();
    return data.response[0]; // Assuming each call returns a single fixture
}

async function displayBet(gameDetails, bet) {
    const betsContainer = document.getElementById('my-bets-section');
    if (!betsContainer) {
        console.error('Bets container not found in the DOM.');
        return;
    }

    const homeScore = gameDetails.goals.home;
    const awayScore = gameDetails.goals.away;
    const matchWinner = determineWinner(homeScore, awayScore);

    const gameStatus = getGameStatus(gameDetails);
    let betOutcome = 'N/A'; // Default value for bet outcome

    if (gameStatus === 'Finished') {
        betOutcome = getBetOutcome(matchWinner, bet.label);
    }

    const betElement = document.createElement('div');
    betElement.className = 'game-card';
    betElement.innerHTML = `
        <div class="team home-team">
            <img src="${gameDetails.teams.home.logo}" alt="${gameDetails.teams.home.name}" class="team-logo">
            <span class="team-name">${gameDetails.teams.home.name}</span>
        </div>
        <div class="bet-info">
            <div><strong>Bet On:</strong> ${bet.label}</div>
            <div><strong>Amount:</strong> $${bet.amount}</div>
            <div><strong>Odds:</strong> ${bet.odds}</div>
            <div><strong>Date:</strong> ${new Date(bet.placedOn).toLocaleString()}</div>
            <div><strong>Outcome:</strong> ${betOutcome}</div>
            <div><strong>Status:</strong> ${gameStatus}</div>
        </div>
        <div class="team away-team">
            <img src="${gameDetails.teams.away.logo}" alt="${gameDetails.teams.away.name}" class="team-logo">
            <span class="team-name">${gameDetails.teams.away.name}</span>
        </div>
    `;
    betsContainer.appendChild(betElement);
}

function determineWinner(homeScore, awayScore) {
    if (homeScore > awayScore) {
        return 'home';
    } else if (awayScore > homeScore) {
        return 'away';
    } else {
        return 'draw';
    }
}

function getBetOutcome(matchWinner, betLabel) {
    if (matchWinner === 'home' && betLabel === 'Home Win Odds') {
        return 'Won';
    } else if (matchWinner === 'away' && betLabel === 'Away Win Odds') {
        return 'Won';
    } else if (matchWinner === 'draw' && betLabel === 'Draw Odds') {
        return 'Won';
    } else {
        return 'Lost';
    }
}

function getGameStatus(gameDetails) {
    if (gameDetails.fixture.status.short === 'FT') {
        return 'Finished';
    } else {
        return 'Not Finished';
    }
}
