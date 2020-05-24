const Twitter = require('twitter-lite');
const language = require('@google-cloud/language');
const languageClient = new language.LanguageServiceClient();

require('dotenv').config()

const user = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
});

async function getSentimentScore(text) {
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };

    // Detects the sentiment of the text
    const [result] = await languageClient.analyzeSentiment({document: document});
    const sentiment = result.documentSentiment;

    return sentiment.score;
}

searchForTweets("The most wanted tweet");

async function searchForTweets(query) {
    try {
        let response = await user.getBearerToken();
        const app = new Twitter({
            bearer_token: response.access_token,
        });

        response = await app.get(`/search/tweets`, {
            q: query,
            lang: "en",
            count: 10000,
        });

        let allTweets = "";
        for (tweet of response.statuses) {
            allTweets += tweet.text + "\n";
            console.dir(tweet.text);
        }

        console.log(`Check ${response.statuses.length} tweets`);
        const sentimentScore = await getSentimentScore(allTweets);
        console.log(`The sentiment about ${query} is: ${sentimentScore}`);

    } catch(e) {
        console.log("There was an error calling the Twitter API");
        console.dir(e);
    }
}
 