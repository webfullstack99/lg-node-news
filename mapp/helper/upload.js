const fs = require('fs');

const randomstring = require('randomstring');
const jimp = require('jimp');
const path = require('path');

let extAccepted = conf.upload.image.ext;
let sizeAccepted = conf.upload.image.fileSize;
let upload = {
    // optional{sizeAccepted{min, max}, extAccepted{string}}
    check: function (file, optional = {}){
        sizeAccepted = optional.sizeAccepted || sizeAccepted;
        extAccepted = optional.extAccepted || extAccepted;
        let err = [];
        let fileInfo = path.parse(file.originalname);
        err = this.checkExt(fileInfo.ext, err);
        err = this.checkSize(file.size, err);
        return err;
    },

    checkSize: function (size, err){
        if (size < sizeAccepted.min || size > sizeAccepted.max) err.push('size is invalid');
        return err;
    },

    checkExt: function (ext, err){
        ext = ext.replace('.', '');
        if (!ext.match(new RegExp(extAccepted, 'i'))) err.push('extension is invalid');
        return err;
    },

    // optional{filenameLength(int)}
    save: function (file, controller, optional = {}){
        if (optional.resize) this.resize = optional.resize;
        else this.resize = {width: 200, height: 200};
        let type = optional.type || 'default';
        let filenameLength = optional.filenameLength || 10;
        let fileInfo = path.parse(file.originalname);
        let filename = randomstring.generate(filenameLength)+fileInfo.ext;
        this.saveOriginal(filename, file, controller, type);
        this.saveResize(filename, file, controller, type);
        return filename;
    },

    saveOriginal: function (filename, file, controller, type){
        let path = __path.files+`/${controller}/${conf.name.folder.original}/${filename}`;
        let imgData = (type=='default') ? file.buffer : file.url;
        jimp.read(imgData)
        .then(image => {
            return image
            .quality(100) // set JPEG quality
            .write(path); // save
        })
        .catch(err => {
            console.error(err);
        });
    },

    saveResize:  function (filename, file, controller, type = 'default'){
        let path = __path.files+`/${controller}/${conf.name.folder.resize}/${filename}`;
        //let path = __path.files+`/temp/${filename}`;
        switch (type){
            case 'base64':
                let imgData = file.base64.replace(/^data:image\/png;base64,/, "");
                fs.writeFile(path, imgData, 'base64', function(err) {
                    console.log(err);
                });
                break;

            case 'url':
                jimp.read(file.url)
                .then(image => {
                    return image
                    .cover(this.resize.width, this.resize.height)
                    .quality(100) // set JPEG quality
                    .write(path); // save
                })
                .catch(err => {
                    console.error(err);
                });
                break;

            case 'default':
                jimp.read(file.buffer)
                .then(image => {
                    return image
                    .cover(this.resize.width, this.resize.height)
                    .quality(100) // set JPEG quality
                    .write(path); // save
                })
                .catch(err => {
                    console.error(err);
                });
                break;
        }
    },

    remove(filename, controller){
        if (filename != 'sample.png'){
            let path;
            path = __path.files+`/${controller}/${conf.name.folder.original}/${filename}`;
            if (fs.existsSync(path)) fs.unlink(path, (err) => console.log(err));
            path = __path.files+`/${controller}/${conf.name.folder.resize}/${filename}`;
            if (fs.existsSync(path)) fs.unlink(path, (err) => console.log(err));
        }
    }
}
module.exports = upload;