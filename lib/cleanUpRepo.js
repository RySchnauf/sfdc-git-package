const fs = require('fs');
const path = require('path');

function cleanEmptyFoldersRecursively(folder) {

  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function(file) {
      var fullPath = path.join(folder, file);
      cleanEmptyFoldersRecursively(fullPath);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }

  if (files.length == 0) {
    fs.rmdirSync(folder);
    return;
  }
}

module.exports = function(config,package) {
  let walkSync = dir =>
     fs.lstatSync(dir).isDirectory()
      ? fs.readdirSync(dir).map(f => walkSync(path.join(dir, f)))
      : dir

  const flatten = arr => arr.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
  );

  this.cleanUpRepo = () => {
    let files = walkSync(config.repo+'/src');
    files = flatten(files);

    let flattenPackage = []

    Object.keys(package).forEach(key => {
        package[key].forEach(el => {
          if(el !== 'undefined'){
            el = el.replace(/^.+[/]/,'')
            flattenPackage.push(el);
          }
        });
    });

    files.forEach(file => {
      let filePath = path.parse(file);
      let name = filePath.base.replace(/\.[^/.]+$/, '').replace(/\..*\-meta/,''); //does this need to be adjusted?
      if(flattenPackage.indexOf(name) === -1){
        fs.unlinkSync(file);
      }
      //maybe delete empty directories here?
    })
    cleanEmptyFoldersRecursively(config.repo+'/src');
  }
};

