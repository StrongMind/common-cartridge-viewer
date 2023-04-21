import React, { Component } from "react";
import oauth from "oauth-sign";
import axios from "axios";

import iFrameResize from "iframe-resizer/js/iframeResizer";

export default class ExternalTool extends Component {
  componentDidMount() {
    // document.getElementById("ltiForm" + this.props.itemId).submit();
    iFrameResize(
      { log: true, checkOrigin: false },
      "#ltiFrame" + this.props.itemId
    );
    console.log("making request");
    // process.env.COURSEWARE_LTI_URL = "https://courseware-lti.azurewebsites.net/LtiAmalgamator/launch/62ead9507f340323e891c6e2";
    const bodyFormData = new FormData();
    const params = this.ltiParams();
    Object.entries(params).forEach(([key, value]) => {
      console.log("Key:", key, "Value:", value);
      bodyFormData.set(key, value);
    });
    console.log("bodyFormData:", bodyFormData);
    const res = axios({
      method: "post",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      url:
        "https://courseware-lti.azurewebsites.net/LtiAmalgamator/launch/62ead9507f340323e891c6e2",
      responseType: "document",
      data: bodyFormData
    })
      .then(({ data }) => data)
      .catch(err => {
        console.log(err);
      });
    // look into: https://stackoverflow.com/questions/48848452/axios-post-request-is-complaining-about-cross-origin-but-curl-request-works-fin
    console.log("response:", res);
  }

  axiosRequest(url) {
    const params = this.ltiParams();
    const options = {
      method: "POST",
      url: url,
      data: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        Host: "courseware-lti.azurewebsites.net",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      }
    };

    axios(options)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  }

  ltiParams() {
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
      context_title: this.props.contextTitle || "Missing Context Title",
      resource_link_title:
        this.props.resourceLinkTitle || "Missing Resource Link Title",
      lis_person_name_family: "FamilyName",
      lis_person_name_given: "GivenName",
      context_id: "contextId",
      roles: "Instructor"
    };
    params.oauth_signature = oauth.hmacsign(
      method,
      action,
      params,
      process.env.REACT_APP_LTI_SECRET
    );
    return params;
  }

  render() {
    const params = this.ltiParams();
    return (
      <div>
        <form
          id={"ltiForm" + this.props.itemId}
          action={this.props.launchUrl}
          method="POST"
          target={"ltiFrame" + this.props.itemId}
        >
          {Object.entries(params).map(([key, value]) => {
            return <input name={key} value={value} key={key} />;
          })}

          <input type={"submit"} value={"Submit"} />
        </form>
        <iframe
          src="about:blank"
          width="100%"
          height="500px"
          frameBorder="0"
          name={"ltiFrame" + this.props.itemId}
          id={"ltiFrame" + this.props.itemId}
          title="LTI Frame"
        />
      </div>
    );
  }
}
