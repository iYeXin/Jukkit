function Logger(prefix) {
    this.prefix = prefix;
    this.javaLogger = java.util.logging.Logger.getLogger(prefix);
}

Logger.prototype = {
    constructor: Logger,

    info(msg) {
        this.javaLogger.info(msg);
    },

    warn(msg) {
        this.javaLogger.warning(msg);
    },
    warning(msg) {
        this.javaLogger.warning(msg);
    },

    error(msg) {
        this.javaLogger.severe(msg);
    },
    severe(msg) {
        this.javaLogger.severe(msg);
    },

    debug(msg) {
        this.javaLogger.fine(msg);
    },
    fine(msg) {
        this.javaLogger.fine(msg);
    },

    finer(msg) {
        this.javaLogger.finer(msg);
    },

    finest(msg) {
        this.javaLogger.finest(msg);
    },

    getPrefix() {
        return this.prefix;
    },

    setPrefix(newPrefix) {
        this.prefix = newPrefix;
        this.javaLogger = java.util.logging.Logger.getLogger(newPrefix);
    }
};

module.exports = Logger;
