/* *
 * Stundenbuch-Skill
 * by Stefan Bamesberger
 * Projekt zur Magisterarbeit: "Alexa, bete mit mir die Laudes"
 * */
 
 
 // Load sub-services
const Alexa = require('ask-sdk-core');
const https = require('https');
const jsdom = require("jsdom");
const AWS = require("aws-sdk");
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');


/* *
* Custom parameters
* */

var halleluja = "";
var hymnus = "";
var hymnusfull = "";
var antiphon1 = '';
var psalm1 = '';
var psalm1title = '';
var antiphon2 = '';
var psalm2 = '';
var psalm2title = '';
var antiphon3 = '';
var psalm3 = '';
var psalm3title = '';
var reading = '';
var readingtitle = '';
var resp1 = '';
var resp2 = '';
var resp3 = '';
var antiphonC = '';
var benedictus = '';
var benedictustitle = '';
var icprayer = '';
var icresp = '';
var ic = '';
var oration = '';

/* *
* Settings parameters
* */
const dateoptions = { timeZone: 'Europe/Berlin' };
const timeoptions = { timeZone: 'Europe/Berlin', minute:'2-digit', hour:'2-digit' };




// http -> Loading web data
const httpGet = function(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            res.setEncoding('utf8');
        
            let returnData ='';
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`${res.statusCode}: ${res.req.getHeader('host')} ${res.req.path}`));
            }
        
            //accept incoming data asynchronously
            res.on('data', chunk => {
                returnData += chunk;
            });
        
            res.on('error', error => {
                reject(error);
            });
        
            //return the data when streaming is complete
            res.on('end', () => {
                resolve(returnData);
            });
        });
        req.end();
    });
}


