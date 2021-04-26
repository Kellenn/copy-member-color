const { Plugin } = require("powercord/entities");
const { React, getModule } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { clipboard } = require("electron");

module.exports = class CopyMemberColor extends Plugin {
  async startPlugin() {
    const Menu = await getModule(["MenuItem"]);
    const GuildChannelUserContextMenu = await getModule((m) => m.default && m.default.displayName === "GuildChannelUserContextMenu");
    const getMember = (await getModule(["getMember"]))["getMember"];

    inject("copy-member-color", GuildChannelUserContextMenu, "default", (args, res) => {
      const { guildId } = args[0];
      const userId = args[0].user.id;

      const member = getMember(guildId, userId);

      // yo! we don't want members without colors yo!
      if (member.colorString === null) {
        return res;
      }

      res.props.children.props.children.push(
        React.createElement(Menu.MenuItem, {
          id: "copy-member-color",
          label: "Copy Color",
          action: () => clipboard.writeText(member.colorString),
        })
      );

      return res;
    });
    GuildChannelUserContextMenu.default.displayName = "GuildChannelUserContextMenu";
  }

  pluginWillUnload() {
    uninject("copy-member-color");
  }
};
