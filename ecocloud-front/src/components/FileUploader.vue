<template>
  <div>
    <!-- Bouton pour envoyer des fichiers -->
    <input type="file" id="fileUpload" multiple @change="handleFiles(false, $event)" />
    <button @click="pauseUpload">Pause</button>
    <button @click="resumeUpload">Reprendre</button>

    <!-- Bouton pour envoyer des dossiers -->
    <input type="file" id="folderUpload" webkitdirectory directory multiple @change="handleFiles(true, $event)" />

    <!-- Barre de progression -->
    <div v-if="resumable">
      <progress :value="progress" max="100"></progress>
    </div>
  </div>
</template>

<script>
import Resumable from 'resumablejs';
import JSZip from 'jszip';

export default {
  data() {
    return {
      resumable: null,
      zip: new JSZip(),
      progress: 0,
    };
  },
  methods: {
    handleFiles(isDirectory, event) {
      const files = event.target.files;
      if (files.length) {
        let folderName = "archive"; // Nom par défaut si aucun nom de dossier n'est détecté

        if (isDirectory) {
          // Extraire le nom du dossier à partir du webkitRelativePath du premier fichier
          const relativePath = files[0].webkitRelativePath;
          const firstSlashIndex = relativePath.indexOf('/');
          if (firstSlashIndex !== -1) {
            folderName = relativePath.substring(0, firstSlashIndex);
          }

          // Traitement spécifique pour les dossiers
          Array.from(files).forEach((file) => {
            this.zip.file(file.webkitRelativePath || file.name, file);
          });

          // Générer le contenu ZIP et convertir en File
// Générer le contenu ZIP et convertir en File
this.zip.generateAsync({ type: "blob" }).then((content) => {
  // Vérifier le contenu généré
  console.log("Contenu ZIP généré :", content);

  // Créer un objet File à partir du contenu ZIP
  const zipFile = new File([content], `${folderName}.zip`, { type: "application/zip" });
  this.setUpResumable();
  this.resumable.addFile(zipFile); // Ajouter directement le fichier ZIP
});


        } else {
          // Traitement pour les fichiers individuels
          Array.from(files).forEach((file) => {
            this.setUpResumable();
            this.resumable.addFile(file);
          });
        }
      }
    },
    setUpResumable() {
      if (!this.resumable) {
        this.resumable = new Resumable({
          target: 'http://207.180.204.159:3000/upload',
          chunkSize: 1 * 1024 * 1024,
          testChunks: false,
          throttleProgressCallbacks: 1,
          simultaneousUploads: 4,
        });

        this.resumable.on('fileAdded', (file) => {
          console.log('Ajout de fichier :', file.fileName || file.name);
          this.resumable.upload();
        });

        this.resumable.on('fileSuccess', (file) => {
          console.log('Succès de téléversement pour', file.fileName || file.name);
        });

        this.resumable.on('fileError', (file) => {
          console.error('Erreur de téléversement pour', file.fileName || file.name);
        });

this.resumable.on('progress', () => {
  // Mettre à jour la valeur de la barre de progression
  this.progress = Math.floor((this.resumable.progress() * 100));
  console.log('Progress:', this.progress);
});

      }
    },
    pauseUpload() {
      this.resumable.pause();
    },
    resumeUpload() {
      this.resumable.upload();
    },
  },
};
</script>
