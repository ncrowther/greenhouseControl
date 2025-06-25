//  Response is a data class with a build method
class GreenhouseSettings {
    constructor() {
        this.highTemp = 0;
        this.lowTemp = 0;
        this.highHumidity = 0;
        this.lowHumidity = 0;
        this.lux;
        this.lightOn;
        this.lightOff;
        this.wateringDuration = "";
        this.waterTime1 = 0;
        this.waterTime2 = 0;
        this.waterTime3 = 0;
    }

    build(highTemp, lowTemp, highHumidity, lowHumidity, lux, lightOn, lightOff, wateringDuration, waterTime1, waterTime2, waterTime3) {
        this.highTemp = highTemp;
        this.lowTemp = lowTemp;
        this.highHumidity = highHumidity;
        this.lowHumidity = lowHumidity;
        this.lux = lux;
        this.lightOn = lightOn;
        this.lightOff = lightOff;
        this.wateringDuration = wateringDuration;
        this.waterTime1 = waterTime1;
        this.waterTime2 = waterTime2;
        this.waterTime3 = waterTime3;
    }
}

var extractData = exports.extractData = function (generatedResponse) {

    let greenhouseSettings = new GreenhouseSettings();
    let answerParts = generatedResponse.split('\n').filter(line => line.trim() !== '');

    console.log("Raw: " + generatedResponse);
    console.log("Data splits: " + answerParts);
    console.log("Data splits len: " + answerParts.length);
    let i = 0;

    let { highTemp, lowTemp } = extractTemperature(answerParts);
    let { highHumidity, lowHumidity } = extractHumidity(answerParts);
    let { lux, lightOn, lightOff } = extractLight(answerParts);
    let { wateringDuration, waterTime1, waterTime2, waterTime3 } = extractWatering(answerParts);

    greenhouseSettings.build(highTemp, lowTemp, highHumidity, lowHumidity, lux, lightOn, lightOff, wateringDuration, waterTime1, waterTime2, waterTime3);

    return greenhouseSettings;

    function extractTemperature(answerParts) {

        console.log("*** extractTemperature : " + answerParts);

        let highTemp = 30;
        let lowTemp = 10;
        const temperatureTok = "Temperature";
        let pos = 0;
        for (i = 0; i < answerParts.length - 1; i++) {

            console.log(" Answer part : " + answerParts[i]);

            if (answerParts[i].includes(temperatureTok)) {
                temperature = answerParts[i].trim();

                const match = temperature.match(/(\d+)\s*-\s*(\d+)/);

                if (match) {
                    const low = match[1];
                    const high = match[2];
                    console.log(`Low: ${low}, High: ${high}`);

                    lowTemp = match[1];
                    highTemp = match[2];
                }

                pos++;
            }
        }
        return { highTemp, lowTemp };
    }

    function extractHumidity(answerParts) {
        let highHumidity = 80;
        let lowHumidity = 10;
        const humidityTok = "Humidity";
        let pos = 0;
        for (i = 0; i < answerParts.length - 1; i++) {

            if (answerParts[i].includes(humidityTok)) {
                humidity = answerParts[i].trim();

                console.log("Humidty Answer part : " + humidity);

                const match = humidity.match(/(\d+)\s*-\s*(\d+)/);

                if (match) {
                    const low = match[1];
                    const high = match[2];
                    console.log(`Low: ${low}, High: ${high}`);

                    lowHumidity = match[1];
                    highHumidity = match[2];
                }

                pos++;
            }
        }
        return { highHumidity, lowHumidity };
    }

    function extractLight(answerParts) {
        let lux = 250
        let lightOn = 8
        let lightOff = 18

        const lightTok = "Light";
        let pos = 0;

        for (i = 0; i < answerParts.length - 1; i++) {

            if (answerParts[i].includes(lightTok)) {
                let light = answerParts[i].trim();

                console.log("Light Answer part : " + light);

                const match = light.match(/\|.*Light.*\|\s*([^\|]+)\|/);

                if (match) {
                    let lightLevel = match[1].trim().toUpperCase();
                    console.log(`Light Level: ${lightLevel}`);

                    if (lightLevel === 'SHADE') {
                        lux = 250
                        lightOn = 8
                        lightOff = 19
                    }

                    if (lightLevel === 'PARTIAL SHADE') {
                        lux = 500
                        lightOn = 8
                        lightOff = 20
                    }

                    if (lightLevel === 'FULL SUN') {
                        lux = 1000
                        lightOn = 8
                        lightOff = 21
                    }
                }

                pos++;
            }
        }
        return { lux, lightOn, lightOff };
    }

    function extractWatering(answerParts) {
        let wateringDuration = 1;
        let waterTime1 = "8";
        let waterTime2 = "8";
        let waterTime3 = "8";

        const wateringTok = "Watering";
        let pos = 0;

        for (i = 0; i < answerParts.length; i++) {

            if (answerParts[i].includes(wateringTok)) {
                watering = answerParts[i].trim();

                console.log("watering Answer part : " + watering);

                const match = watering.match(/\|.*Watering.*\|\s*([^\|]+)\|/);

                console.log(`Watering match: ${match}`);

                if (match) {
                    wateringDuration = match[1].trim().toUpperCase();
                    console.log(`Watering Level: ${wateringDuration}`);

                    if (wateringDuration === 'HIGH') {
                        wateringDuration = 6
                        waterTime1 = "8";
                        waterTime2 = "12";
                        waterTime3 = "18";
                    }

                    if (wateringDuration === 'MEDIUM') {
                        wateringDuration = 3
                        waterTime1 = "8";
                        waterTime2 = "12";
                        waterTime3 = "12";
                    }

                    if (wateringDuration === 'LOW') {
                        wateringDuration = 1
                        waterTime1 = "8";
                        waterTime2 = "8";
                        waterTime3 = "8";
                    }
                }

                pos++;
            }
        }
        return { wateringDuration, waterTime1, waterTime2, waterTime3 };
    }
}


