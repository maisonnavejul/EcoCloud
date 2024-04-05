<template>
  <div class="file_uploader">
    <div class="file_uploader_content">
      <div class="uploader_button">
        <!-- Bouton pour envoyer des fichiers -->
        <div class="file_selector">
          <button class="btn_selector"
                  @click="trigger_file_upload">Select. fichiers</button>
          <input type="file" 
                 id="fileUpload" 
                 class="file_input" 
                 ref="file_input"
                 multiple 
                 @change="handleFiles(false, $event)"
                 style="display: none"/>
        </div>

        <!-- Bouton pour envoyer des dossiers -->
        <div class="folder_selector">
          <button class="btn_selector" 
                  @click="trigger_folder_upload">Select. dossiers</button>
          <input type="file" 
                 id="folderUpload" 
                 class="file_input" 
                 ref="folder_input"
                 webkitdirectory 
                 directory 
                 multiple 
                 @change="handleFiles(true, $event)" 
                 style="display: none" />
        </div>
      </div>

      <div class="file_selected">
        <p v-if="file_selected">{{ file_selected }}</p>
      </div>

      <!-- Barre de progression -->
      <div class="progress_bar" v-if="has_upload_started">
        <progress :value="progress" max="100"></progress>
        <div class="progress_toolbar">
          <img src="../../assets/icons/video.png" 
               @click="pauseUpload" 
               :class="{ 'enabled_img': !is_paused, 'disabled-img': is_paused }" />
          <img src="../../assets/icons/play-button.png" 
               @click="resumeUpload" 
               :class="{ 'enabled_img': is_paused, 'disabled-img': !is_paused }">
          <img src="../../assets/icons/close.png"
               @click="cancelUpload" />
        </div>
      </div>
      <p class="upload_status" v-if="status">{{ status }}</p>
    </div>
    
    <div class="file_saver" 
         @click="this.change_save_check" 
         v-if="!status" >
      <input type="checkbox" class="file_saver_checkbox" v-model="is_save_checked" />
      <p>Sauvegarder le fichier</p>
      <Tooltip :content="tooltip_content"/>
    </div>
    
    <button class="close_btn" @click="closeUploader">Close</button>
  </div>
</template>

<script>
import Resumable from 'resumablejs';
import JSZip from 'jszip';

import Tooltip from '../tooltip/tooltip.component.vue';

export default {
  name: 'FileUploader',
  
  components: {
    Tooltip,
  },

  data() {
    return {
      calls: 0,
      has_upload_started: false, 
      is_save_checked: false,
      file_selected: null,
      status: null, // TODO change value to null when test finished
      is_paused: false,
      resumable: null,
      zip: new JSZip(),
      progress: 0,
      tooltip_content: "Cette option permet de sauvergarder le fichier envoyé sur le serveur distant en plus de votre espace cloud. Cette option vous permet de récupérer vos fichiers en cas de panne du serveur EcoCloud. Utilisez cette option pour vos fichiers importants.",
    };
  },
  
  methods: {
    trigger_file_upload() {
      this.$refs.file_input.click();
    },
    trigger_folder_upload() {
      this.$refs.folder_input.click();
    },
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

          this.file_selected = folderName;

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
            this.file_selected = file.name;
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
          this.status = this.progress + "%";
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
      this.file_selected = null;
      this.has_upload_started = false;
      this.status = "Téléversement annulé";
      this.resumable = null;
    },
    closeUploader() {
      if (this.resumable) {
        this.cancelUpload();
      }
      this.$emit('close');
      this.$emit('refresh');
    },
    change_save_check() {
      this.is_save_checked = !this.is_save_checked;
    },
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

.file_input {
  font-size: 13px;
  margin-bottom: 5px;
}

.uploader_button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
}

.uploader_button > * {
  margin: 0px 5px;
}

.btn_selector {
  border-radius: 10px;
  border: 1px solid #a9a9a9;
  height: 26px;
  width: 125px;
  font-size: 14px;
}

.file_selected {
  text-align: center;
  font-size: 14px;
  margin-bottom: 5px;
}

.progress_bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

progress {
  width: 100%;
  margin-bottom: 5px;
}

progress::-webkit-progress-value {
  background-color: #335145; 
}

.progress_toolbar {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.progress_toolbar > * {
  margin-right: 5px;
  height: 22px;
  width: 22px;
}

.upload_status {
  font-size: 14px;
  text-align: center;
  width: 100%;
  margin: 5px 0px;
}

.file_saver {
  display: flex;
  flex-direction: row;
  font-size: 11px;
  align-items: center;

  width: 100%;
}

.file_saver > * {
  margin-right: 2px;
}

.file_saver_checkbox {
  appearance: none;
  background-color: #fafafa;
  border: 1px solid #adb8c0;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  position: relative;
  outline: none;
  cursor: pointer;
  margin-right: 7px;
}

.file_saver_checkbox:checked {
  background-color: #335145;
  border-color: #adb8c0;
}

.close_btn {
  background-color: #335145;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  margin-top: 10px;
}
</style>