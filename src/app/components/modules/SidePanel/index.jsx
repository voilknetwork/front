import React from "react";
import PropTypes from "prop-types";
import tt from "counterpart";
import CloseButton from "app/components/elements/CloseButton";
import Icon from "app/components/elements/Icon";
import { Link } from "react-router";

const SidePanel = ({ alignment, visible, hideSidePanel, username }) => {
  if (process.env.BROWSER) {
    visible && document.addEventListener("click", hideSidePanel);
    !visible && document.removeEventListener("click", hideSidePanel);
  }

  const loggedIn =
    username === undefined ? "show-for-small-only" : "SidePanel__hide-signup";

  const makeExternalLink = (i, ix, arr) => {
    const cn = ix === arr.length - 1 ? "last" : null;
    return (
      <li key={i.value} className={cn}>
        <a href={i.link} target="_blank" rel="noopener noreferrer">
          {i.label}&nbsp;<Icon name="extlink" />
        </a>
      </li>
    );
  };

  const makeInternalLink = (i, ix, arr) => {
    const cn = ix === arr.length - 1 ? "last" : null;
    return (
      <li key={i.value} className={cn}>
        <Link to={i.link}>{i.label}</Link>
      </li>
    );
  };

  const sidePanelLinks = {
    internal: [
      {
        value: "welcome",
        label: tt("navigation.welcome"),
        link: `/welcome`
      },
      {
        value: "faq",
        label: tt("navigation.faq"),
        link: `/faq.html`
      },
      {
        value: "tags",
        label: tt("navigation.explore"),
        link: `/tags`
      },
      {
        value: "market",
        label: tt("navigation.currency_market"),
        link: `/market`
      },
      {
        value: "change_password",
        label: tt("navigation.change_account_password"),
        link: `/change_password`
      },
      {
        value: "vote_for_witnesses",
        label: tt("navigation.vote_for_witnesses"),
        link: `/~witnesses`
      }
    ],
    exchanges: [
      {
        value: "VSDmarket",
        label: "VSD Market",
        link: ""
      }
    ],
    external: [
      {
        value: "chat",
        label: "Chat Group",
        link: "https://discord.gg/QNryJsJ"
      },
      {
        value: "Voilk Ads",
        label: "VOILK Ads",
        link: "https://ads.voilk.com"
      },
      {
        value: "Twitter",
        label: "twitter",
        link: "https://twitter.com/voilknetwork"
      },
      {
        value: "VoilkGrid",
        label: "Images",
        link: "https://grid.voilk.com"
      },
      {
        value: "Github",
        label: "Github Repo",
        link: "https://github.com/voilknetwork"
      },
      {
        value: "Facebook Page",
        label: "Like US",
        link: "https://facebook.com/voilknetwork"
      }
    ],
    organizational: [
      {
        value: "explorer",
        label: "Explorer",
        link: "https://explorer.voilk.com"
      }
    ],
    legal: [
      {
        value: "privacy",
        label: tt("navigation.privacy_policy"),
        link: "/privacy.html"
      },
      {
        value: "tos",
        label: tt("navigation.terms_of_service"),
        link: "/tos.html"
      }
    ],
    extras: [
      {
        value: "login",
        label: tt("g.sign_in"),
        link: "/login.html"
      },
      {
        value: "signup",
        label: tt("g.sign_up"),
        link: "https://signup.voilk.com/register"
      },
      {
        value: "post",
        label: tt("g.post"),
        link: "/submit.html"
      }
    ]
  };

  return (
    <div className="SidePanel">
      <div className={(visible ? "visible " : "") + alignment}>
        <CloseButton onClick={hideSidePanel} />
        <ul className={`vertical menu ${loggedIn}`}>
          {makeInternalLink(
            sidePanelLinks["extras"][0],
            0,
            sidePanelLinks["extras"]
          )}
          {makeExternalLink(
            sidePanelLinks["extras"][1],
            1,
            sidePanelLinks["extras"]
          )}
          {makeInternalLink(
            sidePanelLinks["extras"][2],
            2,
            sidePanelLinks["extras"]
          )}
        </ul>
        <ul className="vertical menu">
          {sidePanelLinks["internal"].map(makeInternalLink)}
        </ul>
        <ul className="vertical menu">
          <li>
            <a className="menu-section">
              {tt("navigation.third_party_exchanges")}
            </a>
          </li>
          {sidePanelLinks["exchanges"].map(makeExternalLink)}
        </ul>
        <ul className="vertical menu">
          {sidePanelLinks["external"].map(makeExternalLink)}
        </ul>
        <ul className="vertical menu">
          {sidePanelLinks["organizational"].map(makeExternalLink)}
        </ul>
        <ul className="vertical menu">
          {sidePanelLinks["legal"].map(makeInternalLink)}
        </ul>
      </div>
    </div>
  );
};

SidePanel.propTypes = {
  alignment: PropTypes.oneOf(["left", "right"]).isRequired,
  visible: PropTypes.bool.isRequired,
  hideSidePanel: PropTypes.func.isRequired,
  username: PropTypes.string
};

SidePanel.defaultProps = {
  username: undefined
};

export default SidePanel;
