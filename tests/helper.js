export function getFormKey(response) {
  var formKey = response.body.match(/'formKey':..................'/).toString();
  var formKeyArray = formKey.split(": ");
  var formKeyValue = formKeyArray[1].toString();
  var formKeyValueClean = formKeyValue.replace("'", "").replace("'", "");
  return formKeyValueClean;
}
