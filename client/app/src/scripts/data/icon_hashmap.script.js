const icon_hashmap = {
    "png": "src/assets/icons/file_icons/image.png",
    "jpg": "src/assets/icons/file_icons/image.png",
    "jpeg": "src/assets/icons/file_icons/image.png",
    "gif": "src/assets/icons/file_icons/image.png",
    "svg": "src/assets/icons/file_icons/image.png",
    "pdf": "src/assets/icons/file_icons/pdf.png",
    "docx": "src/assets/icons/file_icons/docx-file.png",
    "pptx": "src/assets/icons/file_icons/pptx.png",
    "xlsx": "src/assets/icons/file_icons/xlsx.png",
    "txt": "src/assets/icons/file_icons/file.png",
};

const folder_icon_hashmap = {
    "zip": "src/assets/icons/file_icons/zip-folder.png",
    "rar": "src/assets/icons/file_icons/zip-folder.png",
    "tar": "src/assets/icons/file_icons/zip-folder.png",
    "7z": "src/assets/icons/file_icons/zip-folder.png",
    "folder": "src/assets/icons/file_icons/folder.png",
}

export const get_file_icon = (file_ext) => {
    if (file_ext in icon_hashmap) {
        return icon_hashmap[file_ext];
    } else {
        return icon_hashmap["txt"];
    }
}

export const get_folder_icon = (folder_ext) => {
    if (folder_ext in folder_icon_hashmap) {
        return folder_icon_hashmap[folder_ext];
    } else {
        return folder_icon_hashmap["folder"];
    }
}


