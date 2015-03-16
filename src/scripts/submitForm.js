function showLoadingArea() {
  document.querySelector("html").hidden = true;
}

function removeLoadingArea() {
  document.querySelector("html").hidden = false;
}

function getElementByXPath(xpath) {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function submitForm(formXPath, fieldXPath, formFieldValue) {
  var formField = getElementByXPath(fieldXPath);
  formField.value = formFieldValue;

  var form = getElementByXPath(formXPath);
  form.submit();
}
