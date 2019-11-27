import logger from 'loglevel';
import * as _ from '../utils/lodash.js';

import pl from './pl.json';
import en from './en.json';

const translations = { pl, en };

let instance = null;

export default class Lang {
    constructor(language) {
        if (!instance) {
            instance = this;

            this.language = language;
            this.translation = translations[this.language];

            // Fallback to en if selected language not present
            if (!this.translation) {
                this.translation = translations.en;
            }
        }

        return instance;
    }

    trans(literal, properties) {
        const translatedLiteral = this.translation[literal];

        let result = literal;
        if (translatedLiteral) {
            result = _.isEmpty(properties) ? translatedLiteral : _.template(translatedLiteral)(properties);
        } else {
            logger.warn(`No translation found for '${literal}'.`);
        }

        return result;
    }

    static getInstance() {
        return instance;
    }
}
