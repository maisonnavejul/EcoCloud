const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = '/home/EcoCloud/Data';
const TEMP_DIR = path.join(DATA_DIR, 'temp');

fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(TEMP_DIR);

app.post('/upload', express.raw({ type: 'application/octet-stream', limit: '50mb' }), async (req, res) => {
    const resumableIdentifier = req.headers['resumable-identifier'];
    const resumableFilename = req.headers['resumable-filename'];
    const resumableChunkNumber = req.headers['resumable-chunk-number'];
    const resumableTotalChunks = req.headers['resumable-total-chunks'];

    if (!resumableIdentifier || !resumableFilename || !resumableChunkNumber || !resumableTotalChunks) {
        return res.status(400).send('Missing headers');
    }

    const tempChunkPath = path.join(TEMP_DIR, `${resumableIdentifier}-${resumableChunkNumber}`);
    
    // Sauvegarder le fragment temporairement
    await fs.writeFile(tempChunkPath, req.body);

    // Vérifier si tous les fragments ont été reçus
    if (await checkIfAllChunksReceived(resumableIdentifier, resumableTotalChunks)) {
        const finalFilePath = path.join(DATA_DIR, resumableFilename);
        await reassembleFile(resumableIdentifier, resumableTotalChunks, finalFilePath);
        res.send({ message: 'Fichier téléversé et réassemblé avec succès' });
    } else {
        res.send({ message: 'Fragment reçu' });
    }
});


async function checkIfAllChunksReceived(identifier, totalChunks) {
    const chunks = await fs.readdir(TEMP_DIR);
    const filteredChunks = chunks.filter(chunk => chunk.startsWith(identifier));
    return filteredChunks.length === parseInt(totalChunks, 10);
}

async function reassembleFile(identifier, totalChunks, finalFilePath) {
    const writeStream = fs.createWriteStream(finalFilePath);

    for (let i = 1; i <= totalChunks; i++) {
        const chunkPath = path.join(TEMP_DIR, `${identifier}-${i}`);
        const chunk = await fs.readFile(chunkPath);

        writeStream.write(chunk);
        await fs.remove(chunkPath);
    }

    writeStream.end();
}
app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://207.180.204.159:3000');
});