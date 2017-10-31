module.exports = function(controller) {
 
  controller.hears([ '^kek (.*)','^kek'], 'direct_message,direct_mention', function(bot, message) {
 
        // carefully examine and
        // handle the message here!
        // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!
        let request  = require('request');
        let email = "";
        if(message.match[1]){
        email = message.match[1];
        email =  email.slice(email.indexOf(":")+1, email.indexOf("|"));
        getPwned(email, bot, message);
        }
        else{
        let options = {
          url: "https://slack.com/api/users.profile.get?",
            headers: {
              'User-Agent': 'request'
            },
            qs:{
              token:'xoxb-263869688373-2ct2v1S4sEnkIFPLKYRl7DNF',
              user: message.user
          }}
        request(options, function(error, response,body){
          bot.reply(body);
          email = JSON.parse(body).profile.email;
          bot.reply(message,email);
          getPwned(email, bot, message);
        })

 
        }
      
          

        // carefully examine and
        // handle the message here!
        // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!
    });
      controller.on('team_join', function(bot, message) {
        let request  = require('request');
        let email = "";
        bot.startPrivateConversation(message, function(bot, message){
        bot.reply(message, 'Welcome, <@' + message.user + '>! My name is PwnBot, and it\'s my job to tell you whether your email has been leaked in any recent data breaches. Give me one second...');
        let options = {
          url: "https://slack.com/api/users.profile.get?",
            headers: {
              'User-Agent': 'request'
            },
            qs:{
              token:'xoxp-263583750562-264467272966-265282441799-fca1528644fad464d17f5b27a3c41df0',
              user: message.user
          }}
        request(options, function(error, response,body){
          email = JSON.parse(body).profile.email;
          getPwned(email, bot, message);
        })
        })
      })  



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
  function getPwned(email, bot, message){
    let request  = require('request');
    if(email !=""){
      bot.reply(message, email);
      let urls = "https://haveibeenpwned.com/api/v2/breachedaccount/" + email;
        let options = {
            url: urls,
            headers: {
              'User-Agent': 'request'
            },
          qs:{
          'truncateResponse':"true"
        }
        };
          request(options, function(error, response, body){
            if(body == ""){
              bot.reply (message, "Congratulations! Your email doesn't appear in any of the breached data leaks. Interested in learning more?")
            }
            else{
            bot.reply(message, body)
            bot.reply(message, "Oh no! Looks like your data has been leaked on the following sites...")
          
            }
            }
          ) 	
      }
      else{
        bot.reply(message, "Oh no! Apparently there's been an error with the program :(");
      }
  }