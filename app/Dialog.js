const fs = require("fs");

/* const {
  Animation,
  Character,
  Player
} = require('./Character.js');
const Place = require('./Place.js'); */

class Dialog {
  // Dialog is a glorified JSON object with tokens as its elements
  constructor(dir, parser) {
    let dialogFile = fs.readFileSync(dir, "utf8");

    this.dialog = parser.parse(dialogFile);
  }
}

class DialogParser {
  /*
  The DialogParser constructor sets the configuration of the parser. Right now
    it only supports "playerName"
  */
  constructor(playerName) {
    this.playerName = playerName;
  }
  /*
  parse() is pretty simple it takes in a string that has to look alike a
    markdown and parses it to a JSON.
  */
  parse(string) {
    // First we extract each line inside the string
    let stringArray = string.split(/\r\n|\r|\n/);
    // Then we setup the necessary JSON to return after the parsing is completed
    let dialogJSON = {};
    /*
    The token counter is to help keep track of how many tokens are inside the
      dialog object. This is needed since adding the text elements requires to
      put the new element inside the last token on the array (this could also
      be achieved with dialogJSON.tokens.lenght).
    */
    let tokenCounter = -1;
    /*
    The options counter and array is to keep track of dialog options tokens
      since the parser iterates thru the array of strings to get each token
      so it is difficult to backtrack without leaving breadcrumbs.

    The options counter and array are theoredical breadcrumbs outside the scope
      of the forEach function and let the elements inside it read its values and
      set their values.

    The options counter and array are reffered again in the part of the
      forEach dedicated to taking care of dialogOptions.
    */
    let optionsCounter = -1;
    let options = [];
    // The array string must be riddened of empty lines and %variables% replaced
    for (var i = 0; i < stringArray.length; i++) {
      // Try to replace the %playerName% variable on every line
      try {
        stringArray[i] = stringArray[i].replace("%playerName%", this.playerName);
      } catch (e) {}
      /*
      Everytime a line has nothing inside it ("") then it needs to be removed
        from the array so the forEach has an easier task ahead.
      */
      if (stringArray[i] == '') {
        stringArray.splice(i, 1);
      }
    }
    /*
    This forEach loop iterates thru each of the elements of the stringArray to
      arrange them into tokens inside the resulting dialogJSON. The resulting
      dialogJSON often has this format:

    {
      place: "highschool-entrance",
      tokens: [{
          type: "scene",
          character: "chode",
          emotion: "normal",
          transition: "none",
          text: [{
            type: "dialogText",
            text: "Hey there anon!"
          },{
            type: "dialogText",
            text: "How are you doing with this semester"
          }]
      }]
    }

    Each token has it's type which can be either a "goto" or a "scene".

    Inside each scene token there is a "character", an "emotion", a "transition"
      and the corresponding dialog in the form of "text" element.

    Inside the "text" element of a scene there is a small dialog object
      containing just the "type" and the "content" of the "text" element. the
      type can either be a "dialogText", which just includes a string containing
      the text of that part of the dialog, or a "dialogChoice", which normally
      includes an "options" array with elements similar to the "dialogText" like
      "content" but include a "goto" attribute which indicates what the next
      dialog is to be followed by the choice selected. This "goto" is supposed
      to have this format: "path.to.dialog" like this example:

    {
      "type": "dialogChoice",
      "options": [{
          "text": "run from chode",
        "goto": "running"
        },{
          "text": "stay with chode",
          "goto": "good"
        },{
          "text": "battle chode",
          "goto": "choded"
      }]
    }

    The goto is supposed to link to a "goto" token after the choice.
    */
    stringArray.forEach(element => {
      /*
      The root element of the dialog object has the properties:
        - place, which is the place in which the dialog takes place
        - tokens, an array of tokens which amount to the dialog that takes place
      */
      // For place
      if (element.startsWith("# ")) {
        dialogJSON = {
          place: element.substring(2, element.length),
          tokens: []
        }; // create the root project and set it as the root
      }
      /*
      The primary element in dialog object is the tokens which come in different types:
        - scene tokens, include information about the charaters on the scene and
          their emotions/transitions;
        - goto tokens, include target dialogs to which the dialog can branch
          to.
      */
      // For scene tokens
      if (element.startsWith("## ")) {
        let scene = element.split(" "); // split the string
        let data = {
          type: "scene",
          character: scene[1],
          emotion: scene[2] || "none",
          transition: scene[3] || "none",
          text: []
        }; // create and assign token data
        dialogJSON.tokens.push(data); // add the new token to the tokens
        tokenCounter++; // add one to the token counter
      }
      // For "go go" tokens
      if (element.startsWith("> ")) {
        let gotoText = element.split(" "); // split the string
        let data = {
          type: "goto",
          name: gotoText[1],
          target: gotoText[2]
        }; // create and assign token data
        dialogJSON.tokens.push(data); // add the new token to the tokens
        tokenCounter++; // add one to the token counter
      }
      /*
      Inside the token elements there is actual dialog that includes:
        - dialogText, encapsulates the text to be displayed on the dialog;
        - dialogOption, which includes an array of options with each having its
          own content (string of dialog text) and target (string pointing to
          a specific "goto" token).
      */
      // For text dialog
      if (element.startsWith("- ")) {
        let data = {
          type: "dialogText",
          content: element.substring(2, element.length)
        }; // create and assign dialog data
        dialogJSON.tokens[tokenCounter].text.push(data); // add the new text dialog to the last token
      }
      /*
      The options should be formated like this:
        text_of_the_option => target_goto
      */
      // For option dialog
      if (element.match(/^\d./)) { // if the option marker is found then add the option to the options array
        // cut the string short so it doesn't include the number of the option
        let optionsText = element.substring(3, element.length);
        options.push({
          content: optionsText.substring(0, optionsText.indexOf(" => ")),
          goto: optionsText.substring(optionsText.indexOf(" => ") + 4, optionsText.length)
        }); // create and assign options
      } else if (options.length > 0) { // if it finds something else and there is stuff inside the options array
        let data = {
          type: "dialogChoice",
          options: options // add the options array to the data
        }; // create and assign dialog data
        dialogJSON.tokens[tokenCounter - 1].text.push(data); // add the dialog options to the last token
        options = []; // reset the array
      }
    });
    // finally return the resulting dialogJSON
    return dialogJSON;
  }
}

module.exports = {
  Dialog,
  DialogParser
};