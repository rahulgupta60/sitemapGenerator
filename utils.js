module.exports.stripTrailingSlash = url => url.replace(/^\/|\/$/g, '');

// Check number for augment
const protocolValidator = (NOT_ALLOWED_PROTOCOL, { protocol }) =>
  !NOT_ALLOWED_PROTOCOL.filter(x => x == protocol).length;

// extractQuery and convert in array
const hostnameValidator = (baseUrl, { hostname }) => {
  console.log('hostname', hostname);
  // assuming it is relative link always true
  if (hostname) {
    return baseUrl.search(hostname) > 0 ? true : false;
  }
  return true;
};

module.exports.linkValidator = (link, baseUrl, NOT_ALLOWED_PROTOCOL) =>
  protocolValidator(NOT_ALLOWED_PROTOCOL, link) &&
  hostnameValidator(baseUrl, link);

module.exports.computeProduct = ([input1, input2]) => input1 * input2;