// !!! Beginning the Skill (Launch Invokation)
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        var speakOutput = '<speak>Herzlich Willkommen! "Beten im Alltag" lädt Dich zur Feier der Tagzeitenliturgie ein. Sage <phoneme alphabet="ipa" ph="ˈmɔʁɡn̩ɡəˌbeːt">Morgengebet</phoneme>, um mit mir zusammen die <phoneme alphabet="ipa" ph="ˈlaʊ̯dˈɛs">Laudes</phoneme> zu beten. ';
        speakOutput = speakOutput + 'Wenn Du möchtest, dass ich Dir dabei den Ablauf der Liturgie erkläre, dann sage "Erkläre mir das <phoneme alphabet="ipa" ph="ˈmɔʁɡn̩ɡəˌbeːt">Morgengebet</phoneme>".</speak>';
        console.log(`Skill start`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// !!! LAUDES
const LaudesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'LaudesIntent' || Alexa.getIntentName(handlerInput.requestEnvelope) === 'LaudesExplainIntent');
    },
    async handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        
        var dialogslot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'DialogSlot'); // Answer when praying
        var text = ''; // Alexa speech text
        var pretext = ''; // Text before speech-text (e.g. explanation, sound or invitation)
        var aftertext = ''; // Text after speech-text (e.g. break)
        let explainlaudes = false; // Check for LaudesExplainIntent
        
        
        // Check for LaudesExplainIntent
        if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'LaudesExplainIntent') {
            explainlaudes = true;
        }
        
        
        // Load date and time
        let date = new Date().toLocaleDateString('de-DE', dateoptions);
        let time = new Date().toLocaleTimeString('de-DE', timeoptions);
        let timeArray = time.split(":");
        let hours = parseInt(timeArray[0]);
        let minutes = parseInt(timeArray[1]);
        
        
        // Load session attributes
        let persistenceCount = 0;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (!sessionAttributes.psalmposition) {
            sessionAttributes.psalmposition = 1;
            persistenceCount++;
        }
        if (!sessionAttributes.majorposition) {
            sessionAttributes.majorposition = 1;
            persistenceCount++;
        }
        if (!sessionAttributes.lasttext) {
            sessionAttributes.lasttext = "";
            persistenceCount++;
        }
        if (!sessionAttributes.nospeakText) {
            sessionAttributes.nospeakText = "";
            persistenceCount++;
        }
        
        // Load persistence attributes
        if (persistenceCount === 4) {
            persistenceCount = 0;
            
            const attributesManager = handlerInput.attributesManager;
            const persistenceAttributes = await attributesManager.getPersistentAttributes() || {};
            
            if (persistenceAttributes.date && (persistenceAttributes.date === date)) {
                if (persistenceAttributes.psalmposition) {
                    sessionAttributes.psalmposition = persistenceAttributes.psalmposition;
                }
                if (persistenceAttributes.majorposition) {
                    sessionAttributes.majorposition = persistenceAttributes.majorposition;
                }
                if (persistenceAttributes.lasttext) {
                    sessionAttributes.lasttext = persistenceAttributes.lasttext;
                }
                if (persistenceAttributes.nospeakText) {
                    sessionAttributes.nospeakText = persistenceAttributes.nospeakText;
                }
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            }
        }
        
        // Check for data update in progress (time around midnight)
        if ((hours === 23) && (minutes >= 40)) {
            return handlerInput.responseBuilder
                .speak('<speak>' + "Zur Zeit werden die liturgischen Texte für den kommenden Tag bereitgestellt, weswegen ich im Moment nicht mit Dir beten kann. Bitte versuche es nach Mitternacht noch einmal!" + '</speak>')
                .withShouldEndSession(true)
                .getResponse();
        }
        
        
        // Load Laudes data asynchronously
        let html;
        try {
            html = await httpGet('https://stundenbuch.bamesbst.de/laudes/?pw1=DL7-2022');
        } catch (e) {
            ErrorLoad(handlerInput);
        }
        // Parsing web text
        const parser = new jsdom.JSDOM(html);
        doWebParsing(parser);
        
        
        
        // Check if Reset
        // (Restarting the skill with undefined DialogSlot)
        if (dialogslot === undefined && (sessionAttributes.majorposition !== 1 || sessionAttributes.psalmposition !== 1)) {
            text = 'Du hast vor Kurzem bereits das Gebet der <phoneme alphabet="ipa" ph="ˈlaʊ̯dˈɛs">Laudes</phoneme> begonnen. Möchtest Du an der gleichen Stelle fortfahren?';
            
            setQuestion(handlerInput, 'LaudesResume');
            // Explain Laudes
            if (explainlaudes) {
                setQuestion(handlerInput, 'LaudesResume_Explain');
            }
            
            return handlerInput.responseBuilder
                .speak('<speak>' + text + '</speak>')
                .reprompt(text)
                .getResponse();
        }
        
        
        // Start Laudes
        if (sessionAttributes.majorposition === 1 && sessionAttributes.psalmposition === 1) {
            text = 'Lass uns zusammen die <phoneme alphabet="ipa" ph="ˈlaʊ̯dˈɛs">Laudes</phoneme> beten! Um gemeinsam und im Wechsel zu Beten benötigst Du die Texte aus der Stundenbuch-App des Deutschen Liturgischen Instituts. Bist Du bereit?';
            
            // Explain Laudes
            if (explainlaudes) {
                text = 'Lass uns zusammen die <phoneme alphabet="ipa" ph="ˈlaʊ̯dˈɛs">Laudes</phoneme> beten! Mit diesem <phoneme alphabet="ipa" ph="ˈmɔʁɡn̩ɡəˌbeːt">Morgengebet</phoneme> wollen wir am Morgen, bei Sonnenaufgang, mit Lobpreis und im Gebet zu Gott den Tag beginnen. <break time="0.7s"/>';
                text = text + 'Um gemeinsam und im Wechsel zu Beten benötigst Du die Texte aus der Stundenbuch-App des Deutschen Liturgischen Instituts. Bist Du bereit?';
            }
            
            setQuestion(handlerInput, 'Beginn');
            // Explain Laudes
            if (explainlaudes) {
                setQuestion(handlerInput, 'Beginn_Explain');
            }
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return handlerInput.responseBuilder
                .speak('<speak>' + text + '</speak>')
                .reprompt(text)
                .getResponse();
        }
        
        
        // Doxologie
        if (sessionAttributes.majorposition === 2) {
            sessionAttributes.majorposition++;
            
            text = 'Ehre sei dem Vater und dem Sohn und dem Heiligen Geist';
            pretext = pretext + '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>';
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, text, '', '', false, 1);
        }
        
        
        
        // Hymnus
        if (sessionAttributes.majorposition === 3 && sessionAttributes.psalmposition === 1) {
            sessionAttributes.lasttext = "Wie im Anfang so auch jetzt und alle Zeit und in Ewigkeit. Amen." + halleluja;
            text = hymnus[0].textContent;
            pretext = 'Wir beginnen mit dem Hymnus: <break time="0.7s"/>'
            sessionAttributes.psalmposition++;
            
            // Explain Laudes
            if (explainlaudes) {
                pretext = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/>Am Beginn der <phoneme alphabet="ipa" ph="ˈlaʊ̯dˈɛs">Laudes</phoneme> steht der Hymnus. ';
                pretext = pretext + 'Er stimmt in die Gebetszeit ein und besingt den Tagesanbruch. Wir beten die Blöcke im Wechsel. <break time="1.0s"/>';
                pretext = pretext + 'Wenn Du möchtest, kannst Du zum Hymnus, der am Anfang dieser Gebetszeit steht, aufstehen. <break time="1.5s"/>';
            }
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, text, pretext, '<break time="0.5s"/>', false);
        } else if (sessionAttributes.majorposition === 3) {
            if (sessionAttributes.psalmposition % 2 === 0 && sessionAttributes.psalmposition <= hymnus.length) {
                sessionAttributes.lasttext = hymnus[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
            }
            if (sessionAttributes.psalmposition % 2 !== 0 && sessionAttributes.psalmposition <= hymnus.length) {
                text = hymnus[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
                if (sessionAttributes.psalmposition <= hymnus.length) {
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false, 1);
                } else {
                    sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '<break time="0.5s"/>', '<break time="2s"/>');
                }
            }
            
            if (sessionAttributes.psalmposition >= hymnus.length) {
                sessionAttributes.psalmposition = 1;
                sessionAttributes.majorposition++;
            }
        }
        
        
        // !! PS 1
        // Antiphon 1 Beginning
        if (sessionAttributes.majorposition === 4 && sessionAttributes.psalmposition === 1) {
            sessionAttributes.psalmposition = 1;
            sessionAttributes.majorposition++;
            
            pretext = "";
            
            // Explain Laudes
            if (explainlaudes) {
                pretext = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/>Es folgt nun die Psalmodie. Sie besteht aus einem Psalm, dem alttestamentlichen Canticum und einem weiteren Psalm. ';
                pretext = pretext + 'Mit dem Sprechen dieser Psalmtexte und Psalmlieder befinden wir uns betend vor Gott, so wie es auch schon in biblischen Zeiten mit diesen Texten geschah. <break time="0.7s"/>';
                pretext = pretext + 'Vor jedem Psalm wird eine <phoneme alphabet="ipa" ph="ˈʁaːməndə">rahmende</phoneme> Antiphon gesprochen und einmal wiederholt. Das Gebet der Psalmverse folgt dann im Wechsel. ';
                pretext = pretext + 'Am Ende jedes <phoneme alphabet="ipa" ph="psalms">Psalms</phoneme> wird die jeweilige Antiphon dann noch einmal gesprochen, aber nicht wiederholt. <break time="1.0s"/>';
                pretext = pretext + 'Wenn Du magst, setze Dich zum Gebet der Psalmen und zur darauffolgenden Lesung hin und versuche, Dich auf das Beten und Hören der biblischen Texte einzulassen. <break time="1.5s"/>';
            }
            
            pretext = pretext + '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>';
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, antiphon1, pretext, '', false, 1);
        }
        
        
        // Psalm 1
        if (sessionAttributes.majorposition === 5 && sessionAttributes.psalmposition === 1) {
            text = psalm1[0].textContent;
            sessionAttributes.psalmposition++;
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false);
        } else if (sessionAttributes.majorposition === 5) {
            if (sessionAttributes.psalmposition % 2 === 0 && sessionAttributes.psalmposition <= psalm1.length) {
                sessionAttributes.lasttext = psalm1[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
            }
            if (sessionAttributes.psalmposition % 2 !== 0 && sessionAttributes.psalmposition <= psalm1.length) {
                text = psalm1[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
                if (sessionAttributes.psalmposition <= psalm1.length) {
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false, 1);
                } else {
                    sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '<break time="0.5s"/>', '<break time="2s"/>');
                }
            }
            
            if (sessionAttributes.psalmposition >= psalm1.length) {
                sessionAttributes.psalmposition = 1;
                sessionAttributes.majorposition++;
            }
        }
        
        
        // Antiphon 1 End
        if (sessionAttributes.majorposition === 6) {
            sessionAttributes.majorposition++;
            text = antiphon1;
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '', '<break time="1.5s"/>');
        }
        
        
        
        
        // !! PS 2
        // Antiphon 2 Beginning
        if (sessionAttributes.majorposition === 7 && sessionAttributes.psalmposition === 1) {
            sessionAttributes.psalmposition = 1;
            sessionAttributes.majorposition++;
            
            pretext = "";
            
            pretext = pretext + '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>';
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, antiphon2, pretext, '', false, 1);
        }
        
        
        // Psalm 2
        if (sessionAttributes.majorposition === 8 && sessionAttributes.psalmposition === 1) {
            text = psalm2[0].textContent;
            sessionAttributes.psalmposition++;
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false);
        } else if (sessionAttributes.majorposition === 8) {
            if (sessionAttributes.psalmposition % 2 === 0 && sessionAttributes.psalmposition <= psalm2.length) {
                sessionAttributes.lasttext = psalm2[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
            }
            if (sessionAttributes.psalmposition % 2 !== 0 && sessionAttributes.psalmposition <= psalm2.length) {
                text = psalm2[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
                if (sessionAttributes.psalmposition <= psalm2.length) {
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false, 1);
                } else {
                    sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '<break time="0.5s"/>', '<break time="2s"/>');
                }
            }
            
            if (sessionAttributes.psalmposition >= psalm2.length) {
                sessionAttributes.psalmposition = 1;
                sessionAttributes.majorposition++;
            }
        }
        
        
        // Antiphon 2 End
        if (sessionAttributes.majorposition === 9) {
            sessionAttributes.majorposition++;
            text = antiphon2;
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '', '<break time="1.5s"/>');
        }
        
        
        
        
        // !! PS 3
        // Antiphon 3 Beginning
        if (sessionAttributes.majorposition === 10 && sessionAttributes.psalmposition === 1) {
            sessionAttributes.psalmposition = 1;
            sessionAttributes.majorposition++;
            
            pretext = "";
            
            pretext = pretext + '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>';
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, antiphon3, pretext, '', false, 1);
        }
        
        
        // Psalm 3
        if (sessionAttributes.majorposition === 11 && sessionAttributes.psalmposition === 1) {
            text = psalm3[0].textContent;
            sessionAttributes.psalmposition++;
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false);
        } else if (sessionAttributes.majorposition === 11) {
            if (sessionAttributes.psalmposition % 2 === 0 && sessionAttributes.psalmposition <= psalm3.length) {
                sessionAttributes.lasttext = psalm3[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
            }
            if (sessionAttributes.psalmposition % 2 !== 0 && sessionAttributes.psalmposition <= psalm3.length) {
                text = psalm3[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
                if (sessionAttributes.psalmposition <= psalm3.length) {
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false, 1);
                } else {
                    sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '<break time="0.5s"/>', '<break time="2s"/>');
                }
            }
            
            if (sessionAttributes.psalmposition >= psalm3.length) {
                sessionAttributes.psalmposition = 1;
                sessionAttributes.majorposition++;
            }
        }
        
        
        // Antiphon 3 End
        if (sessionAttributes.majorposition === 12) {
            sessionAttributes.majorposition++;
            text = antiphon3;
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '', '<break time="1.5s"/>');
        }
        
        
        
        // !! Reading
        if (sessionAttributes.majorposition === 13) {
            sessionAttributes.majorposition++;
            text = reading;
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, 'Wir hören nun die <phoneme alphabet="ipa" ph="ˈleːzʊŋ">Lesung</phoneme>. <break time="2s"/>', '<break time="4.5s"/>');
        }
        
        
        
        // !! Responsorium
        if (sessionAttributes.majorposition === 14) {
            if (resp2 !== "") {
                // Responsorium outside the Easter season 
                if (sessionAttributes.psalmposition === 1) {
                    // Explain Laudes
                    pretext = '';
                    if (explainlaudes) {
                        pretext = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/>Nach der Lesung folgt jetzt das Responsorium als kurzer Antwortgesang. <break time="0.7s"/>';
                        pretext = pretext + 'Am Anfang steht dabei das Responsum, welches einmal gesprochen und ein weiteres Mal wiederholt wird. ';
                        pretext = pretext + 'Danach wird der Versiekel gesprochen, als Antwort darauf folgt nunmehr erneut das Responsum, allerdings nur dessen zweiter Teil. ';
                        pretext = pretext + 'Am Schluss, als Antwort auf das gesprochene "Ehre sei dem Vater", folgt nochmals das komplette Responsum. ';
                        pretext = pretext + 'Falls Du die Stundenbuch-App nutzen solltest, kannst Du Dich einfach an dem dort abgebildeten Ablauf orientieren. <break time="1.0s"/>';
                        pretext = pretext + 'Du kannst Dich ab hier wieder aufrecht hinstellen, um Dein Beten und Reflektieren dieser Texte, verbunden mit der Gemeinschaft der ganzen Kirche, zum Ausdruck zu bringen. <break time="1.5s"/>';
                    }
                    
                    pretext = pretext + '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>';
                    
                    sessionAttributes.psalmposition++;
                    
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, resp1, pretext, '', false, 1);
                } else if (sessionAttributes.psalmposition === 2) {
                    sessionAttributes.psalmposition++;
                    
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, resp2, '', '<break time="0.5s"/>', false, 1);
                } else if (sessionAttributes.psalmposition === 3) {
                    sessionAttributes.psalmposition++;
                    
                    sessionAttributes.lasttext = resp3;
                    text = "Ehre sei dem Vater und dem Sohn * und dem heiligen Geist";
                    
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false, 1);
                } else if (sessionAttributes.psalmposition === 4) {
                    sessionAttributes.psalmposition = 1;
                    sessionAttributes.majorposition++;
                    
                    sessionAttributes.lasttext = resp1;
                }
            } else {
                // Responsorium in the Easter season
                if (sessionAttributes.psalmposition === 1) {
                    // Explain Laudes
                    pretext = '';
                    if (explainlaudes) {
                        pretext = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/>Nach der Lesung folgt jetzt das Responsorium als kurzer Antwortgesang. <break time="0.7s"/>';
                        pretext = pretext + 'In der Osterzeit wird dabei das Responsum einmal gesprochen und ein weiteres Mal wiederholt. ';
                        pretext = pretext + 'Danach, als Antwort auf das gesprochene "Ehre sei dem Vater", folgt nochmals das komplette Responsum. <break time="1.0s"/>';
                        pretext = pretext + 'Du kannst Dich ab hier wieder aufrecht hinstellen, um Dein Beten und Reflektieren dieser Texte, verbunden mit der Gemeinschaft der ganzen Kirche, zum Ausdruck zu bringen. <break time="1.5s"/>';

                    }
                    
                    pretext = pretext + '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>';
                    
                    sessionAttributes.psalmposition++;
                    
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, resp1, pretext, '', false, 1);
                } else if (sessionAttributes.psalmposition === 2) {
                    sessionAttributes.psalmposition++;
                    
                    text = "Ehre sei dem Vater und dem Sohn * und dem heiligen Geist";
                    
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false, 1);
                } else if (sessionAttributes.psalmposition === 3) {
                    sessionAttributes.psalmposition = 1;
                    sessionAttributes.majorposition++;
                    
                    sessionAttributes.lasttext = resp1;
                }
            }
        }
        
        
        
        // !! Benedictus
        // Antiphon Benedictus Beginning
        if (sessionAttributes.majorposition === 15 && sessionAttributes.psalmposition === 1) {
            sessionAttributes.psalmposition = 1;
            sessionAttributes.majorposition++;
            
            pretext = "";
            
            // Explain Laudes
            if (explainlaudes) {
                pretext = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/>Das Benedictus, welches wir nun beten werden, bildet den Höhepunkt der <phoneme alphabet="ipa" ph="ˈlaʊ̯dˈɛs">Laudes</phoneme>. ';
                pretext = pretext + 'Der sogenannte "Lobgesang des Zacharias" ist dabei dem ersten Kapitel des Lukasevangeliums entnommen und preist die wunderbaren Heils-Taten Gottes. Es lädt uns dazu ein, auch selbst im Angesicht unserer Heilsgeschichte und Heilserfahrungen das Wirken Gottes und unseren Glauben betend zu reflektieren. <break time="0.7s"/>';
                pretext = pretext + 'Genau wie beim Psalmen-Gebet steht vor und nach dem Benedictus, welches im Wechsel gebetet wird, eine Antiphon. <break time="1.5s"/>';
            }
            
            pretext = pretext + '<audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>';
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, antiphonC, pretext, '', false, 1);
        }
        
        
        // Benedictus
        if (sessionAttributes.majorposition === 16 && sessionAttributes.psalmposition === 1) {
            text = benedictus[0].textContent;
            sessionAttributes.psalmposition++;
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false);
        } else if (sessionAttributes.majorposition === 16) {
            if (sessionAttributes.psalmposition % 2 === 0 && sessionAttributes.psalmposition <= benedictus.length) {
                sessionAttributes.lasttext = benedictus[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
            }
            if (sessionAttributes.psalmposition % 2 !== 0 && sessionAttributes.psalmposition <= benedictus.length) {
                text = benedictus[sessionAttributes.psalmposition - 1].textContent;
                sessionAttributes.psalmposition++;
                if (sessionAttributes.psalmposition <= benedictus.length) {
                    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                    return PerikopeSpeak(handlerInput, dialogslot, text, '', '<break time="0.5s"/>', false, 1);
                } else {
                    sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '<break time="0.5s"/>', '<break time="2s"/>');
                }
            }
            
            if (sessionAttributes.psalmposition >= benedictus.length) {
                sessionAttributes.psalmposition = 1;
                sessionAttributes.majorposition++;
            }
        }
        
        
        // Antiphon Benedictus End
        if (sessionAttributes.majorposition === 17) {
            sessionAttributes.majorposition++;
            sessionAttributes.psalmposition = 1;
            text = antiphonC;
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '', '<break time="2.5s"/>');
        }
        
        
        
        
        // !! Intercessions
        if (sessionAttributes.majorposition === 18 && sessionAttributes.psalmposition === 1) {
            sessionAttributes.psalmposition++;
            
            text = icprayer;
            pretext = 'Wir wollen Fürbitte halten. <break time="2s"/>';
            
            if (explainlaudes) {
                pretext = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/>Wir wollen Fürbitte halten. <break time="0.7s"/>';
                pretext = pretext + 'Nach dem einleitenden Gebet wird der Antwortruf auf die Fürbitten einmal gesprochen und dann wiederholt. ';
                pretext = pretext + 'Im Anschluss an jede Fürbitte wird diese dann ebenfalls mit dem Ruf beantwortet. <break time="2.4s"/>';
            }
            
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, pretext, '<break time="1.5s"/>');
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeSpeak(handlerInput, dialogslot, icresp, '', '', false, 1);
        } else if (sessionAttributes.majorposition === 18) {
            if ((sessionAttributes.psalmposition - 1) <= ic.length) {
                sessionAttributes.lasttext = icresp;
                text = ic[sessionAttributes.psalmposition - 2].textContent;
                
                sessionAttributes.psalmposition++;
                
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
                return PerikopeSpeak(handlerInput, dialogslot, text, '', '', false, 1);
            } else if ((sessionAttributes.psalmposition - 1) >= ic.length) {
                sessionAttributes.lasttext = icresp;
                sessionAttributes.psalmposition = 1;
                sessionAttributes.majorposition++;
            }
        }
        
        
        
        // !! Kyrie
        if (sessionAttributes.majorposition === 19) {
            sessionAttributes.majorposition++;
            
            text = 'Herr, erbarme Dich. <break time="1s"/> Christus, erbarme Dich. <break time="1s"/> Herr, erbarme Dich.';
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '<break time="2.0s"/>', '<break time="1.5s"/>');
        }
        
        
        
        // !! Lord's Prayer
        if (sessionAttributes.majorposition === 20) {
            sessionAttributes.majorposition++;
            
            const orationstart = ['', 'Lass uns beten, wie Jesus Christus uns zu beten gelehrt hat. <break time="1.5s"/>', 'Wir wollen mit den Worten Jesu beten. <break time="1.5s"/>'];
            const randomIndex = Math.floor(Math.random() * 3);
            text = orationstart[randomIndex];
            
            text = text + '<prosody rate="slow">Vater unser im Himmel, <break time="0.5s"/> geheiligt werde dein Name. <break time="0.5s"/> Dein Reich komme. <break time="0.5s"/> ';
            text = text + 'Dein Wille geschehe, <break time="0.5s"/> wie im Himmel so auf Erden. <break time="0.5s"/> Unser tägliches Brot gib uns heute. <break time="0.5s"/> ';
            text = text + 'Und vergib uns unsere Schuld, <break time="0.5s"/> wie auch wir vergeben unsern Schuldigern. <break time="0.5s"/> ';
            text = text + 'Und führe uns nicht in Versuchung, <break time="0.5s"/> sondern erlöse uns von dem Bösen.</prosody> ';
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, '<break time="0.5s"/><audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>', '<break time="2.0s"/>');
        }
        
        
        
        
        // !! Oration
        if (sessionAttributes.majorposition === 21) {
            sessionAttributes.majorposition++;
            
            text = oration + '<break time="1.0s"/> Amen.'
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, oration, '<break time="1.5s"/>', '<break time="1.0s"/>Amen. <break time="2.5s"/>');
        }
        
        
        
        
        // !! Blessing
        if (sessionAttributes.majorposition === 22) {
            sessionAttributes.majorposition++;
            
            pretext = '';
            if (explainlaudes) {
                pretext = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_01"/> ';
                pretext = pretext + 'Am Ende unseres Betens steht der Segen. <break time="1.0s"/>';
                pretext = pretext + 'Während dieser Segen gesprochen wird, kannst Du Dich bekreuzigen, und damit den Segen auch an Deinem Körper erfahrbar werden lassen. <break time="1.5s"/>';
            }
            pretext = pretext + '<break time="0.5s"/><audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="1.0s"/>';
            
            text = 'Der Herr segne uns, <break time="0.5s"/> er bewahre uns vor Unheil und führe uns zum ewigen Leben. <break time="1.0s"/> Amen.';
            sessionAttributes = PerikopeNoSpeak(sessionAttributes, text, pretext, '<break time="1.5s"/>');
        }
        
        
        
        
        
        // Stop: Finishing the Laudes Skill
        if (sessionAttributes.majorposition === 23) {
            sessionAttributes.majorposition = 1;
            sessionAttributes.psalmposition = 1;
            
            text = 'Vielen Dank für das gemeinsame Gebet. Dieser Alexa-Skill endet jetzt.';
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeFinishSpeak(handlerInput, dialogslot, text, '<break time="2s"/><audio src="soundbank://soundlibrary/bell/church/church_bells_03"/><break time="0.6s"/>', '', false, 1);
        }
    }  
};




