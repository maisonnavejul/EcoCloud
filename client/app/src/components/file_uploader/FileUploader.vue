<template>
  <div class="file_uploader">
    <div class="file_uploader_content">
      <div class="uploader_button">
        <!-- Bouton pour envoyer des fichiers -->
        <input type="file" id="fileUpload" multiple @change="handleFiles(false, $event)"/>

        <!-- Bouton pour envoyer des dossiers -->
        <input type="file" id="folderUpload" webkitdirectory directory multiple @change="handleFiles(true, $event)" />
      </div>

      <!-- Barre de progression -->
      <div class="progress_bar" v-if="has_upload_started">
        <progress :value="progress" max="100"></progress>
        <button @click="pauseUpload" v-bind:disabled="is_paused">Pause</button>
        <button @click="resumeUpload" v-bind:disabled="!is_paused">Reprendre</button>
        <button @click="cancelUpload">Annuler</button>
      </div>
      <p class="upload_status" v-if="status">{{ status }}</p>
    </div>
    <button @click="closeUploader">Close</button>
  </div>
</template>

<script>
import Resumable from 'resumablejs';
import JSZip from 'jszip';

export default {
  name: 'FileUploader',
  data() {
    return {
      calls: 0,
      // TODO change value to false when test finished 
      has_upload_started: true,
      status: null,
      is_paused: false,
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
          chunkSize: 2 * 1024 * 1024,
          testChunks: false,
          throttleProgressCallbacks: 1,
          simultaneousUploads: 8,
        });

        this.resumable.on('fileAdded', (file) => {
          console.log('Ajout de fichier :', file.fileName || file.name);
          this.calls = 0;
          this.has_upload_started = true;
          this.resumable.upload();
        });

        this.resumable.on('fileSuccess', (file) => {
          console.log('Succès de téléversement pour', file.fileName || file.name);
          this.has_upload_started = false;
          this.status = "Téléversement terminé avec succès";
          console.log(`${this.calls}`);
        });

        this.resumable.on('fileError', (file) => {
          console.error('Erreur de téléversement pour', file.fileName || file.name);
          alert("Erreur lors du Téléversement");
          this.cancelUpload();
        });

        this.resumable.on('progress', () => {
          // Mettre à jour la valeur de la barre de progression
          this.calls += 1;
          this.progress = Math.floor((this.resumable.progress() * 100));
          console.log('Progress:', this.progress);
        });

      }
    },
    pauseUpload() {
      this.resumable.pause();
      this.is_paused = true;
      this.status = "Téléversement en pause";
    },
    resumeUpload() {
      this.resumable.upload();
      this.is_paused = false;
      this.status = null;
    },
    cancelUpload() {
      this.resumable.cancel();
      this.has_upload_started = false;
      this.status = "Téléversement annulé";
    },
    closeUploader() {
      this.$emit('close');
      if (this.resumable) {
        this.cancelUpload();
      }
    }
  },
};
</script>

<style>
.file_uploader {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
}

progress[value]::-webkit-progress-value {
  background-color: #4CAF50; 
}
</style>