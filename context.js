const client = require("./index").client;
const discord = require("discord.js");
const context = new discord.ContextMenuCommandBuilder()
.setName("Compile")
.setType(discord.ApplicationCommandType.Message); 
new discord.REST().setToken(process.env.token).put(discord.Routes.applicationCommands(client.user.id), { body: [context] });