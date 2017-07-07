'use strict';
var Botkit = require('botkit');
var google = require('google');
var axios = require('axios');
var secret = require('./secret.json')

var controller = Botkit.slackbot({debug: false});

// connect the bot to a stream of messages
controller.spawn(secret).startRTM();

controller.hears('Yo', [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    bot.reply(message, 'The bot is online and ready to service you');
});

controller.hears('Tell me about mario', [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {
    bot.reply(message, 'His mom is fat');
});

controller.hears(['Tell me about the team'], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {

    // start a conversation to handle this response.
    bot.startConversation(message, function(err, convo) {

        convo.addQuestion('Who do you want to know?', [
            {
                pattern: 'Hansen',
                callback: function(response, convo) {
                    convo.say('He is the Dude');
                    convo.next();
                }
            }, {
                pattern: 'Mario',
                callback: function(response, convo) {
                    convo.say('He is the xxxMrMoexxx');
                    // do something else...
                    convo.next();
                }
            }, {
                pattern: 'Phillip',
                callback: function(response, convo) {
                    convo.say('He is the dahse89');
                    // do something else...
                    convo.next();
                }
            }, {
                default: true,
                callback: function(response, convo) {
                    convo.say('I dont fookin know who is that');
                    convo.repeat();
                    convo.next();
                }
            }
        ], {}, 'default');
    });
});

function numberCalculation(originalNumber, secondNumber, operationType) {
    switch(operationType) {
        case "add":
            return parseInt(originalNumber) + parseInt(secondNumber);
            break;
        case "reduce":
            return parseInt(originalNumber) - parseInt(secondNumber);
            break;
        case "multiply":
            return parseInt(originalNumber) * parseInt(secondNumber);
            break;
        case "divide":
            return parseInt(originalNumber) / parseInt(secondNumber);
            break;
        default:
            return parseInt(originalNumber)
    }
}

controller.hears(['Calculate'], [
    'direct_message', 'direct_mention', 'mention'
], function(bot, message) {

    // start a conversation to handle this response.
    bot.startConversation(message, function(err, convo) {

        var botCalculator = {
            number: 0,
            mathFunction: 'add',
            facts: 'nothing yet'
        }

        convo.setVar('number', botCalculator.number);
        convo.setVar('mathFunction', botCalculator.mathFunction);
        convo.setVar('numberFacts', botCalculator.facts);

        convo.addQuestion('What number to {{vars.mathFunction}} ?', [
            {
                default: true,
                callback: function(response, convo) {
                    var calculatedNumber = numberCalculation(botCalculator.number, response.text, botCalculator.mathFunction);
                    botCalculator.number = calculatedNumber;
                    convo.setVar('number', calculatedNumber);
                    convo.gotoThread('default');
                }
            }
        ], {}, 'number_thread');

        convo.addMessage({
            text: 'Here is the fact about your number:',
            attachments: [{
                text: '{{vars.facts}}',
                color: '#7CD197'
            }]
        },'fact_thread');

        convo.addMessage({
            text: 'The final number is {{vars.number}}, Good bye biatch',
        },'end_thread');

        convo.addQuestion('Your number is {{vars.number}} what do you want me to do with it?', [
            {
                pattern: 'Add',
                callback: function(response, convo) {
                    botCalculator.mathFunction = 'add';
                    convo.setVar('mathFunction', botCalculator.mathFunction);
                    convo.gotoThread('number_thread');
                    convo.next();
                }
            },
            {
                pattern: 'Reduce',
                callback: function(response, convo) {
                    botCalculator.mathFunction = 'reduce';
                    convo.setVar('mathFunction', botCalculator.mathFunction);
                    convo.gotoThread('number_thread');
                    convo.next();
                }
            },
            {
                pattern: 'Multiply',
                callback: function(response, convo) {
                    botCalculator.mathFunction = 'multiply';
                    convo.setVar('mathFunction', botCalculator.mathFunction);
                    convo.gotoThread('number_thread');
                    convo.next();
                }
            },
            {
                pattern: 'Divide',
                callback: function(response, convo) {
                    botCalculator.mathFunction = 'divide';
                    convo.setVar('mathFunction', botCalculator.mathFunction);
                    convo.gotoThread('number_thread');
                    convo.next();
                }
            },
            {
                pattern: 'nothing',
                callback: function(response, convo) {
                    convo.gotoThread('end_thread');
                }
            },
            {
                pattern: 'facts',
                callback: function(response, convo) {
                    axios
                        .get('http://numbersapi.com/' + botCalculator.number)
                        .then(function(response) {
                            convo.setVar('facts', response.data);
                            convo.gotoThread('fact_thread');
                            convo.repeat();
                        }).catch(function(err) {
                            convo.setVar('facts', 'No facts for your number');
                            convo.gotoThread('fact_thread');
                            convo.repeat();
                        });
                }
            },
            {
                default: true,
                callback: function(response, convo) {
                    convo.say('I dont fookin know what is that');
                    convo.repeat();
                    convo.next();
                }
            }
        ], {}, 'default');

        convo.activate();
    });
});
