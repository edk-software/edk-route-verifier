module.exports = (function(settings) {
    console.log(`Running nightwatch on ${process.platform} platform.`);
    if (process.platform === 'win32') {
        settings.selenium.cli_args['webdriver.chrome.driver']  = './node_modules/chrome-driver-standalone/binaries/chromedriver_win32.exe';
    } else if (process.platform === 'linux'){
        settings.selenium.cli_args['webdriver.chrome.driver']  = './node_modules/chrome-driver-standalone/binaries/chromedriver_linux64';
    }

    return settings;
})(require('./nightwatch.json'));