// Alexa speaks the next pericope.
const PerikopeSpeak = function(handlerInput, dialogslot, text, pretext, aftertext, nobreak, increasebreak = 0) {
    // Load session attributes
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    // Break-Time
    if (nobreak === true) {
        nobreak = 0;
    } else {
        nobreak = CheckSpeakPause(sessionAttributes.lasttext, dialogslot, increasebreak);
    }
    sessionAttributes.lasttext = text;
    
    var prespeak = sessionAttributes.nospeakText + " ";
    sessionAttributes.nospeakText = "";
    
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
    return handlerInput.responseBuilder
            .speak('<speak>' + '<break time="' + nobreak + 's"/>' + prespeak + pretext + ' ' + text + ' ' + aftertext + '</speak>')
            .reprompt('Bitte antworte mit dem nächsten Vers.')
            .addElicitSlotDirective('DialogSlot')
            .getResponse();
}



// Check whether the user has finished.
// Sometimes, due to a long pause in the conversation, Alexa only recognises part of the user's prayer. In this case, Alexa has to pause before the next section.
const CheckSpeakPause = function(lasttext, dialogslot, increasebreak) {
    var l1 = lasttext.split(' ').length;
    if (dialogslot !== undefined) {
        var l2 = dialogslot.split(' ').length;
    }
    
    if (dialogslot === undefined) {
        return 0;
    } else if (l1 > (l2 + 2)) {
        var v3 = (l1 - l2) / 2;
        v3 = v3 + increasebreak;
        if (v3 > 10) {
            v3 = 10;
        }
        return v3;
    } else {
        return 0 + increasebreak;
    }
}



