async function fetchMatchResult(fixtureId) {
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${fixtureId}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'YOUR_RAPIDAPI_KEY',
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if (data.response.length > 0 && data.response[0].fixture.status.short === "FT") {
            // Assuming the match is finished ("FT" stands for Full Time)
            const result = {
                homeScore: data.response[0].goals.home,
                awayScore: data.response[0].goals.away
            };
            return result;
        } else {
            console.error('Match result is not available.');
        }
    } catch (error) {
        console.error('Error fetching match result:', error);
    }
}

function determineBetOutcome(betDetails, matchResult) {
    const { homeScore, awayScore } = matchResult;
    const matchWinner = determineWinner(homeScore, awayScore);
    
    if (betDetails.label.includes(matchWinner)) {  // Assumes betDetails.label contains "Home Win Odds", "Away Win Odds", or "Draw Odds"
        return true; // Bet won
    } else {
        return false; // Bet lost
    }
}