async function fetchVideo() {
    const url = document.getElementById('videoUrl').value.trim();
    const resultDiv = document.getElementById('result');
    const btn = document.getElementById('fetchBtn');

    if (!url) {
        resultDiv.innerHTML = "<p style='color:red;'>தயவுசெய்து ஒரு valid லிங்க்கை உள்ளிடவும்.</p>";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Processing... காத்திருக்கவும்";
    resultDiv.innerHTML = "";

    try {
        // முக்கிய மாற்றம்: 'localhost'க்கு பதிலாக relative path '/api/get-video' பயன்படுத்துகிறோம்
        const response = await fetch('/api/get-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();

        if (data.success) {
            resultDiv.innerHTML = `
                <p style="color:green;">✅ Video கண்டறியப்பட்டது!</p>
                <a href="${data.downloadUrl}" target="_blank" class="download-btn" style="display:inline-block; margin-top:15px; padding:12px 25px; background-color:#28a745; color:white; text-decoration:none; border-radius:5px;">
                    ⬇️ Full Quality-ல் Download செய்யவும்
                </a>
            `;
        } else {
            resultDiv.innerHTML = `<p style="color:red;">❌ ${data.message}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red;">❌ பிழை: ${error.message}</p>`;
    } finally {
        btn.disabled = false;
        btn.innerText = "Download செய்க";
    }
}
