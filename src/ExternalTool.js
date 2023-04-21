import React, { useEffect, useRef } from "react";
import oauth from "oauth-sign";
import iFrameResize from "iframe-resizer/js/iframeResizer";

export default function ExternalTool(props) {
  const itemId = props.itemId;
  const launchUrl = props.launchUrl;
  const contextTitle = props.contextTitle || "Missing Context Title";
  const resourceLinkTitle =
    props.resourceLinkTitle || "Missing Resource Link Title";
  let ltiFormRef = useRef();
  let ltiFrameRef = useRef();

  useEffect(
    () => {
      ltiFormRef.current.submit();
      iFrameResize({ log: true, checkOrigin: false }, ltiFrameRef.current);
    },
    [itemId]
  );

  function ltiParams() {
    const action = launchUrl;
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
      context_title: contextTitle,
      resource_link_title: resourceLinkTitle,
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

  const params = ltiParams();
  const inputs = Object.entries(params).map(([key, value]) => (
    <input key={key} type="hidden" name={key} value={value} />
  ));

  return (
    <div>
      <form
        id={"ltiForm" + itemId}
        ref={ltiFormRef}
        action={launchUrl}
        method="POST"
        target={"ltiFrame" + itemId}
      >
        {inputs}
      </form>
      <iframe
        src="about:blank"
        width="100%"
        height="500px"
        frameBorder="0"
        name={"ltiFrame" + itemId}
        ref={ltiFrameRef}
        title="LTI Frame"
      />
    </div>
  );
}
