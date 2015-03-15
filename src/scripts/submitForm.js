function showLoadingArea() {
  //document.querySelector("html").hidden = true;
}

function getElementByXPath(xpath) {
  return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function submitForm(formXPath, fieldXPath, formFieldValue) {
  showLoadingArea();

  var formField = getElementByXPath(fieldXPath);
  formField.value = formFieldValue;

  var form = getElementByXPath(formXPath);
  form.submit();
}