// Alexa adds text to the next speaking queue - but before the next speaking there is more text or another pericope to be added.
const PerikopeNoSpeak = function (sessionAttributes, text, pretext = "", aftertext = "") {
    if (pretext !== "") {
        text = pretext + ' ' + text;
    }
    if (aftertext !== "") {
        text = text + ' ' + aftertext;
    }
    
    if (sessionAttributes.nospeakText === "") {
        sessionAttributes.nospeakText = text;
    } else {
        sessionAttributes.nospeakText = sessionAttributes.nospeakText + ' ' + text;
    }
    
    return sessionAttributes;
}



// This is Alexa's last speaking part before the skill ends.
const PerikopeFinishSpeak = async function(handlerInput, dialogslot, text, pretext, aftertext, nobreak, increasebreak = 0) {
    // Load session attributes
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    // Break-Time
    if (nobreak === true) {
        nobreak = 0;
    } else {
        nobreak = CheckSpeakPause(sessionAttributes.lasttext, dialogslot, increasebreak);
    }
    sessionAttributes.lasttext = '';
    
    var prespeak = sessionAttributes.nospeakText + " ";
    sessionAttributes.nospeakText = "";
    
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
    // Save persistent attributes
    await saveAttributes(handlerInput);
    
    return handlerInput.responseBuilder
        .speak('<speak>' + '<break time="' + nobreak + 's"/>' + prespeak + pretext + ' ' + text + ' ' + aftertext + '</speak>')
        .withShouldEndSession(true)
        .getResponse();
}



