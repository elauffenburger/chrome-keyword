function showLoadingArea() {
  document.querySelector("html").hidden = true;
}

function submitForm(formID, formFieldID, formFieldValue) {
  showLoadingArea();

  var formField = document.getElementById(formFieldID);
  formField.value = formFieldValue;

  var form = document.getElementById(formID);
  form.submit();
}
