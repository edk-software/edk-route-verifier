import logger from 'loglevel';
import * as _ from '../utils/lodash.js';
import InternalObjectInitializationError from '../errors/InternalObjectInitializationError.js';

import en from './en/index.js';
import pl from './pl/index.js';

const translations = { pl, en };

let instance = null;

export default class Lang {
    constructor(language) {
        instance = this;

        this.language = language;
        this.translations = translations[this.language];

        // Fallback to en if selected language not present
        if (!this.translations) {
            this.translations = translations.en;
        }

        return instance;
    }

    trans(literal, properties) {
        logger.debug('Translating literal:', literal);
        const translatedLiteral = this.translations[literal];

        let result = literal;
        if (translatedLiteral) {
            try {
                result = _.isEmpty(properties) ? translatedLiteral : _.template(translatedLiteral)(properties);
            } catch (error) {
                logger.error('Error translating literal: "', literal, '" with properties: "', properties, '"');
                return literal;
            }
        } else {
            logger.warn(`No translation found for '${literal}'.`);
        }

        return result;
    }

    getTranslations() {
        return this.translations;
    }

    static getInstance() {
        if (!instance) {
            throw new InternalObjectInitializationError('Internal language not initialized.');
        }

        return instance;
    }
}
