String.prototype.toCamelCase = function () {
  return this.valueOf().replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}