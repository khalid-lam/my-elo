var url = "http://ferrari.polytechnique.fr:60471";
var client_id = "testclient";
var client_secret = "testpass";

function oAuthConnect() {
    // récupérez ici avec Jquery les valeurs contenus dans vos champs <input> du template de login
    var username = $("#log_login").val();
    var password = $("#log_password").val();

    return $.post("http://ferrari.polytechnique.fr:60471/token.php", {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "password",
        username: username,
        password: password,
    });

}