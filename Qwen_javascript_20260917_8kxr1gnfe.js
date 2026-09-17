const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/get-video', async (req, res) => {
    const { url } = req.body;

    try {
        // Headless browser-ஐ திறக்கவும்
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        // Flezen லிங்க்கை load செய்யவும் (JavaScript render ஆக காத்திருக்கவும்)
        await page.goto(url, { waitUntil: 'networkidle2' });

        // பக்கத்திலிருந்து நேரடி வீடியோ அல்லது download லிங்க்கைக் கண்டறியவும்
        // குறிப்பு: Flezen-ன் HTML அமைப்பு மாறினால், இந்த selectors-ஐ மாற்ற வேண்டியிருக்கும்.
        const videoData = await page.evaluate(() => {
            // முயற்சி 1: <video> tag-ன் source
            const videoElement = document.querySelector('video source');
            if (videoElement) return { type: 'video', url: videoElement.src };
            
            // முயற்சி 2: .mp4 அல்லது download attribute கொண்ட <a> tag
            const downloadBtn = document.querySelector('a[href*=".mp4"], a[download]');
            if (downloadBtn) return { type: 'link', url: downloadBtn.href };

            return null;
        });

        await browser.close();

        if (videoData && videoData.url) {
            res.json({ success: true, downloadUrl: videoData.url });
        } else {
            res.status(404).json({ success: false, message: "Video link-ஐக் கண்டறிய முடியவில்லை. தளத்தின் அமைப்பு மாறியிருக்கலாம்." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend Server running on http://localhost:${PORT}`));