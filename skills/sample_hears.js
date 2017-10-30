/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');

module.exports = function(controller) {

    /* Collect some very simple runtime stats for use in the uptime/debug command */
    var stats = {
        triggers: 0,
        convos: 0,
    }

    controller.on('heard_trigger', function() {
        stats.triggers++;
    });

    controller.on('conversationStarted', function() {
        stats.convos++;
    });


    controller.hears(['^uptime','^debug'], 'direct_message,direct_mention', function(bot, message) {

        bot.createConversation(message, function(err, convo) {
            if (!err) {
                convo.setVar('uptime', formatUptime(process.uptime()));
                convo.setVar('convos', stats.convos);
                convo.setVar('triggers', stats.triggers);

                convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.');
                convo.activate();
            }
        });

    });

    controller.hears(['^say (.*)','^say'], 'direct_message,direct_mention', function(bot, message) {
        if (message.match[1]) {
          
            if (!wordfilter.blacklisted(message.match[1])) {
                bot.reply(message, message.match[1]);
            } else {
                bot.reply(message, '_sigh_');
            }
        } else {
            bot.reply(message, 'I will repeat whatever you say.')
        }
    });
    controller.hears(['^kek'], 'direct_message,direct_mention', function(bot, message) {
 
        // carefully examine and
        // handle the message here!
        // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!
        let request  = require('request');
        let options = {
          url: "https://slack.com/api/users.profile.get?",
            headers: {
              'User-Agent': 'request'
            },
            qs:{
              token:'xoxp-263583750562-264467272966-263730907538-a33c333aa29112685e44dbdebdaafa33',
              user: message.user
          }}
        request(options, function(error, response,body){
          
          bot.reply(message, JSON.parse(body).profile.email);
          let options = {
            url: "https://haveibeenpwned.com/api/v2/breachedaccount/" +JSON.parse(body).profile.email,
            headers: {
              'User-Agent': 'request',
              'truncateResponse':"true"
            }
          };
          request(options, function(error, response, body){
            if(body == ""){
              bot.reply (message, "Congratulations! Your email doesn't appear in any of the breached data leaks. Interested in learning more?")
            }
            else{
            bot.reply(message, "Oh no! Looks like your data has been leaked on the following sites...")
            bot.reply(message, body)
            }
            }
          ) 	
          

        // carefully examine and
        // handle the message here!
        // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!
    })
    });



    };


    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /*         
        }~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Utility function to format uptime */
    function formatUptime(uptime) {
        var unit = 'second';
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'minute';
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'hour';
        }
        if (uptime != 1) {
            unit = unit + 's';
        }

        uptime = parseInt(uptime) + ' ' + unit;
        return uptime;
    }

;
