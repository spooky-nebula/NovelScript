const fs = require("fs");

const Dialog = require('./Dialog.js');

// Load the html template
const animHTMLTemplate = fs.readFileSync("./templates/anim/template.html", "utf8");

class Entity {
  constructor(data) {
    this.name = data.name || "N/A";
    // data should include a complete animation object
    this.anim = data.anim;
  }
}

class Animation {
  constructor(data) {
    /*
    This class icludes path to images of every emotion a character can feel.
      Based it on the wheels of emotions of Robert Ptutchik. (Yes wikipedia)
    https://en.wikipedia.org/wiki/Robert_Plutchik
    */
    this.joy = data.joy;
    this.anger = data.anger;
    this.sad = data.sad;
    this.surprised = data.surprised;
    this.confused = data.confused;
    // this.fear = data.fear;
    // this.disgust = data.disgust;
    // this.anticipation = data.flirty;
    // this.trust = data.trust;
    /*
    I also added normal and regret because I think those are also core to
      characters of a visual novel character
    */
    this.normal = data.normal;
    // this.regret = data.regret;

    return this;
  }

  transition(toAnim, style) {
    /*
    To change from one character emotion to another using the animation image
      paths we have to take the template.html and replace the image with the
      stored image paths and change the css class to play the associated
      animation and then return the resulting html.
    */
    let finishedHTML = animHTMLTemplate;
    finishedHTML = finishedHTML.replace("imagePath", this[toAnim]);
    finishedHTML = finishedHTML.replace("animationStyle", style);

    return finishedHTML;
  }
}

class Character extends Entity {
  constructor(data) {
    super(data);
    this.progress = {};
    this.progress.level = 0;
    // data should include a full dialog object
    this.progress.dialog = data.dialog;

    return this;
  }
}

class Player extends Character {
  constructor(data) {
    super(data);

    return this;
  }
}

module.exports = {
  Animation,
  Character,
  Player
};