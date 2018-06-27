const fs = require('fs');
const path = require('path');
const deleteEmpty = require('delete-empty');

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
            flattenPackage.push(el);
          }
        });
    });

    files.forEach(file => {
      let filePath = path.parse(file);
      // Strips the final extension
      let name = filePath.base;
      // If the regex finds .page or .cls with meta do not remove it.
      if(!name.match(/\..*\-meta/).includes('.page') || !name.match(/\..*\-meta/).includes('.cls')) {
        name.replace(/\.[^/.]+$/, '').replace(/\..*\-meta/,'');
      } else {
        // Strip off the -meta
        name.replace(/\..*\-meta/);
      }
      if(flattenPackage.indexOf(name) === -1){
        fs.unlinkSync(file);
      }
    })

    deleteEmpty.sync(config.repo + '/src')
  }
};