const makeEmbed = require('../../functions/embed');
const type0Message = "(type `0` to cancel / type \"`no`\" for none)\n"; 
const idleMessage = "Command cancelled due to the user being idle";
const cancerCultureMessage = "Command cancelled successfully";
const checkChannels = require("../../functions/Response based Checkers/checkChannels");
const checkRoles = require("../../functions/Response based Checkers/checkRoles");
const mongo = require("../../mongo");
let {guildsCache} = require("../../caches/botCache");
const serversSchema = require("../../schemas/servers-schema");
const sendAndDelete = require("../../functions/sendAndDelete");
const Command = require("../../Classes/Command");
const {MessageActionRow, MessageButton} = require("discord.js");

let server = new Command("server");

server.set({
	aliases         : [],
	description     : "modifies the settings of the server",
	usage           : "server [option]",
	cooldown        : 5,
	unique          : true,
	category        : "config",
	whiteList       : "ADMINISTRATOR",
	worksInDMs      : false,
	isDevOnly       : false,
	isSlashCommand  : true,
    options			: [
        {
            name : "option",
            description : "Which of the following options do you want to modify",
            choices: [
                {name: "join/leave message channel", value: "welcomeChannel"},
                {name: "join role", value: "welcomeRole"},
                {name: "command prefix", value: "prefix"},
                {name: "default embed color", value: "color"},
                {name: "whether user messages should be deleted in logs or not", value: "deleteInLogs"},
                {name: "whether failed command messages should be deleted or not", value: "deleteFails"},
                {name: "Disable/enable commands", value: "categories"},
            ],
            required : false,
            type: 3,
		},
		
	],
});

