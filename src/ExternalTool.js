import React, { Component } from "react";
import oauth from "oauth-sign";

import iFrameResize from "iframe-resizer/js/iframeResizer";
export default class ExternalTool extends Component {
  componentDidMount() {
    document.getElementById("ltiForm").submit();
    iFrameResize({ log: true }, "#ltiFrame");
  }

  ltiParams() {
    const oauth = require("oauth-sign");
    const action = this.props.launchUrl;
    const method = "POST";
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      // LTI Required Parameters
      lti_message_type: "basic-lti-launch-request",
      lti_version: "LTI-1p0",
      resource_link_id: "resourceLinkId",
      // OAuth 1.0a Required Parameters
      oauth_consumer_key: process.env.REACT_APP_LTI_KEY,
      oauth_nonce: btoa(timestamp),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_version: "1.0",
      // Strongmind Custom Parameters
      user_id: 1,
      context_title: "contextTitle",
      resource_link_title: "resourceLinkTitle",
      lis_person_name_family: "FamilyName",
      lis_person_name_given: "GivenName",
      context_id: "contextId",
      roles: "Instructor"
    };
    const signature = oauth.hmacsign(
      method,
      action,
      params,
      process.env.REACT_APP_LTI_SECRET
    );
    params.oauth_signature = signature;
    return params;
  }

  render() {
    const params = this.ltiParams();
    return (
      <div>
        <form
          id="ltiForm"
          action={this.props.launchUrl}
          method="POST"
          target="ltiFrame"
        >
          {Object.entries(params).map(([key, value]) => {
            return <input type="hidden" name={key} value={value} />;
          })}
        </form>
        <iframe
          src={this.props.launchUrl}
          width="100%"
          height="500px"
          frameBorder="0"
          name="ltiFrame"
          id="ltiFrame"
          title="LTI Frame"
        />
      </div>
    );
  }
}
