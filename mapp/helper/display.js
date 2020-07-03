let displayPath = __path.config_display;

module.exports  = {
    prefix: require(displayPath+'/prefix'),
    backend: require(displayPath+'/backend'),
    frontend: require(displayPath+'/frontend'),
}