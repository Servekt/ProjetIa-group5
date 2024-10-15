const express = require('express');
const axios = require('axios');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

const subscriptionKey = '494c66550a934f60a2ef30d3df1b2b6c';
const endpoint = 'https://flozersq.cognitiveservices.azure.com/';

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/analyze', upload.single('image'), async (req, res) => {
    const imagePath = req.file.path;

    try {

        const imageData = fs.readFileSync(imagePath);

        const response = await axios.post(
            `${endpoint}/vision/v3.1/analyze`,
            imageData,
            {
                params: { visualFeatures: 'Categories,Tags,Description' },
                headers: {
                    'Ocp-Apim-Subscription-Key': subscriptionKey,
                    'Content-Type': 'application/octet-stream'
                }
            }
        );

        fs.unlinkSync(imagePath);

        const tags = response.data.tags.map(tag => tag.name.toLowerCase());
        const isFlower = tags.includes('flower');

        if (isFlower) {
            res.json({
                isFlower: true,
                categories: response.data.categories,
                description: response.data.description
            });
        } else {
            res.json({ isFlower: false });
        }
    } catch (error) {
        fs.unlinkSync(imagePath);
        res.status(500).json({ error: error.message });
    }
});

const port = 5500;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
