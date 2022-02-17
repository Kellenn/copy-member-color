const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");
const { uninject } = require("powercord/injector");
const { injectContextMenu } = require("powercord/util");
const { clipboard } = require("electron");

module.exports = class CopyMemberColor extends Plugin {
  async startPlugin() {
    const Menu = await getModule(["MenuItem"]);

    injectContextMenu("copy-member-color", "GuildChannelUserContextMenu", ([{ target }], res) => {
      const parentElement = this.getParentElementFromChildElement(target);
      const roleColorElementStyle = this.getUserColorElementStylesFromParentElement(parentElement);

      const rgb = this.getRgb(roleColorElementStyle?.getPropertyValue("color"));

      if (!rgb) {
        return res;
      }

      const hex = this.getHexFromRgb(rgb);

      res.props.children.push(
        React.createElement(Menu.MenuItem, {
          id: "copy-member-color",
          label: "Copy Color",
          action: () => clipboard.writeText(hex),
        })
      );

      return res;
    });
  }

  getParentElementFromChildElement(element) {
    /*
    GuildChannelUserContextMenu contains two children elements,
    avatar-6qzftW and content-1U25dZ, both with their own children.
    Depending on where the user clicks, the element we get in our callback may change; hence,
    we have to traverse the element tree until we get to the eldest parent element,
    layout-1qmrhw. Then we can search its children's elements until we find our desired element.
    */
    while (element &&
      !element?.classList?.contains("layout-1qmrhw") &&
      !element?.classList?.contains("message-2CShn3")
    ) {
      element = element.parentNode;
    }
    return element;
  }

  getUserColorElementStylesFromParentElement(parentElement) {
    if (!parentElement) {
      return null;
    }

    return parentElement.getElementsByClassName(
      "desaturateUserColors-1O-G89")[0]?.style;
  }

  getRgb(string) {
    const rgbRegex = this.getRgbRegex();
    const rgbRegexMatch = rgbRegex.exec(string);

    if (!rgbRegexMatch) {
      return null;
    }

    return {
      red: parseInt(rgbRegexMatch[1]),
      green: parseInt(rgbRegexMatch[2]),
      blue: parseInt(rgbRegexMatch[3])
    };
  }

  getRgbRegex() {
    return /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/;
  }

  getHexFromRgb(rgb) {
    const firstByte = this.getHexFromRgbComponent(rgb.red);
    const secondByte = this.getHexFromRgbComponent(rgb.green);
    const thirdByte = this.getHexFromRgbComponent(rgb.blue);

    return `#${firstByte}${secondByte}${thirdByte}`;
  }

  getHexFromRgbComponent(component) {
    return parseInt(component).toString(16).padStart(2, '0');
  }

  pluginWillUnload() {
    uninject("copy-member-color");
  }
};