// Issuing a web load (http) error message
const ErrorLoad = function(handlerInput) {
    return handlerInput.responseBuilder
        .speak(`Leider ist ein Fehler im Laden oder Bereistellen des Stundengebets aufgetreten. Bitte prüfe Deine Internetverbindung und versuche es erneut. Zur Fehlerbehebung ist ein Entwickler-Feedback über die Alexa-App hilfreich!`)
        .withShouldEndSession(true)
        .getResponse()
}



// Saving the session attributes into the persistent attributes
async function saveAttributes(handlerInput) {
    // Load session attributes and persistent attributes
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const attributesManager = handlerInput.attributesManager;
    const persistenceAttributes = await attributesManager.getPersistentAttributes() || {};
    
    // Load date
    let date = new Date().toLocaleDateString('de-DE', dateoptions);
    
    if (sessionAttributes.psalmposition) {
        persistenceAttributes.psalmposition = sessionAttributes.psalmposition;
    }
    if (sessionAttributes.majorposition) {
        persistenceAttributes.majorposition = sessionAttributes.majorposition;
    }
    if (sessionAttributes.lasttext) {
        persistenceAttributes.lasttext = sessionAttributes.lasttext;
    }
    if (sessionAttributes.nospeakText) {
        persistenceAttributes.nospeakText = sessionAttributes.nospeakText;
    }
    persistenceAttributes.date = date;
    
    // Save
    attributesManager.setPersistentAttributes(persistenceAttributes);
    await attributesManager.savePersistentAttributes();
    
    return;
}






