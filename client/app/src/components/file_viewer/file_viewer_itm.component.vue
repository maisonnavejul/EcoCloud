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
        <td class="file_itm_infos">
            <img src="../../assets/icons/infos_icons/bookmark.png"
                 alt="on-distant-storage"
                 class="file_itm_storage_img"
                 title="This file is saved in distant storage"
                 v-if="this.$props.on_remote" />
            <img src="../../assets/icons/infos_icons/bookmark-empty.png"
                 alt="not-on-distant-storage"
                 class="file_itm_storage_img"
                 title="This file is not saved in distant storage"
                 v-else />
            <p class="file_itm_name">{{ name }}</p>
        </td>
        <td class="file_itm_size">{{ size_transform() }}</td>
        <td class="file_itm_created_on">{{ format_date() }}</td>
        <td class="file_itm_actions" @click="handle_click">
            <img class="itm_rename_action"
                 src="../../assets/icons/actions_icons/pencil.png"
                 alt="rename file"
                 title="Rename File"
                 @click="rename_itm" />
            <img class="itm_move_action"
                 src="../../assets/icons/actions_icons/send.png"
                 alt="move file"
                 title="Move File" 
                 @click="move_file" />
        </td>
    </tr>
</template>

<script>
import { get_file_icon, get_folder_icon } from '../../scripts/data/icon_hashmap.script';

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
            type: String || Date,
            required: true
        },
        on_remote: {
            type: Boolean,
            required: false,
            default: false,
        }
    },

    methods: {
        is_folder(type) {
            return type === 'folder';
        },

        handle_click() {
            this.is_selected = !this.is_selected;
            const obj = {
                name: this.name,
                type: this.type
            }
            this.is_selected ? this.$emit('check', obj) : this.$emit('uncheck', obj);
        },

        handle_dblclick() {
            this.is_folder(this.type) ? this.open_folder() : this.view_file();
        },

        open_folder() {
            this.$emit('navigate', this.name);
        },  

        view_file() {
            // const path = `${this.path}/${this.name}`;
            const path = `${this.$store.state.cwd}/${this.name}`
            const url = `http://207.180.204.159:3000/download?path=${encodeURIComponent(path)}`;
            window.open(url, '_blank');
        },

        size_transform() {
            if (this.is_folder(this.type)) {
                return this.size + ' items';
            } else {
                return this.file_size_transform();
            } 
        },

        file_size_transform() {
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

        format_date(dateString) {
            const date = typeof this.created_on === 'string' ? new Date(this.created_on) : this.created_on
            
            return date.toLocaleDateString("fr-FR");
        },

        get_icon() {
            const ext = this.name.split('.').pop();

            if (this.is_folder(this.type)) {
                return get_folder_icon(ext);
            } else {
                return get_file_icon(ext);
            }
        },

        async rename_itm() {
            const new_name = prompt('Enter new name: ');
            
            if (new_name != null) {
                const old_path = `/${this.$store.state.user.username}${this.$props.path}`
                const body = JSON.stringify({
                    newName: new_name,
                    oldPath: old_path,
                });

                console.log('BODY', body);

                const req = new Request('http://207.180.204.159:3000/rename-file', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: body
                });

                const res = await fetch(req);

                console.log('RES', res);
            }
        },

        move_file() {
            if (this.$store.state.is_moving) {
                return;   
            }

            this.$store.dispatch('set_moving', true);
            this.$store.dispatch('set_moving_file', {name: this.name, path: this.path});
        }
    }
}
</script>

<style>
.file_viewer_itm {
    height:  42px;
    width: 100%;
    transition: 0.3s;
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
    background-color: #51BD8F;
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

.itm_rename_action {
    width: 20px;
    height: 20px;
    cursor: pointer;
    opacity: 0.8;
    margin-right: 7px;
}

.itm_move_action {
    width: 25px;
    height: 25px;
    cursor: pointer;
    opacity: 0.8;
}

.file_itm_infos {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
}

.file_itm_storage_img {
    height: 18px;
    width: 18px;
    margin-right: 10px;
    opacity: 0.6;
}
</style>