function show_snackbar(text) {
  var x = document.getElementById("snackbar")
  x.className = "show"
  x.innerText = text
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000)
} 
