const fs = require('fs');

const get_dirs_file = async (path) => {
    await fs.readdir(path, (err, files) => {
        if (err) {
            console.log(err);
        } else {
            console.log(files);
            return files;
        }
    });
};


export default get_dirs_file;