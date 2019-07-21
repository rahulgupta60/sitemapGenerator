// remove staring and ending / form string
module.exports.stripTrailingSlash = url => url.replace(/^\/|\/$/g, '');

// Check protocol
const protocolValidator = (NOT_ALLOWED_PROTOCOL, { protocol }) =>
  !NOT_ALLOWED_PROTOCOL.filter(x => x == protocol).length;

// Check host and domain name
const hostnameValidator = (baseUrl, { hostname }) => {
  // assuming it is relative link always true
  if (hostname) {
    return baseUrl.search(hostname) > 0 ? true : false;
  }
  return true;
};

module.exports.linkValidator = (link, baseUrl, NOT_ALLOWED_PROTOCOL) =>
  protocolValidator(NOT_ALLOWED_PROTOCOL, link) &&
  hostnameValidator(baseUrl, link);