// Parsing the http-content into variables
function doWebParsing(parser) {
    halleluja = parser.window.document.querySelectorAll("halleluja");
    hymnus = parser.window.document.querySelectorAll("hymnus_item");
    hymnusfull = parser.window.document.querySelector("hymnus_full").textContent;
    antiphon1 = parser.window.document.querySelector("ant1").textContent;
    psalm1 = parser.window.document.querySelectorAll("ps1");
    psalm1title = parser.window.document.querySelector("ps1-title").textContent;
    antiphon2 = parser.window.document.querySelector("ant2").textContent;
    psalm2 = parser.window.document.querySelectorAll("ps2");
    psalm2title = parser.window.document.querySelector("ps2-title").textContent;
    antiphon3 = parser.window.document.querySelector("ant3").textContent;
    psalm3 = parser.window.document.querySelectorAll("ps3");
    psalm3title = parser.window.document.querySelector("ps3-title").textContent;
    reading = parser.window.document.querySelector("reading").textContent;
    readingtitle = parser.window.document.querySelector("reading-title").textContent;
    resp1 = parser.window.document.querySelector("resp1").textContent;
    resp2 = parser.window.document.querySelector("resp2").textContent;
    resp3 = parser.window.document.querySelector("resp3").textContent;
    antiphonC = parser.window.document.querySelector("antC").textContent;
    benedictus = parser.window.document.querySelectorAll("c");
    benedictustitle = parser.window.document.querySelector("c-title").textContent;
    icprayer = parser.window.document.querySelector("ic-prayer").textContent;
    icresp = parser.window.document.querySelector("ic-response").textContent;
    ic = parser.window.document.querySelectorAll("ic");
    oration = parser.window.document.querySelector("oration").textContent;
}







