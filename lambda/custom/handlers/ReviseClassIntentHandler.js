const { states } = require("../Constants");
const https = require("https");
const Constants = require("../Constants");
const config = require("../config");
const { getEmail } = require("../Utils/UtilMethods");
const { getUserInfo } = require("../Utils/HttpUtils");
const {
  isNotificationAvailable,
  NotificationAlert
} = require("../Utils/NotificationUtilMethods");

const ReviseClassIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "ReviseClassIntent"
    );
  },
async handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const email = await getEmail(handlerInput);
    const dataResponse = await getUserInfo(email);
    let speakText = "";
    let cardText = "";

    
    if(!dataResponse.status)
         return handlerInput.responseBuilder
           .speak(Constants.email_not_registered)
           .getResponse();
         
    if(dataResponse.student_data.length < 1)
          return handlerInput.responseBuilder
            .speak(Constants.no_student_registered)
            .getResponse(); 
    if (dataResponse.student_data[0].concept_practiced.length < 1)
      return handlerInput.responseBuilder
        .speak(Constants.no_concept_found)
        .getResponse();
    else 
    {
         
         sessionAttributes.student_id = dataResponse.student_data[0].student_id;
         var conceptPracticed = dataResponse.student_data[0].concept_practiced;
         speakText = getConcepts(conceptPracticed);
         
        // let replaceEntityDirective = {
        //   type: "Dialog.UpdateDynamicEntities",
        //   updateBehavior: "REPLACE",
        //   types: [
        //     {
        //       name: "LessonOption",
        //       values: [
        //         {
        //           id: "5411",
        //           name: {
        //             value: "Simple number operations",
        //             synonyms: ["first one", "option one"]
        //           }
        //         },
        //         {
        //           id: "5433",
        //           name: {
        //             value: "Even and Odd Numbers",
        //             synonyms: ["second one", "option two"]
        //           }
        //         },
        //         {
        //           id: "5451",
        //           name: {
        //             value: "Rounding numbers to nearest 100 and 1000",
        //             synonyms: ["third one", "option two"]
        //           }
        //         }
        //       ]
        //     }
        //   ]
        // };
        let checkEntityDirective = {
          type: "Dialog.UpdateDynamicEntities",
          updateBehavior: "REPLACE",
          types: [
            {
              name: "LessonOption",
              values: [
                
              ]
            }
          ]
        };
        for (i = 0; i < conceptPracticed.length; i++) {
          cardText += i + 1 + " : " + conceptPracticed[i].name + "\r\n";
          var rrr = {
            id: conceptPracticed[i].id,
            name: {
              value: conceptPracticed[i].name,
              synonyms: getConceptSynonym(i)
            }
          };
          checkEntityDirective.types[0].values.push(rrr);   
        }
         
            
        console.log(checkEntityDirective.types[0].values);

        return handlerInput.responseBuilder
          .speak(speakText)
          .reprompt("You can say any of the topic name")
          .addDirective(checkEntityDirective)
          .withShouldEndSession(false)
          .withSimpleCard("Recent Topics",
          cardText
          )
          .getResponse();
    }
   
  }
};

function getConceptSynonym(i)
{
  var array = [];
   switch (i) {
     case 0:
        array.push("first one");
      //  array.push("option one");
       break;
     case 1:
        array.push("second one");
      //  array.push("option two");
     case 2:
        array.push("third one");
       // array.push("option three");
       break;
   }
   return array;
  
}


function getConcepts(conceptPracticed)
{
    let speech =
      '<prosody rate="30%" pitch="+40%" volume="x-loud">Sure! </prosody>These are the recent topics <break time="0.3s" />';
    for (i = 0; i < conceptPracticed.length; i++) {
      speech +=  conceptPracticed[i].name + ', <break time="0.3s" />';
     
    }
    speech += '. Which one you need to revise?';
    return speech;
}



module.exports = ReviseClassIntentHandler;