server.execute = async function(message, args, server, isSlash) {

    let author;
    let type = args[0];
    if(isSlash){
        author = message.user;
        if(args[0])type = args[0].value;
        
    }
    else author = message.author;

    const yes = new MessageButton()
    .setCustomId('true')
    .setLabel('Yes')
    .setStyle('SUCCESS');
    const no = new MessageButton()
    .setCustomId('false')
    .setLabel('No')
    .setStyle('DANGER');
    let row = new MessageActionRow().addComponents(yes, no);

const messageFilter = m => !m.author.bot && m.author.id === author.id;
const buttonFilter =  noob => noob.user.id === author.id && !noob.user.bot;

try {        
    let daServer = server;
    if(!args.length){
        const embed = makeEmbed("Server configurations", `Your server configuration look like this:`, server);
        if(server.hiByeChannel){
            embed.addField('Welcome channel :wave:', `<#${server.hiByeChannel}>\nChange value:\n\`${server.prefix}${this.name} welcomeChannel\``, true);
        }else {
            embed.addField('Welcome channel :wave:', `Empty\nChange value:\n\`${server.prefix}${this.name} welcomeChannel\``, true);
        }
        if(server.hiRole){
            embed.addField('Welcome role :wave:', `<@&${server.hiRole}>\nChange value:\n\`${server.prefix}${this.name} welcomeRole\``, true);
        } else {
            embed.addField('Welcome role :wave:',  `Empty\nChange value:\n\`${server.prefix}${this.name} welcomeRole\``,true);
        }
        

                    
        embed.addFields(
            {name:'Delete messages in logs? :x:', value:`${server.deleteMessagesInLogs? "✅" : "❌"}\nChange value:\n\`${server.prefix}${this.name} deleteInLogs\``, inline:true},
            {name:'Delete failed commands?:clock1:', value:`${server.deleteFailedCommands ? "✅" : "❌"}\nChange value:\n\`${server.prefix}${this.name} deleteFails\``, inline:true},
            {name:'Prefix :information_source:', value:`${server.prefix}\nChange value:\n\`${server.prefix}${this.name} prefix\``, inline:true},
            {name:'Default embed color 🎨', value:`${server.defaultEmbedColor}\nChange value:\n\`${server.prefix}${this.name} color\``, inline:true},
            {name:"Disabled command categories", value:`Change value:\n\`${server.prefix}${this.name} categories\``, inline : true}
        );
        message.reply({embeds:[embed]});
        return false;

    } else {
        let daServer = server;
        switch (type.toLowerCase()) {
            case "welcomechannel":
                let embedo = makeEmbed("Server Settings", `${type0Message}**Enter  your welcoming channel.👋**`, server);
                message.reply({embeds: [embedo]})
                    .then(m => {
                        message.channel.awaitMessages({filter:messageFilter,max: 1, time : 1000 * 30, errors: ['time']})
                            .then(async a => {   
                                let toCheck =   checkChannels(a);
                                switch (toCheck) {
                                    case "not valid":
                                    case "no args": 
                                    case "not useable":              
                                        message.channel.send("Invalid argument, command failed.");
                                        return false;
                                        break;
                                    case "cancel":
                                        message.channel.send(cancerCultureMessage);
                                        return false;
                                        break;
                                    case "no":
                                        daServer.hiByeChannel = "";
                                        break;
                                    default:
                                        daServer.hiByeChannel = toCheck;
                                        break;
                                }
                                await mongo().then(async (mongoose) =>{
                                    try{ 
                                        await serversSchema.findOneAndUpdate({_id:message.guild.id},{
                                            hiByeChannel: daServer.hiByeChannel,
                                        },{upsert:false});
                                        message.channel.send(`**Welcome channel has been successfully updated ✅.**`)
                                        guildsCache[message.guild.id] = daServer;
                                    } finally{
                                        console.log("WROTE TO DATABASE");
                                        mongoose.connection.close();
                                    }
                                });
                            }).catch(e => {
                                message.channel.send(idleMessage);
                            });
                    });
                    return true;
                break;
            case "welcomerole":
                let embedo1 = makeEmbed("Server Settings", `${type0Message}**Enter  your welcoming role.👋**`, server);
                message.reply({embeds: [embedo1]})
                    .then(m => {
                        message.channel.awaitMessages({filter:messageFilter,max: 1, time : 1000 * 30, errors: ['time']})
                            .then(async a => {     
                                let toCheck = checkRoles(a);
                                switch (toCheck) {
                                    case "not valid":
                                    case "no args": 
                                    case "not useable":              
                                        message.channel.send("Invalid argument, command failed.");
                                        return false;
                                        break;
                                    case "cancel":
                                        message.channel.send(cancerCultureMessage);
                                        return false;
                                        break;
                                    case "no":
                                        daServer.hiRole = "";
                                        break;
                                    default:
                                        daServer.hiRole = toCheck;
                                        break;
                                }
                                await mongo().then(async (mongoose) =>{
                                    try{ 
                                        await serversSchema.findOneAndUpdate({_id:message.guild.id},{
                                            hiRole: daServer.hiRole,
                                        },{upsert:false});
                                        message.channel.send(`\n**Welcome role has been successfully updated ✅.**`)
                                        guildsCache[message.guild.id] = daServer;
                                    } finally{
                                        console.log("WROTE TO DATABASE");
                                        mongoose.connection.close();
                                    }
                                });
                            }).catch(e => {
                                message.channel.send(idleMessage);
                            });;
                    });
                    return true;
                break;
                case "color":
                case "colour":
                case "embed":
                    let embedo9 = makeEmbed("Server Settings", `(type \`0\` to cancel / type "\`reset\`" to reset it to default (*#F7F7F7*)\n**Enter the hexadecimal color value you want the embeds sent by the bot to have 🎨**\nExample: #F7F7F7, #1FFA01\nUse this [Website](https://htmlcolorcodes.com) to find a hex color value quickly`, server);
                    message.reply({embeds: [embedo9]})
                        .then(m => {
                            message.channel.awaitMessages({filter:messageFilter,max: 1, time : 1000 * 30, errors: ['time']})
                                .then(async a => {   
                                    let oldColor = daServer.defaultEmbedColor;
                                    let newColor = a.first().content;
                                    switch(newColor.toLowerCase()){
                                        case "0":
                                            message.channel.send(cancerCultureMessage);
                                            return false;
                                            break;
                                        case "reset":
                                            newColor = "#F7f7f7"
                                            break;

                                    }
                                    const testEmbed = makeEmbed("Are you sure?",`This is what "${newColor}" looks like\n<\n<\n<\n<\n<\n<\n<\n Click YES to confirm\n Click NO to cancel`,newColor,false,"");
                                    message.channel.send({embeds: [testEmbed], components: [row]})
                                    .then(async m => {

                                        
                                          m.awaitMessageComponent({filter: buttonFilter,  max : 1,time: 1000 * 20, errors : ["time"] })
                                            .then(async a =>{
                                                
                                                switch (a.customId) {
                                                    case "true":
                                                        daServer.defaultEmbedColor = newColor;
                                                        a.update({components:[]});
                                                        break;
                                                    case "false":
                                                        message.channel.send(cancerCultureMessage);
                                                        a.update({components:[]});
                                                        return false;
                                                        break;
                                                    default:
                                                        message.channel.send(cancerCultureMessage);
                                                        a.update({components:[]});
                                                        return false;
                                                        break;
                                                }

                                                await mongo().then(async (mongoose) =>{
                                                try{ 
                                                    await serversSchema.findOneAndUpdate({_id:message.guild.id},{
                                                        defaultEmbedColor: newColor
                                                    },{upsert:false});
                                                    message.channel.send(`**Default embed color has been successfully updated from \`${oldColor}\` to \`${newColor}\` ✅.**`)
                                                    guildsCache[message.guild.id] = daServer;
                                                } finally{
                                                    console.log("WROTE TO DATABASE");
                                                    mongoose.connection.close();
                                                }
                                    });


                                        }).catch(e => {
                                            if(isSlash) message.editReply({components:[]});
                                            else newMsg.edit({components:[]});
                                            message.channel.send(idleMessage);
                                        });
                                    })
                                  
                                    
                                }).catch(e => {
                                    message.channel.send(idleMessage);
                                });
                        });
                        return true;
                    break;      
                case "prefix":
                    let embedo8 = makeEmbed("Server Settings", `(type \`0\` to cancel)\n**Enter your new command prefix ❗**`, server);
                    message.reply({embeds: [embedo8]})
                        .then(m => {
                            message.channel.awaitMessages({filter:messageFilter,max: 1, time : 1000 * 30, errors: ['time']})
                                .then(async a => {     
                                    let oldPrefix = server.prefix;
                                    const msg = a.first().content;
                                    if (msg === "0") {
                                        message.channel.send(cancerCultureMessage);
                                        return false;
                                    } else if (msg.length > 7) {
                                        const embed = makeEmbed('Prefix too long',"Command prefix can't be longer than 7 characters.", server);
                                        sendAndDelete(message,embed, server);
                                        return false;
                                    } else if(msg === oldPrefix) {
                                        const embed = makeEmbed('Invalid prefix \nSame as before',"", server);
                                        sendAndDelete(message,embed, server);
                                        return false;
                                    }
                                    await mongo().then(async (mongoose) =>{
                                        try{ 
                                            await serversSchema.findOneAndUpdate({_id:message.guild.id},{
                                                prefix:msg,  
                                            },{upsert:false});
                                            guildsCache[message.guild.id].prefix = msg;
                                        } finally{
                                            console.log("WROTE TO DATABASE");
                                            mongoose.connection.close();
                                        }
                        
                                        const embed = makeEmbed(`Prefix changed from "${oldPrefix}" to "${msg}"`,'The prefix has been changed succesfuly ✅.',"2EFF00");
                                        embed.setThumbnail('https://www.iconsdb.com/icons/preview/green/ok-xxl.png');
    
                                        message.channel.send({embeds: [embed]});
                                        return true;
                                    });
                                }).catch(e => {
                                    console.log(e)
                                    message.channel.send(idleMessage);
                                });;
                        });
                        return true;
                    break;
                    
            case "deleteinlogs":
                let embedo6 = makeEmbed("Server Settings", `**Do you want messages to be deleted in logs?❌**`, server);
                message.reply({embeds: [embedo6], components: [row]})
                .then(async m => {
                    let replyMessage;
                    if(isSlash)replyMessage = await  message.fetchReply();
                    else replyMessage = m;
                    replyMessage.awaitMessageComponent({filter: buttonFilter,  max : 1,time: 1000 * 30, errors : ["time"] })
                        .then(async a =>{
                            
                            switch (a.customId) {
                                case "true":
                                    daServer.deleteMessagesInLogs = true;
                                    a.update({components:[]});
                                    break;
                                case "false":
                                    daServer.deleteMessagesInLogs = false;
                                    a.update({components:[]});
                                    break;
                                default:
                                    message.channel.send(cancerCultureMessage);
                                    a.update({components:[]});
                                    return false;
                                    break;
                            }
                            await mongo().then(async (mongoose) =>{
                                try{ 
                                    await serversSchema.findOneAndUpdate({_id:message.guild.id},{
                                        deleteMessagesInLogs: daServer.deleteMessagesInLogs,
                                    },{upsert:false});
                                    message.channel.send(`**Boolean status has been successfully updated ✅.**`)
                                    guildsCache[message.guild.id] = daServer;
                                } finally{
                                    console.log("WROTE TO DATABASE");
                                    mongoose.connection.close();
                                }
                            });
                        }).catch(e => {
                            if(isSlash) message.editReply({components:[]});
                            else newMsg.edit({components:[]});
                            message.channel.send(idleMessage);
                        });
                    });
                    return true;
                break; 
            case "deletefails":
                let embedo7 = makeEmbed("Server Settings", `**Do you want failed commands to be deleted after a few seconds?🕐**`, server);
                message.reply({embeds:[embedo7], components: [row]})
                .then(async m => {
                    let replyMessage;
                    if(isSlash)replyMessage = await  message.fetchReply();
                    else replyMessage = m;
                    
                    replyMessage.awaitMessageComponent({filter: buttonFilter,  max : 1,time: 1000 * 30, errors : ["time"] })
                        .then(async a =>{
                            
                            switch (a.customId) {
                                case "true":
                                    daServer.deleteFailedCommands = true;
                                    a.update({components:[]});
                                    break;
                                case "false":
                                    daServer.deleteFailedCommands = false;
                                    a.update({components:[]});
                                    break;
                                default:
                                    message.channel.send(cancerCultureMessage);
                                    a.update({components:[]});
                                    return false;
                                    break;
                            }
                            await mongo().then(async (mongoose) =>{
                                try{ 
                                    await serversSchema.findOneAndUpdate({_id:message.guild.id},{
                                        deleteFailedCommands: daServer.deleteFailedCommands,
                                    },{upsert:false});
                                    message.channel.send(`**Boolean status has been successfully updated ✅.**`)
                                    guildsCache[message.guild.id] = daServer;
                                } finally{
                                    console.log("WROTE TO DATABASE");
                                    mongoose.connection.close();
                                }
                            });
                        }).catch(e => {
                            if(isSlash) message.editReply({components:[]});
                            else newMsg.edit({components:[]});
                            message.channel.send(idleMessage);
                        });
                    });
                    return true;
                break;     
                case "categories":
                case "disable":
                case "commands":
                case "enable":
                    const AdminFun = new MessageButton()
                    .setCustomId('admin fun')
                    .setLabel('Admin fun')
                    .setStyle(daServer?.disabledCategories?.["admin fun"] ? "DANGER" : "SUCCESS");
                    const fun = new MessageButton()
                    .setCustomId('fun')
                    .setLabel('Fun')
                    .setStyle(daServer?.disabledCategories?.["fun"] ? "DANGER" : "SUCCESS");
                    const events = new MessageButton()
                    .setCustomId('events')
                    .setLabel('Events')
                    .setStyle(daServer?.disabledCategories?.["events"] ? "DANGER" : "SUCCESS");
                    const Moderation = new MessageButton()
                    .setCustomId('Moderation')
                    .setLabel('Moderation')
                    .setStyle(daServer?.disabledCategories?.["Moderation"] ? "DANGER" : "SUCCESS");
                    const other = new MessageButton()
                    .setCustomId('other')
                    .setLabel('Other')
                    .setStyle(daServer?.disabledCategories?.["other"] ? "DANGER" : "SUCCESS");
                    const points = new MessageButton()
                    .setCustomId('points')
                    .setLabel('Points')
                    .setStyle(daServer?.disabledCategories?.["points"] ? "DANGER" : "SUCCESS");
                    const roblox = new MessageButton()
                    .setCustomId('roblox')
                    .setLabel('Roblox')
                    .setStyle(daServer.disabledCategories?.["roblox"] ? "DANGER" : "SUCCESS");

                    let categoriesRow = new MessageActionRow().addComponents(AdminFun, fun, events, Moderation);
                    let categoriesRow2 = new MessageActionRow().addComponents(other, points, roblox);

                    const save = new MessageButton()
                    .setCustomId('true')
                    .setLabel('Save')
                    .setStyle("PRIMARY");
                    const cancel = new MessageButton()
                    .setCustomId('false')
                    .setLabel('Cancel')
                    .setStyle("PRIMARY");

                    let changesRow = new MessageActionRow().addComponents(save, cancel);

                    let embed10 = makeEmbed("Server Settings", `**Disable categories**\nClick the buttons to disable/enable those command categories from being run in your server.`, server);
                    
                    
                    let newMsg = await message.reply({embeds: [embed10], components: [categoriesRow,categoriesRow2, changesRow]})
                    if(isSlash) newMsg = await message.fetchReply();

                    const collector = newMsg.createMessageComponentCollector({ filter: button =>  button.user.id === author.id, time:   20 * 1000 });
                    newMsg.awaitMessageComponent({filter: buttonFilter,  max : 1,time: 1000 * 30, errors : ["time"] });

                    
                        
                    collector.on('collect', async a => {
                            

                        switch (a.customId) {
                            case "true":
                                a.update({components:[]});

                                await mongo().then(async (mongoose) =>{
                                    try{ 
                                        await serversSchema.findOneAndUpdate({_id:message.guild.id},{
                                            disabledCategories: daServer.disabledCategories,
                                        },{upsert:false});
                                        message.channel.send(`Changes have been saved ✅`)
                                        guildsCache[message.guild.id] = daServer;
                                    } finally{
                                        console.log("WROTE TO DATABASE");
                                        mongoose.connection.close();
                                    }
                                });

                                break;
                            case "false":
                                message.channel.send("Changes have been dismissed. ❌")
                                a.update({components:[]});
                                return true;
                                break;
                            default:
                                if(!daServer.disabledCategories)daServer.disabledCategories = {};
                                collector.resetTimer();
                                switch (a.customId) {
                                    
                                    case "admin fun":
                                        daServer.disabledCategories["admin fun"] ? daServer.disabledCategories["admin fun"] = false : daServer.disabledCategories["admin fun"] = true;
                                        AdminFun.setStyle(daServer.disabledCategories["admin fun"] ? "DANGER" : "SUCCESS");
                                        a.update({components:[categoriesRow,categoriesRow2,changesRow]});
                                        break;
                                        case "fun":
                                            daServer.disabledCategories["fun"] ? daServer.disabledCategories["fun"] = false : daServer.disabledCategories["fun"] = true;
                                            fun.setStyle(daServer.disabledCategories["fun"] ? "DANGER" : "SUCCESS");
                                            a.update({components:[categoriesRow,categoriesRow2,changesRow]});
                                            break;
                                        case "events":
                                            daServer.disabledCategories["events"] ?   daServer.disabledCategories["events"] = false :   daServer.disabledCategories["events"] = true;
                                            events.setStyle(daServer.disabledCategories["events"] ? "DANGER" : "SUCCESS");
                                            a.update({components:[categoriesRow,categoriesRow2,changesRow]});
                                            break;
                                        case "Moderation":
                                            daServer.disabledCategories["Moderation"] ? daServer.disabledCategories["Moderation"] = false : daServer.disabledCategories["Moderation"] = true;
                                            Moderation.setStyle(daServer.disabledCategories["Moderation"] ? "DANGER" : "SUCCESS");
                                            a.update({components:[categoriesRow,categoriesRow2,changesRow]});
                                            break;
                                        case "other":
                                            daServer.disabledCategories["other"] ? daServer.disabledCategories["other"] = false : daServer.disabledCategories["other"] = true;
                                            other.setStyle(daServer.disabledCategories["other"] ? "DANGER" : "SUCCESS");
                                            a.update({components:[categoriesRow,categoriesRow2,changesRow]});
                                            break;
                                        case "points":
                                            daServer.disabledCategories["points"] ? daServer.disabledCategories["points"] = false : daServer.disabledCategories["points"] = true;
                                            points.setStyle(daServer.disabledCategories["points"] ? "DANGER" : "SUCCESS");
                                            a.update({components:[categoriesRow,categoriesRow2,changesRow]});
                                            break;  
                                        case "roblox":
                                            daServer.disabledCategories["roblox"] ? daServer.disabledCategories["roblox"] = false : daServer.disabledCategories["roblox"] = true;
                                            roblox.setStyle(daServer.disabledCategories["roblox"] ? "DANGER" : "SUCCESS");
                                            a.update({components:[categoriesRow,categoriesRow2,changesRow]});
                                            break;  
                                
                                    default:
                                        break;
                                }
                            break;
                        }
                            
                            
                    });

                    collector.on('end', collected => {
                        if(isSlash) message.editReply({components:[]}).catch(e=>e);
                        else newMsg.edit({components:[]}).catch(e=>e);
                    });

                    return true;
                    break;                               
            default:
                message.channel.send("Invalid value.");
                break;
        }
    }
} catch (err) {console.log(err);}

}

module.exports = server;