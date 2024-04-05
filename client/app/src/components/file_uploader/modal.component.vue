<template>
    <div class="modal" @click="outsideModalClick">
        <div class="modal-content" @click.stop>
            <FileUploader ref="file_uploader" @close="$emit('close')"/>
        </div>
    </div>
</template>

<script>
import FileUploader from './file_uploader.component.vue';
export default {
    name: 'FileUploaderModal',
    components: {
        FileUploader,
    },

    methods: {
        outsideModalClick() {
            this.$refs.file_uploader.closeUploader();
        }

    }
}
</script>

<style scoped>
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  
  width: 100%;
  height: 100%;
  overflow: none;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  border-radius: 10px;
  width: fit-content;
  height: fit-content;
}
</style>