// Handling the YES/NO-Intent
function setQuestion(handlerInput, questionAsked) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.questionAsked = questionAsked;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}

const YesIntentHandler = {
    canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        // Load session attributes
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        if (sessionAttributes.questionAsked === "LaudesResume" || sessionAttributes.questionAsked === "LaudesResume_Explain") {
            // Explain Laudes
            let explainlaudes = "LaudesIntent";
            if (sessionAttributes.questionAsked === "LaudesResume_Explain") {
                explainlaudes = "LaudesExplainIntent";
            }
            
            // Resume after stopping the prayer
            setQuestion(handlerInput, '');
            
            return handlerInput.responseBuilder
            .addElicitSlotDirective('DialogSlot', {
                name: explainlaudes,
                confirmationStatus: 'NONE',
                slots: {
                    DialogSlot: {
                            name: 'DialogSlot',
                            confirmationStatus: 'CONFIRMED',  //CONFIRMED
                            value: ''
                        }
                }
            })
            .speak('<speak>' + '<break time="0.5s"/>' + sessionAttributes.lasttext + '</speak>')
            .reprompt('Bitte antworte mit dem nächsten Vers oder Abschnitt.')
            .getResponse();
        } else if (sessionAttributes.questionAsked === "Beginn" || sessionAttributes.questionAsked === "Beginn_Explain") {
            // Explain Laudes
            let explainlaudes = "LaudesIntent";
            if (sessionAttributes.questionAsked === "Beginn_Explain") {
                explainlaudes = "LaudesExplainIntent";
            }
            
            // Beginning the prayer
            setQuestion(handlerInput, '');
            
            sessionAttributes.majorposition = 2;
            //sessionAttributes.majorposition = 19; // Only for testing purposes!!
            sessionAttributes.lasttext = "Herr, eile mir zu helfen."
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return handlerInput.responseBuilder
            .addElicitSlotDirective('DialogSlot', {
                name: explainlaudes,
                confirmationStatus: 'NONE',
                slots: {
                    DialogSlot: {
                            name: 'DialogSlot',
                            confirmationStatus: 'CONFIRMED',  //CONFIRMED
                            value: ''
                        }
                }
            })
            .speak('<speak>' + 'Einverstanden, dann fangen wir an! <break time="0.5s"/><audio src="soundbank://soundlibrary/computers/beeps_tones/beeps_tones_08"/><break time="0.5s"/>' + 'Oh Gott, komm mir zur Hilfe' + '</speak>')
            .reprompt('Bitte antworte mit dem nächsten Abschnitt.')
            .getResponse();
        }
        
        // If no purpose
        return handlerInput.responseBuilder
            .speak('Das habe ich leider nicht verstanden.')
            .reprompt('Leider konnte ich Dich nicht verstehen.')
            .getResponse();
    },
}

