// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

let regions = [
  'Piemonte',
  'Lombardia',
  'Veneto',
  'Liguria',
  'Calabria',
  'Sicilia',
  'Puglia',
  'Sardegna',
  'Toscana',
  'Valle d\' Aosta',
  'Trentino Alto Adige',
  'Friuli Venezia Giulia',
  'Umbria',
  'Marche',
  'Abruzzo',
  'Molise',
  'Emilia Romagna',
  'Basilicata'
  ]

let capitals = [
  'torino',
  'milano',
  'venezia',
  'genova',
  'reggio calabria',
  'palermo',
  'bari',
  'cagliari',
  'firenze',
  'aosta',
  'trento',
  'trieste',
  'perugia',
  'ancona',
  'l\'aquila',
  'campobasso',
  'bologna',
  'potenza'

]

const create_object_region_capital = (region, capitals) => {
    const result = {}
    for(let i = 0; i< regions.length; i++){
        result[regions[i]] = capitals[i]
    }
    
    return result
}

const getRandomWithManyExclusions = (originalArray,arrayOfIndexesToExclude) => {

   var rand = null;

   while(rand === null || arrayOfIndexesToExclude.includes(rand)){
         rand = Math.round(Math.random() * (originalArray.length - 1));
    }
     return rand;
}

function getRandomWithOneExclusion(lengthOfArray,indexToExclude){

  var rand = null;  //an integer

    while(rand === null || rand === indexToExclude){
       rand = Math.round(Math.random() * (lengthOfArray - 1));
    }

  return rand;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const user_id = handlerInput.requestEnvelope.context.System.user.userId
            // controlla se l'utente esiste, se non esiste vai all'intent per chiedere nome e cognome e salvarlo in db
            let speakOutput = 'Ciao vuoi giocare?';
            if(true){
                speakOutput = 'Benvenuto, come ti chiami?'
            }
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.score = 0;
            sessionAttributes.step = 1;
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        
        
    }
};

const ResponseNameIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResponseNameIntent';
    },
    handle(handlerInput) {
        console.log('ENTRATO')
        const user_id = handlerInput.requestEnvelope.context.System.user.userId
        const firstname = handlerInput.requestEnvelope.request.intent.slots.firstname.value
        console.log('USER-ID', user_id)
        console.log('FIRSTNAME', firstname)
        // aggiungi utente
           
            const speakOutput = `Ciao ${firstname} vuoi giocare?`;
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.score = 0;
            sessionAttributes.step = 1;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


const QuestionCapitalIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuestionCapitalIntent';
    },
    handle(handlerInput) {
        const session = handlerInput.attributesManager.getSessionAttributes();
        session.region_already_answered = session.region_already_answered ? session.region_already_answered : []
        const region_question = regions[getRandomWithManyExclusions(regions, session.region_already_answered)]

        const region_question_index = regions.indexOf(region_question)
        session.region_already_answered.push(region_question_index)
        console.log(session.region_already_answered)
        const capital_correct = capitals[region_question_index]
        
        const shuffle_capitals = [...capitals].sort((a, b) => {
            return 0.5 - Math.random()
        })
        
        const responses_capitals = (possible_response) => {
            const responses = possible_response.sort((a, b) => {
                return 0.5 - Math.random()
            })
            return `${responses[0]},${responses[1]} e ${responses[2]}`
        }
        
        let speakOutput = `Qual è il capoluogo di ${region_question} tra ${responses_capitals([shuffle_capitals[0], shuffle_capitals[1], capital_correct])}?`;
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        session.capital_correct = capital_correct
        
        console.log(handlerInput.responseBuilder.getResponse())
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const ResponseCapitalIntent = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ResponseCapitalIntent';
    },
    handle(handlerInput) {
        const session = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = 'OK'
        
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        
        const capital = slots.capital.value.toLowerCase()
        
        if(capital === session.capital_correct){
            session.step ++
            session.score ++
            
            speakOutput = `Corretto!Il tuo score è di ${session.score}, vuoi andare alla domanda numero ${session.step}?`
            
            if(session.step === 6){
                speakOutput = `Corretto!Hai finito la partita con uno score di  ${session.score}, vuoi ricominciare la partita?`
                session.step = 1
                session.score = 0
            }
            
        }
        
        if (capital !== session.capital_correct){
            session.step ++
            
            speakOutput = `Sbagliato!Il tuo score è di ${session.score}, vuoi andare alla domanda numero ${session.step}?`
            
            if(session.step === 6){
                speakOutput = `Sbagliato!Hai finito la partita con uno score di  ${session.score}, vuoi ricominciare la partita?`
                session.step = 1
                session.score = 0
            }
            
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

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
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        ResponseNameIntent,
        QuestionCapitalIntent,
        ResponseCapitalIntent,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
