import logger from 'loglevel';
import * as _ from '../utils/lodash.js';

import enCommon from './common.en.json';
import enAPI from './api.en.json';
import enCLI from './cli.en.json';
import enUI from './ui.en.json';

import plCommon from './common.pl.json';
import plAPI from './api.pl.json';
import plCLI from './cli.pl.json';
import plUI from './ui.pl.json';

import InternalObjectInitializationError from '../errors/InternalObjectInitializationError.js';

const pl = { ...plCommon, ...plAPI, ...plCLI, ...plUI };
const en = { ...enCommon, ...enAPI, ...enCLI, ...enUI };
const translations = { pl, en };

let instance = null;

export default class Lang {
    constructor(language) {
        if (!instance) {
            instance = this;

            this.language = language;
            this.translations = translations[this.language];

            // Fallback to en if selected language not present
            if (!this.translations) {
                this.translations = translations.en;
            }
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