const NoIntentHandler = {
    canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        // Load session attributes
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        if (sessionAttributes.questionAsked === "LaudesResume" || sessionAttributes.questionAsked === "LaudesResume_Explain") {
            // Explain Laudes
            let explainlaudes = "LaudesIntent";
            if (sessionAttributes.questionAsked === "LaudesResume_Explain") {
                explainlaudes = "LaudesExplainIntent";
            }
            
            // Resume after stopping the prayer
            setQuestion(handlerInput, '');
        
            sessionAttributes.majorposition = 1;
            sessionAttributes.psalmposition = 1;
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return handlerInput.responseBuilder
            .addElicitSlotDirective('DialogSlot', {
                name: explainlaudes,
                confirmationStatus: 'NONE',
                slots: {
                    DialogSlot: {
                            name: 'DialogSlot',
                            confirmationStatus: 'CONFIRMED',  //CONFIRMED
                            value: ''
                        }
                }
            })
            .speak('<speak>' + '<break time="0.2s"/>' + 'Einverstanden. Dann beginnen wir mit dem Beten von Anfang an! Sage "Beginnen", um damit zu starten.' + '</speak>')
            .reprompt('Bitte antworte mit "Beginnen"')
            .getResponse();
        } else if (sessionAttributes.questionAsked === "Beginn" || sessionAttributes.questionAsked === "Beginn_Explain") {
            // Beginning the prayer
            setQuestion(handlerInput, '');
        
            sessionAttributes.majorposition = 1;
            sessionAttributes.psalmposition = 1;
            var text = 'Einverstanden. Rufe den Skill einfach nochmal auf, sobald Du zum Beten bereit bist!';
            
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); // Set session attributes
            return PerikopeFinishSpeak(handlerInput, "", text, '', '<break time="1s"/><audio src="soundbank://soundlibrary/bell/church/church_bells_03"/><break time="0.6s"/>', false, 0);
        }
        
        // If no purpose
        return handlerInput.responseBuilder
            .speak('Das habe ich leider nicht verstanden.')
            .reprompt('Leider konnte ich Dich nicht verstehen.')
            .getResponse();
    },
}

















const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Dieser Skill lädt zum liturgischen <phoneme alphabet="ipa" ph="ˈmɔʁɡn̩ɡəˌbeːt">Morgengebet</phoneme> der <phoneme alphabet="ipa" ph="ˈlaʊ̯dˈɛs">Laudes</phoneme> ein. Sagen <phoneme alphabet="ipa" ph="ˈmɔʁɡn̩ɡəˌbeːt">Morgengebet</phoneme>, um mit mir zusammen zu beginnen.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    async handle(handlerInput) {
        let speakOutput = 'Vielen Dank für das gemeinsame Gebet. Der Skill wird nun beendet. Du kannst jederzeit an der gleichen Stelle wieder fortfahren!';
        
        // Check, if the user used to pray
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        if (!sessionAttributes.majorposition && !sessionAttributes.psalmposition) {
            speakOutput = 'Einverstanden! Der Skill wird nun beendet. Du kannst jederzeit den Skill erneut aufrufen!';
        }
        
        // Save persistent attributes
        await saveAttributes(handlerInput);
        
        

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};



/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in the skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Leider kann die angeforderte Aktion nicht ausgeführt werden. Bitte versuche es erneut!';
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in the voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    async handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);

        // Save persistent attributes
        await saveAttributes(handlerInput);
        
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. It is possible to create custom handlers for any intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
 
 
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


/**
 * Generic error handling to capture any syntax or routing errors.
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Leider ist ein Fehler im Laden oder Bereitstellen des Stundengebets aufgetreten. Bitte prüfe Deine Internetverbindung und versuche es erneut. Zur Fehlerbehebung ist ein Entwickler-Feedback über die Alexa-App hilfreich!';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/**
 * This handler acts as the entry point for the skill, routing all request and response
 * payloads to the handlers above. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        LaudesIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
            createTable: false,
            dynamoDBClient: new AWS.DynamoDB({apiVersion: 'latest', region: process.env.DYNAMODB_PERSISTENCE_REGION})
        })
    )
    .lambda();