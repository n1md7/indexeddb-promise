var Config = /** @class */ (function () {
  function Config(config) {
    this.config = config;
  }
  Config.prototype.verify = function (data) {
    var structure = this.config.structure;
    var keys = Object.keys(data);
    keys.forEach(function (key) {
      if (!structure.hasOwnProperty(key)) {
        throw new Error('No such key [' + key + '] is defined in [setup config]');
      }
    });
    if (!this.config.primaryKey.autoIncrement) {
      if (!keys.hasOwnProperty(this.config.primaryKey.name)) {
        throw new Error('Add primary key as well or change it to autoincrement = true');
      }
    }
    if (this.config.debug) {
      console.info('Available column names: ', this.config.structure);
      console.info('Primary key: ', this.config.primaryKey);
    }
    return data;
  };
  return Config;
})();
//# sourceMappingURL=index.js.map
