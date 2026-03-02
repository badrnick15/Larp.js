import { after } from "@vendetta/patcher";
import { findByProps, findAll } from "@vendetta/metro";
import { React } from "@vendetta/metro/common";

let unpatchBadges;
let textPatches = [];

const TARGET_USERNAME = "ok"; // change this if needed

// =====================
// FAKE BADGES
// =====================
const fakeBadges = [
  {
    tooltip: "HypeSquad Events",
    icon: "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png"
  },
  {
    tooltip: "Early Verified Bot Developer",
    icon: "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png"
  },
  {
    tooltip: "Discord Bug Hunter (Tier 1)",
    icon: "https://cdn.discordapp.com/badge-icons/2717692c7dca7289b35297368a940dd0.png"
  }
];

// =====================
// TEXT REPLACEMENTS
// =====================
const replacements = {
  "scarning": "no",
  "ashiaugiygf": "ok",
  "anonymousdoxbinuser": "end",
  "teriblys": "lost"
};

const dateReplacements = {
  "Feb 27, 2024": "September 10, 2020",
  "Feb 16, 2025": "November 20, 2016",
  "Feb 18, 2024": "May 13, 2015"
};

// =====================
// TEXT HELPER
// =====================
function replaceText(content) {
  if (typeof content !== "string") return content;

  let newText = content;

  for (const [orig, repl] of Object.entries(replacements)) {
    newText = newText.split(orig).join(repl);
  }

  for (const [orig, repl] of Object.entries(dateReplacements)) {
    newText = newText.split(orig).join(repl);
  }

  return newText;
}

export default {
  onLoad() {

    // =====================
    // BADGE PATCH
    // =====================
    const UserBadgesModule = findByProps("UserBadges");

    if (UserBadgesModule?.UserBadges) {
      unpatchBadges = after("UserBadges", UserBadgesModule, (args, res) => {
        if (!res?.props) return res;

        const user = args[0]?.user;
        if (!user) return res;

        // Remove Quest badge
        if (Array.isArray(res.props.children)) {
          res.props.children = res.props.children.filter(
            badge => badge?.props?.tooltipText !== "Completed a Quest"
          );
        }

        // Inject fake badges
        if (user.username === TARGET_USERNAME) {
          if (!Array.isArray(res.props.children)) {
            res.props.children = [];
          }

          fakeBadges.forEach(b => {
            res.props.children.push(
              React.createElement("img", {
                src: b.icon,
                style: {
                  width: 20,
                  height: 20,
                  marginLeft: 4
                },
                accessibilityLabel: b.tooltip
              })
            );
          });
        }

        return res;
      });
    }

    // =====================
    // GLOBAL TEXT PATCH
    // =====================
    const TextModules = findAll(
      m => m?.default?.displayName?.includes?.("Text")
    );

    TextModules.forEach(mod => {
      if (!mod.default) return;

      const unpatch = after("default", mod, (args, res) => {
        if (!res?.props?.children) return res;

        if (typeof res.props.children === "string") {
          res.props.children = replaceText(res.props.children);
        }

        if (Array.isArray(res.props.children)) {
          res.props.children = res.props.children.map(child =>
            typeof child === "string" ? replaceText(child) : child
          );
        }

        return res;
      });

      textPatches.push(unpatch);
    });

    console.log("LarpyUsers loaded.");
  },

  onUnload() {
    if (unpatchBadges) unpatchBadges();
    textPatches.forEach(p => p());
  }
};
