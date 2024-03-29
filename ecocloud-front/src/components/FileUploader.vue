<template>
  <div>
    <input type="file" id="fileUpload" />
    <button @click="pauseUpload">Pause</button>
    <button @click="resumeUpload">Resume</button>
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
      target: 'http://localhost:3000/upload', // Assurez-vous de remplacer par votre propre endpoint serveur
      chunkSize: 1 * 1024 * 1024, // 1MB
      testChunks: false,
      throttleProgressCallbacks: 1,
    });

    if (this.resumable.support) {
      this.resumable.assignBrowse(document.getElementById('fileUpload'));

this.resumable.on('fileAdded', () => {
  this.resumable.upload();
});


      this.resumable.on('fileSuccess', (file, message) => {
        console.log('File success', file, message);
      });

      this.resumable.on('fileError', (file, message) => {
        console.error('File error', file, message);
      });
    } else {
      console.error("Votre navigateur ne supporte pas l'API File nécessaire pour utiliser Resumable.js");
    }
  },
  methods: {
    pauseUpload() {
      this.resumable.pause();
    },
    resumeUpload() {
      this.resumable.upload();
    }
  }
}
</script>
