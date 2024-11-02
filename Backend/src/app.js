const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
    origin:process.env.VITE_ORIGIN,
    credentials:true,
}))
app.post('/upload', upload.fields([{ name: 'frontImage' }, { name: 'backImage' }]), async (req, res) => {
  try {

    console.log("Upload")
    const frontImage = req.files['frontImage'][0];
    const backImage = req.files['backImage'][0];


    console.log(frontImage.buffer)
    console.log("hvchadchkacva");
    console.log(backImage.buffer)
    const frontText = await Tesseract.recognize(frontImage.buffer, 'eng');
    const backText = await Tesseract.recognize(backImage.buffer, 'eng');

    console.log("frontttttttttttttttttttttt"+"   "+frontText.data)

    res.json({
      frontText: frontText.data.text,
      backText: backText.data.text,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process images' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
