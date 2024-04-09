document.addEventListener('DOMContentLoaded', async () => {
    const url = 'https://api-football-v1.p.rapidapi.com/v3/odds';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'ed4be25206a6d2113559eb2049ffbfad',
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayGames(data.response);
    } catch (error) {
        console.error(error);
    }
});

function displayGames(games) {
    const gamesList = document.querySelector('.game-list');
    games.forEach(game => {
        const listItem = document.createElement('li');
        listItem.textContent = `Match: ${game.fixture.teams.home.name} vs ${game.fixture.teams.away.name}, Odds: ${game.bookmakers[0].bets[0].values[0].odd}`;
        gamesList.appendChild(listItem);
    });
}
