require("dotenv").config();
const discord = require("discord.js");
const client = new discord.Client({intents: ["Guilds", "GuildMessages", "MessageContent"]});
const axios = require("axios");
client.on("ready", () => console.log(`${client.user.tag} is logged in`));
const path = require('path');
const filePath = path.resolve(__dirname, 'index.html');
const fs = require("fs");
const express = require("express");
const app = express();
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/botidk.html`);
  res.status(200)
});
app.listen(3000, () => {
  console.log('Bot is ready to online!');
});
client.on("ready", async () => {
  app.get('/apidata', async (req, res) => {
    let data = {
      serverCount: client.guilds.cache.size,
      uptime: client.uptime
    }
    res.json(data)
  })
})
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: "new",
    defaultViewport: { width: 1280, height: 720 }
  });
  const page = await browser.newPage();
  await page.goto(`file://${filePath}`);
  fs.writeFileSync("index.html", `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
  </head>
  <body>
      <p>fuck</p>
  </body>
  </html>`);
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
  // console.log(await axios.get("https://wandbox.org/api/list.json"));
  const compiling = await axios.post(
    "https://wandbox.org/api/compile.json",
    {
      code: "print(input())",
      compiler: "cpython-3.10.2",
      stdin: "dick"
    }
  );
  console.log(compiling)
})();


  const cmd = message.content.replace(/^;/, "");
  const regex1 = /compile\s+```([a-zA-Z]+)\s+([\s\S]+?)```/; //compile `language \n code`
  const regex2 = /^compile [a-zA-Z]+ `.*`$/g; //compile language `code`
  const languages = await axios.get("https://wandbox.org/api/list.json"); // sending a request to wandbox.org for all languages
  const supportedLanguages = Object.values(
    languages.data
      .filter((obj) => obj.name !== "spidermonkey-88.0.0")
      .reduce((accumulator, currentValue) => {
        if (accumulator[currentValue.language]) {
          if (
            currentValue.version > accumulator[currentValue.language].version
          ) {
            accumulator[currentValue.language] = currentValue;
          }
        } else {
          accumulator[currentValue.language] = currentValue;
        }
        return accumulator;
      }, {})
  );
  const stringLanguages = supportedLanguages
    .map((lang) => lang.language)
    .join(", ");
  const supportedLanguagesObj = {
    js: "JavaScript",
    py: "Python",
    java: "Java",
    cpp: "C++",
    rb: "Ruby",
    cs: "C#",
    ts: "TypeScript",
    rs: "Rust",
  };
  const args = message.content.slice(";".length).trim().split(/ +/);
  if (cmd.startsWith("compile")) {
    if (regex1.test(cmd)) {
      const argssplited = args
        .join()
        .split("\n")
        .filter((obj) => obj.length > 0); // splitting args
      const language = argssplited[0].replace(/`/g, "").replace("compile,", ""); // language for the compile
      const code = argssplited[1].replace(/`/g, "").replace(/,/g, " "); // code
      let langcompiled;
      supportedLanguages.forEach((lang, num) => {
        if (lang.language === supportedLanguagesObj[language]) {
          langcompiled = lang.name;
        }
      }); // finding the right language to compile in wandbox.org
      console.log(language);
      console.log(langcompiled);
      if (!langcompiled) {
        return message.channel.send({
          embeds: [
            new discord.EmbedBuilder()
              .setTitle("Language not found")
              .setDescription(
                ` The language that you are using is not found on wandbox.org.\nAvailable languages: ${stringLanguages}`
              ),
          ],
        });
      }
      const compiling = await axios.post(
        "https://wandbox.org/api/compile.json",
        {
          code: code,
          compiler: langcompiled,
        }
      );
      //no error
      if (compiling.data.program_error.length === 0) {
        message.channel.send({
          embeds: [
            new discord.EmbedBuilder()
              .setTitle("Program Output")
              .setDescription(
                `\`\`\`${
                  compiling.data.program_output ||
                  compiling.data.compiler_output
                }\`\`\``
              )
              .setColor("#1abc9c")
              .setFooter({
                text: `${message.author.tag} | ${langcompiled} on wandbox.org`,
              }),
          ],
        });
      } else {
        //yes error
        message.channel.send({
          embeds: [
            new discord.EmbedBuilder()
              .setTitle("Program Output")
              .setDescription(
                `\`\`\`${
                  compiling.data.program_error || compiling.data.compiler_error
                }\`\`\``
              )
              .setColor("#1abc9c")
              .setFooter({
                text: `${message.author.tag} | ${langcompiled} on wandbox.org`,
              }),
          ],
        });
      }
    } else if (regex2.test(cmd)) {
      console.log("regex21 is trested");
      const language = args[0];
      let langcompiled;
      supportedLanguages.forEach((lang, num) => {
        if (lang.language === supportedLanguagesObj[language]) {
          langcompiled = lang.name;
        }
      });

      const code = args[1].replace(/`/g, "");
      if (!langcompiled) {
        return message.channel.send({
          embeds: [
            new discord.EmbedBuilder.setTitle(
              "Language not found"
            ).setDescription(
              ` The language that you are using is not found on wandbox.org.\nAvailable languages: ${stringLanguages}`
            ),
          ],
        });
      }
      const compiling = await axios.post(
        "https://wandbox.org/api/compile.json",
        {
          code: code,
          compiler: langcompiled,
        }
      );
      //no error
      if (compiling.data.program_error.length === 0) {
        message.channel.send({
          embeds: [
            new discord.EmbedBuilder()
              .setTitle("Program Output")
              .setDescription(
                `\`\`\`${
                  compiling.data.program_output ||
                  compiling.data.compiler_output
                }\`\`\``
              )
              .setColor("#1abc9c")
              .setFooter({
                text: `${message.author.tag} | ${langcompiled} on wandbox.org`,
              }),
          ],
        });
      }  else {
        //yes error
        message.channel.send({
          embeds: [
            new discord.EmbedBuilder()
              .setTitle("Program Output")
              .setDescription(
                `\`\`\`${
                  compiling.data.program_error || compiling.data.compiler_error
                }\`\`\``
              )
              .setColor("#1abc9c")
              .setFooter({
                text: `${message.author.tag} | ${langcompiled} on wandbox.org`,
              }),
          ],
        });
      }
    }  else {
      return message.channel.send({
        embeds: [
          new discord.EmbedBuilder()
            .setTitle("Language not found")
            .setDescription(
              `The language that you are using is not found on wandbox.org.\nAvailable languages: ${stringLanguages}`
            ),
        ],
      });
    }
  }

  if (cmd.startsWith("language") || cmd.startsWith("lang")) {
    message.reply({
      embeds: [
        new discord.EmbedBuilder()
          .setTitle("List of supported languages")
          .setDescription(stringLanguages)
          .setFooter({
            text: "You can use the shortcuts like in discord when compiling or viewing a template, such as 'py' meaning 'python' or 'rs' meaning 'rust'!",
          }),
      ],
    });
  }
  if (cmd.startsWith("help")) {
    message.reply({
      embeds: [
        new discord.EmbedBuilder()
          .setTitle("Hello, I'm Brocompiler :D")
          .setDescription(
            "I'm the compiler of imagine gaming play's server. The most valid one in existance The only commands:"
          )
          .addFields({
            name: "`;compile`",
            value:
              "Run it by appending a code block anywhere in the message. The supported languages are the languages that [Wandbox](https://wandbox.org) supports. For stdin, add `|stdinhere` before the code block. \n Example:\n\n;compile \\`\\`\\`py\nprint('Hello world!')\\`\\`\\` \n\n ;compile | hello there \\`\\`\\`py\nprint(input()) # prints out 'hello there'\n\\`\\`\\`",
            
          },
          {
            name: '`;languages or ;lang`',
            value: 
            "Gives a list of supported languages."
          }),
      ],
    });
  }
});

client.login(process.env.token);
