const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Frontend files serve செய்ய
app.use(express.static(path.join(__dirname, '.')));

app.post('/api/get-video', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ success: false, message: "URL தேவை" });
    }

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        const videoData = await page.evaluate(() => {
            // முயற்சி 1: <video> tag
            const videoElement = document.querySelector('video source');
            if (videoElement) return { type: 'video', url: videoElement.src };
            
            // முயற்சி 2: .mp4 link
            const mp4Link = document.querySelector('a[href*=".mp4"]');
            if (mp4Link) return { type: 'link', url: mp4Link.href };

            // முயற்சி 3: download button
            const downloadBtn = document.querySelector('a[download]');
            if (downloadBtn) return { type: 'link', url: downloadBtn.href };

            return null;
        });

        await browser.close();

        if (videoData && videoData.url) {
            res.json({ success: true, downloadUrl: videoData.url });
        } else {
            res.status(404).json({ 
                success: false, 
                message: "Video link கிடைக்கவில்லை. தளத்தின் structure மாறியிருக்கலாம்." 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
