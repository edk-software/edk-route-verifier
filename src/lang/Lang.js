import * as _ from '../utils/lodash';

const pl = require('./pl');
const en = require('./en');

const translations = { pl, en };
let instance = null;

export default class Lang {
    constructor(language) {
        if (!instance) {
            instance = this;
        }

        this.language = language;
        this.translation = translations[this.language];

        // Fallback to en if selected language not present
        if (!this.translation) {
            this.translation = translations.en;
        }

        return instance;
    }

    getString(literal, properties) {
        return !_.isEmpty(properties)
            ? _.template(this.translation[literal] || '')(properties)
            : this.translation[literal] || '';
    }

    static getInstance() {
        return instance;
    }
}
