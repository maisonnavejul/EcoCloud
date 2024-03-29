<template>
  <div>
    <input type="file" id="fileUpload" multiple />
    <button @click="pauseUpload">Pause</button>
    <button @click="resumeUpload">Reprendre</button>
  </div>
</template>

<script>
import Resumable from 'resumablejs';

export default {
  data() {
    return {
      resumable: null,
    };
  },
  mounted() {
    this.resumable = new Resumable({
      target: 'http://localhost:3000/upload',
      chunkSize: 1 * 1024 * 1024, // Ajustez la taille des chunks selon vos besoins
      testChunks: false,
      throttleProgressCallbacks: 1,
      simultaneousUploads: 4, // Ajustez pour des téléversements simultanés
      fileTypeErrorCallback: function(file) { // Supprimez `errorCount`
        alert(file.fileName + ' a une extension non supportée.');
      },
      maxFileSizeErrorCallback: function(file) { // Supprimez `errorCount`
        alert(file.fileName + ' est trop volumineux.');
      }
    });

    this.resumable.assignBrowse(document.getElementById('fileUpload'), true);

    this.resumable.on('fileAdded', (file) => {
      console.log('Ajout de fichier :', file.fileName);
      this.resumable.upload();
    });

    this.resumable.on('fileSuccess', (file) => {
      console.log('Succès de téléversement pour', file.fileName);
    });

    this.resumable.on('fileError', (file) => {
      console.error('Erreur de téléversement pour', file.fileName);
    });
  },
  methods: {
    pauseUpload() {
      this.resumable.pause();
    },
    resumeUpload() {
      this.resumable.upload();
    },
  },
};
</script>
