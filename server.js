const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_DIR = '/home/EcoCloud/Data';
const TEMP_DIR = path.join(DATA_DIR, 'temp');

// Assurez-vous que les répertoires existent
fs.ensureDirSync(DATA_DIR);
fs.ensureDirSync(TEMP_DIR);

app.post('/upload', async (req, res) => {
    const { resumableIdentifier, resumableFilename, resumableChunkNumber, resumableTotalChunks } = req.body;
    const tempChunkPath = path.join(TEMP_DIR, `${resumableIdentifier}-${resumableChunkNumber}`);
    const fileBuffer = Buffer.from(Object.values(req.body.file)); // Assumant que le fichier est envoyé dans le champ `file`

    // Sauvegarder le fragment temporairement
    await fs.writeFile(tempChunkPath, fileBuffer);

    // Vérifier si tous les fragments ont été reçus
    if (await checkIfAllChunksReceived(resumableIdentifier, resumableTotalChunks)) {
        const finalFilePath = path.join(DATA_DIR, resumableFilename);
        await reassembleFile(resumableIdentifier, resumableTotalChunks, finalFilePath);
        res.send({ message: 'Fichier téléversé et réassemblé avec succès' });
    } else {
        res.send({ message: 'Fragment reçu' });
    }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Serveur démarré sur http://207.180.204.159:3000');
});

async function checkIfAllChunksReceived(identifier, totalChunks) {
    const chunks = await fs.readdir(TEMP_DIR);
    const filteredChunks = chunks.filter(chunk => chunk.startsWith(identifier));
    return filteredChunks.length === parseInt(totalChunks);
}

async function reassembleFile(identifier, totalChunks, finalFilePath) {
    const writeStream = fs.createWriteStream(finalFilePath);

    for (let i = 1; i <= totalChunks; i++) {
        const chunkPath = path.join(TEMP_DIR, `${identifier}-${i}`);
        const chunk = await fs.readFile(chunkPath);

        writeStream.write(chunk);
        await fs.remove(chunkPath); // Supprimer le fragment après l'avoir ajouté
    }

    writeStream.end();
}


