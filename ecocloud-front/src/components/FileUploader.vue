<template>
  <div>
    <div>
      <input type="file" id="fileUpload" multiple @change="handleFiles(false, $event)" />
      <button @click="pauseUpload">Pause</button>
      <button @click="resumeUpload">Reprendre</button>
      <input type="file" id="folderUpload" webkitdirectory directory multiple @change="handleFiles(true, $event)" />
      <div v-if="resumable">
        <progress :value="progress" max="100"></progress>
        <p>Progression : {{ progress }}%</p>
      </div>
    <button @click="fetchFilesList('')">Racine</button>
    <ul>
      <li v-for="item in filesList" :key="item.name" @click="handleItemClick(item)">
        <div><strong>Nom :</strong> {{ item.name }}</div>
        <div>Type : {{ item.type }}</div>
        <div>Taille : {{ formatSize(item.size) }}</div>
        <div>Date de création : {{ formatDate(item.createdAt) }}</div>
      </li>
    </ul>
    </div>
  </div>
</template>

<script>
import Resumable from 'resumablejs';
import JSZip from 'jszip';

export default {
  data() {
    return {
      filesList: [],
      resumable: null,
      progress: 0,
    };
  },
  methods: {
    async fetchFilesList(path) {
      try {
        const response = await fetch(`http://207.180.204.159:3000/test-recup?path=${encodeURIComponent(path)}`);
        if (!response.ok) throw new Error('Erreur réseau');
        this.filesList = await response.json();
      } catch (error) {
        console.error('Erreur lors de la récupération des fichiers:', error);
      }
    },
    handleItemClick(item) {
      if (item.type === 'Folder') {
        this.fetchFilesList(`${item.name}`);
      }
    },
    formatSize(size) {
      if (size === undefined) return 'N/A';
      if (size < 1024) return `${size} bytes`;
      else if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
      else if (size < 1073741824) return `${(size / 1048576).toFixed(1)} MB`;
      return `${(size / 1073741824).toFixed(1)} GB`;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    handleFiles(isDirectory, event) {
      const files = event.target.files;
      if (!this.resumable) this.setUpResumable();

      if (isDirectory) {
        const zip = new JSZip();
        Array.from(files).forEach(file => {
          const relativePath = file.webkitRelativePath || file.name;
          zip.file(relativePath, file);
        });

        zip.generateAsync({ type: "blob" }).then(content => {
          const zipFile = new File([content], "archive.zip", { type: "application/zip" });
          this.resumable.addFile(zipFile);
        });
      } else {
        Array.from(files).forEach(file => {
          this.resumable.addFile(file);
        });
      }
    },
    setUpResumable() {
      this.resumable = new Resumable({
        target: 'http://207.180.204.159:3000/upload',
        chunkSize: 1 * 1024 * 1024, // 1 MB
        testChunks: false,
        throttleProgressCallbacks: 1,
        simultaneousUploads: 4,
      });

      this.resumable.on('fileAdded', file => {
        console.log('Ajout de fichier :', file.fileName);
        this.resumable.upload();
      });

      this.resumable.on('fileSuccess', (file) => {
  console.log('Fichier téléversé avec succès :', file.fileName);
});

this.resumable.on('fileError', (file) => {
  console.error('Erreur lors du téléversement du fichier :', file.fileName);
});

      this.resumable.on('progress', () => {
        this.progress = Math.floor(this.resumable.progress() * 100);
      });
    },
    pauseUpload() {
      this.resumable.pause();
    },
    resumeUpload() {
      this.resumable.upload();
    },
  },
  mounted() {
    this.fetchFilesList('');
  },
};
</script>
