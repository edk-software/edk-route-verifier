import logger from 'loglevel';
import * as _ from '../utils/lodash.js';

import pl from './pl.json';
import en from './en.json';
import InternalObjectInitializationError from '../errors/InternalObjectInitializationError.js';

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
        logger.debug('Translating literal:', literal);
        const translatedLiteral = this.translation[literal];

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

    static getInstance() {
        if (!instance) {
            throw new InternalObjectInitializationError('Internal language not initialized.');
        }

        return instance;
    }
}
