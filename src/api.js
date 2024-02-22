const express = require("express");
const serverless = require("serverless-http");
const router = express.Router();
const { translate } = require("@vitalets/google-translate-api");

const app = express();
app.use(express.json());

// Function to handle translation
async function translateText(text) {
    try {
        const response = await translate(text, { to: "fr" });
        return response.text;
    } catch (error) {
        console.error("Translation Error:", error);
        throw new Error("Translation failed. Please try again later.");
    }
}

// POST endpoint for translation
router.post("/translate", async (req, res) => {
    try {
        const { text } = req.body;
        console.log(text.toString());

        if (!text) {
            return res
                .status(400)
                .json({
                    error: "The 'text' field in the request body is missing",
                });
        }
        if (typeof text !== "string") {
            return res
                .status(400)
                .json({ error: "The 'text' field must contain a string only" });
        }
        if (text.trim() === "") {
            return res
                .status(400)
                .json({
                    error: "The 'text' field in the request body is empty",
                });
        }

        const translation = await translateText(text);
        res.json({ translation });
    } catch (error) {
        console.error("Request Processing Error:", error.message);
        res.status(500).json({
            error: "An internal server error occurred. Please try again later.",
        });
    }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
