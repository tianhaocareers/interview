const express = require("express");
const axios = require("axios");
const circuitBreaker = require("opossum");

const app = express();
const port = process.env.PORT || 4000

app.use(express.json());

const options = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
};

app.get("/api/:search", (req, res) => {
    const breaker = new circuitBreaker(axios.get, options);
    breaker.fallback(() => 'Sorry, out of service right now');
    breaker.on('fallback', (result) => reportFallbackEvent(result));

    //this api_key is my token, you might need to switch to your token if you want to run it
    const api_key = "4LDDE4EoR5DHqtmdA9CtH7oVD4H2teXN";
    const gifData = breaker.fire(`https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${req.params.search}&limit=20`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(err => {
            res.status(500).json("Internal Server Error 500")
        })

    return gifData
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})  