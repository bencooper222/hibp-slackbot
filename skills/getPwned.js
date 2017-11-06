module.exports = function(controller) {


      controller.on('team_join', function(bot, message) {
        let request  = require('request');
        let email = "";
        bot.startPrivateConversation({user:message.user.id}, function(err, convo){
        convo.say('Welcome, <@' + message.user.id+'>! My name is PwnBot, and it\'s my job to tell you whether your email has been leaked in any recent data breaches. Give me one second...');
        let options = {
          url: "https://slack.com/api/users.info?",
            headers: {
              'User-Agent': 'request'
            },
            qs:{
              token:'xoxp-263583750562-264467272966-265282441799-fca1528644fad464d17f5b27a3c41df0',
              user: message.user.id
          }}
        request(options, function(error, response,body){
          email = JSON.parse(body).user.profile.email;
          getPwned(email, function(response){
            convo.say(response);
          })
        })
        })
      });
      controller.hears([ '^pwn (.*)','^pwn'], 'direct_message,direct_mention', function(bot, message) {
 
        // carefully examine and
        // handle the message here!
      // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!\
        let request  = require('request');
        let email = "";
        if(message.match[1]){
        email = message.match[1];
        email =  email.slice(email.indexOf(":")+1, email.indexOf("|"));
        getPwned(email, function(response){
            bot.reply(message, response);
          });
        }
        else{
        let userID = message.user;
        let options = {
          url: "https://slack.com/api/users.info?",
          qs:{
              token:'xoxp-263583750562-264467272966-265282441799-fca1528644fad464d17f5b27a3c41df0',
              user: userID
          }}
        request(options, function(error, response,body){
          email = JSON.parse(body).user.profile.email;
          getPwned(email, function(response){
            bot.reply(message, response);
          });
        })
        }});
 
        controller.hears(['allPwned'], 'direct_message,direct_mention', function(bot, message) {
          bot.reply(message,"Scan has begun");
          let request  = require('request');
          let options = {
            url: "https://slack.com/api/users.list?",
            qs:{
                token:'xoxp-263583750562-264467272966-265282441799-fca1528644fad464d17f5b27a3c41df0',
            }}
          request(options, function(error, response, body){
            let members = JSON.parse(body).members;
            let numMembers = members.length;
            let i = 0;
            let email = "";
            let userID = "";
            let cleanUsers = [];
            let dirtyUsers = [];
            let dirtyUserData = {};
            for(i = 0; i < numMembers; i ++){
              if(members[i].is_bot==false && members[i].real_name != "slackbot"){
              userID = members[i]["id"];
              email = members[i]["profile"]["email"];
              var slackify = require('slackify-html');
              let urls = "https://haveibeenpwned.com/api/v2/breachedaccount/" + email;
              let options = {
              url: urls,
              headers: {
                'User-Agent': 'pwnBot'
              },
              qs:{
              }
          };
            request(options, function(error, response, body){
              console.log("Test" + JSON.parse(body));
              if(body = ""){
                cleanUsers.push(userID);
              }
              else{
                dirtyUsers.push(userID);
                let j=0;
                let arr = JSON.parse(body);
                let returnString = "Oh no! Looks like your data has been leaked on the following sites...\n";
                for(j=0;j<arr.length; j++){
                var slackify = require('slackify-html');
                let title = arr[j].Name;
                let domain = slackify(arr[j].Domain);
                let date= arr[j].BreachDate;
                let description = slackify(arr[j].Description);

                returnString += "Title: " +  title + "\nDomain: " + domain + "\nDate: " + date + "\nDescription: " + description+"\n\n";

              }
                dirtyUserData[userID] = returnString;
              }
            })

          }}
              bot.reply(message, "Scan has finished!");
              bot.startPrivateConversation({user:message.user}, function(err,convo) {
              convo.say('Here are the results of my scan: \n');
                convo.next();
              if(cleanUsers.length != 0){
              convo.say("Non-pwned users: \n")
              for(i = 0; i < cleanUsers.length; i ++){
                convo.say("<@" + cleanUsers[i] + ">, ")
                convo.next();
              }
              }
              else{
                convo.say("There are no non-pwned users");
                  convo.next();
              }
              if(dirtyUsers.length != 0){
                convo.say("Pwned users: \n")
                for(i = 0; i < dirtyUsers.length; i ++){
                  convo.say("<@" + dirtyUsers[i] + ">, ");
                    convo.next();

              }
              }
              else{
                convo.say("There are no pwned users. Congrats!")
                  convo.next();
              }
              convo.addQuestion("Would you like me to inform the users of their status? (yes/no)",[
                {
                  pattern: bot.utterances.yes,
                  callback: function(response,convo) {
                    convo.say('Great! I will inform each of the users in a DM');
                    // do something else...
                    convo.next();
                  for(i = 0; i < dirtyUsers.length; i ++){
                      bot.startPrivateConversation({user:dirtyUsers[i]}, function(err, convo1){
                      convo1.say("Hi, <@" + message.user + "> has requested a pwned scan of all the users in this Slack. Unfortunately, your email has been found in the following data leaks...\n" + dirtyUserData[dirtyUsers[i]] + "\n If you're interested in learning more, please visit haveibeenpwned.com")

                  })

                  }


                  for(i = 0; i < cleanUsers.length; i ++){
                      bot.startPrivateConversation({user:cleanUsers[i]}, function(err, convo1){
                      convo1.say("Hi, <@" + message.user + "> has requested a pwned scan of all the users in this Slack. Fortunately, your email was not found in any data breaches! Congratulations. If you're interested in learning more, please visit haveibeenpwned.com")

                  })

                  }
                  }}
                                                   ,
                {
                  pattern: bot.utterances.no,
                  callback: function(response,convo) {
                    convo.say('Ok, sounds good!');
                    // do something else...
                    convo.next();
                  }
                },
                {
                  default: true,
                  callback: function(response,convo) {
                    // just repeat the question
                    convo.repeat();
                    convo.next();
                  }
                }
              ],{},'default');

            })}
          )

 
        
      
          

        // carefully examine and
        // handle the message here!
        // Note: Platforms such as Slack send many kinds of messages, not all of which contain a text field!


    })};


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
  function getPwned(email, callback){
    let request  = require('request');
    if(email !="" && email != 'undefined'){
      let urls = "https://haveibeenpwned.com/api/v2/breachedaccount/" + email;
        let options = {
            url: urls,
            headers: {
              'User-Agent': 'request'
            },
          qs:{

        }
        };
          request(options, function(error, response, body){
            
            if(body == ""){
              callback("Congratulations! Your email doesn't appear in any of the breached data leaks. Interested in learning more?")
            }
            else{
            let i=0;
            let arr = JSON.parse(body);
            let returnString = "Oh no! Looks like your data has been leaked on the following sites...\n";
            for(i=0;i<arr.length; i++){
              var slackify = require('slackify-html');
              let title = arr[i].Name;
              let domain = slackify(arr[i].Domain);
              let date= arr[i].BreachDate;
              let description = slackify(arr[i].Description);
              
              returnString += "Title: " +  title + "\nDomain: " + domain + "\nDate: " + date + "\nDescription: " + description+"\n\n";
              
            }
              callback(returnString);
              

            
          
            }
            }
          ) 	
      }
      else{
        callback("Oh no! Apparently there's been an error with the program :(");
      }
  }