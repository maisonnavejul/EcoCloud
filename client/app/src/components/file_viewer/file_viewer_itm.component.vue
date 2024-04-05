<template>
    <tr class="file_viewer_itm" 
        @click="this.handle_click" 
        @dblclick="this.handle_dblclick">
        <td class="file_itm_checkbox">
            <input type="checkbox" v-model="is_selected"/>
        </td>
        <td class="file_itm_type">
            <img :src="get_icon()" alt="icon" />
        </td>
        <td class="file_itm_name">{{ name }}</td>
        <td class="file_itm_size">{{ size_transform() }}</td>
        <td class="file_itm_created_on">{{ format_date() }}</td>
    </tr>
</template>

<script>
export default {
    name: 'FileViewerItem',
    data() {
        return {
            is_selected: false
        }
    },

    props: {
        path: {
            type: String,
            required: true 
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        created_on: {
            type: Date,
            required: true
        }
    },

    methods: {
        is_folder(type) {
            return type === 'folder';
        },

        handle_click() {
            this.is_selected = !this.is_selected;
        },

        handle_dblclick() {
            this.is_folder(this.type) ? this.open_folder() : this.view_file();
        },

        open_folder() {
            console.log('Open Folder');
        },  

        view_file() {
            // const path = `${this.path}/${this.name}`;
            const path = `${this.path}/${this.name}`
            window.open(path, '_blank');
        },

        size_transform() {
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            let size = this.size;
            let unit_index = 0;

            while (size > 1024 && unit_index < units.length - 1) {
                size /= 1024;
                unit_index++;
            }

            if (size % 1 !== 0) {
                size = size.toFixed(2);
            }

            return `${size} ${units[unit_index]}`;
        
        },

        format_date() {
            const year = this.created_on.getFullYear();
            const month = ("0" + (this.created_on.getMonth() + 1)).slice(-2); // Months are zero based
            const day = ("0" + this.created_on.getDate()).slice(-2);

            return `${year}-${month}-${day}`;
        },

        get_icon() {
            const icon_name = this.is_folder(this.type) ? 'src/assets/icons/folder.png' : 'src/assets/icons/file.png';
            return icon_name;
        }
    }
}
</script>

<style>
.file_viewer_itm {
    margin-bottom: 5%;
    height:  38px;
    width: 100%;
}


.file_viewer_itm > * {
    vertical-align: middle;
}

.file_itm_checkbox {
    vertical-align: middle;
    border-bottom: 1px solid white;
    text-align: center;
}

.file_itm_checkbox input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    outline: none;
    position: relative;
    border: 1px solid white;
}

.file_itm_checkbox input[type="checkbox"]:checked {
    background-color: #335145;
}

.file_itm_checkbox input[type="checkbox"]:not(:checked) {
    background-color: white;
}

.file_itm_checkbox input[type="checkbox"]:checked::after {
    content: "✔";
    position: absolute;
    top: 48%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 9px;
    color: white;
}

.file_itm_type > img {
    width: 22px;
    height: 22px;
}

</style>