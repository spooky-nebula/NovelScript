const fs = require("fs");

// Load the html templates
const placeHTMLTemplateFade = fs.readFileSync("./templates/place/templateFade.html", "utf8");
const placeHTMLTemplateNoFade = fs.readFileSync("./templates/place/templateNoFade.html", "utf8");

class Place {
  constructor(data) {
    // The background must be path to an image
    this.background = data.background;
    this.id = data.id;
    this.displayName = data.displayName;

    return this;
  }

  transition(doFade) {
    /*
    To change from one place to another we need to produce html from the
      template that fades in the new place background with a title of the
      new place on the fade in. This is simple with the template done so
      all there is to do is replace the imagePath of the background on the
      html.
    */
    let finishedHTML;
    if (doFade) {
      finishedHTML = placeHTMLTemplateFade;
      finishedHTML = finishedHTML.replace("imagePath", this.background);
      finishedHTML = finishedHTML.replace("placeName", this.displayName);
    } else {
      finishedHTML = placeHTMLTemplateNoFade;
      finishedHTML = finishedHTML.replace("imagePath", this.background);
    }

    return finishedHTML;
  }
}

module.exports = Place;