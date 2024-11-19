$(document).ready(function () {

    $(window).on('hashchange', route);

    function route() {
        var hash = window.location.hash;

        switch (hash) {
            case "#login":
                $.get("template/login.tpl.html", function (template) {
                    $("#my-content").html(template);
                    $("#login_button").on("click", function (data) {
                        oAuthConnect()
                            // Affichage un modal success si le login et le mot de passe sont bons
                            .done(function (data) {
                                localStorage["access_token"] = data.access_token;
                                localStorage["login"] = $("#log_login").val();
                                $("#modal-login-title").text("Connexion réussie");
                                $("#modal-login-message").text("Bravo !");
                                $("#bouton_retour").text("Accéder à votre espace");
                                var modal = new bootstrap.Modal(document.getElementById('#modal-login'), {});
                                $(".modal-GIF").empty().append(`<img src="img/hawk-eye-in.gif" alt="GIF" class="img-fluid">`);
                                modal.show();
                                $("#bouton_retour").on("click", function () {
                                    modal.hide();
                                    window.location.href = "index.html#home";
                                });
                            })
                            // Affichage un modal fail sinon
                            .fail(function (xhr, status, error) {
                                var err = eval("(" + xhr.responseText + ")");
                                $("#modal-login-title").text("Connexion échouée");
                                $("#modal-login-message").text(err.error_description);
                                $("#bouton_retour").text("Retour à l'accueil");
                                var modal = new bootstrap.Modal(document.getElementById('#modal-login'), {});
                                $(".modal-GIF").empty().append(`<img src="img/block-wemby.gif" alt="GIF" class="img-fluid">`);
                                modal.show();
                                $("#bouton_retour").on("click", function () {
                                    window.location.href = "index.html";
                                });
                            });
                    });
                }, "html");
                break;
            case "#register":
                $.get("template/register.tpl.html", function (template) {
                    $("#my-content").html(template);
                    $("#register_button").on("click", function (data) {
                        reg = {
                            "login": $("#register_login").val(),
                            "pwd": $("#register_password").val(),
                            "cpwd": $("#register_confirmed_password").val(),
                            "last_name": $("#register_last_name").val(),
                            "first_name": $("#register_first_name").val(),
                            "email": $("#register_email").val(),
                        };
                        // Affichage du modal correspondant
                        $.post(url + "/register.php", reg, function (data) {
                            var titre = (data.status == 'success' ? 'Inscription réussie' : 'Inscription échouée');
                            $("#modal-register-title").text(titre);
                            $("#modal-register-message").text(data.description);
                            var modal_reg = new bootstrap.Modal(document.getElementById('#modal-register'), {});
                            $(".modal-GIF").empty().append(`<img src="img/register-ok.gif" alt="GIF" class="img-fluid">`);
                            modal_reg.show();
                            $("#bouton_retour").on("click", function () {
                                window.location.href = "index.html";
                            });
                        }, "json");
                    });
                });
                break;
            case "#about":
                $.get("template/about.tpl.html", function (template) {
                    $("#my-content").html(template);
                    // Chargement du LaTeX
                    if (window.MathJax) {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    } else {
                        console.error("MathJax n'est pas chargé !");
                    }
                }, "html");
                break;
            case "#newmatch":
                isConnected(); //renvoie à index.html si l'utilisateur n'est pas connecté
                $.get("template/newmatch.tpl.html", function (template) {
                    $("#my-content").html(template);
                    $("#tennis-form").hide();
                    $("#fifa-form").hide();
                    // Redirige vers le case #newmatchtennis ou #newmatchfifa selon la valeur de #game
                    $("#game").on('change', function () {
                        if ($("#game").val() == "Tennis") {
                            window.location.href = "index.html#newmatchtennis";
                        }
                        if ($("#game").val() == "FIFA") {
                            window.location.href = "index.html#newmatchfifa";
                        }
                    });
                }, "html");
                break;
            // On décline le case #newmatch en #newmatchtennis et #newmatchfifa pour éviter l'imbrication infinie du changement de valeurs de #game
            case "#newmatchtennis":
                isConnected();
                $.get("template/newmatch.tpl.html", function (template) {
                    currentuser = { "username": localStorage["login"] };
                    $.post(url + "/opponent.php", currentuser, function (opponentList) {
                        template2 = Mustache.render(template, { opponents: opponentList });
                        $("#my-content").html(template2);
                        $("#fifa-form").hide();
                        $("#game").val("Tennis");
                        // Date et heure mises par défaut
                        $("#date-input-tennis").val(new Date().toISOString().split("T")[0]);
                        $("#time-input-tennis").val(new Date().toLocaleString().slice(11, 16));
                        console.log("heure modifiée");
                        // Changement de case si la valeur de #game change
                        $("#game").on('change', function () {
                            if ($("#game").val() == "Tennis") {
                                window.location.href = "index.html#newmatchtennis";
                            }
                            if ($("#game").val() == "FIFA") {
                                window.location.href = "index.html#newmatchfifa";
                            }
                        });
                        // Affiche la saisie d'un 3ème set si #isThirdSet est coché
                        $("#isThirdSet").on("change", function () {
                            if ($("#isThirdSet").prop("checked")) {
                                $("#set-3").show();
                            }
                            if (!$("#isThirdSet").prop("checked")) {
                                $("#set-3").attr("style", "display: none !important;");
                                $("#score-set3-winner").val("");
                                $("#score-set3-loser").val("");
                            }
                        });
                        // Validation du formulaire
                        $("#tennis-form").on("submit", function (event) {
                            event.preventDefault();
                            var formData = $("#tennis-form").serializeArray();
                            var matchData = {
                                "game": "tennis",
                                "player-id": localStorage["login"],
                            };
                            formData.forEach(function (item) {
                                matchData[item.name] = item.value;
                            });
                            if (typeof $('#myImageTennis').attr("src") == 'undefined') {
                                matchData["image"] = "null"
                            }
                            else { matchData["image"] = $('#myImageTennis').attr("src"); }
                            var score = isScoreTennis(matchData);
                            var modal_match = new bootstrap.Modal(document.getElementById('#modal-match'), {});
                            // Vérifie si le score est recevable et affiche un modal si ce n'est pas le cas
                            if (!score["score"]) {
                                $("#modal-match-title").text("Erreur dans la saisie du match");
                                $("#modal-match-message").text(score["msg"]);
                                $("#bouton-retour-message").text("Saisir un match");
                                $(".modal-GIF").empty().append(`<img src="img/nadal-understand.gif" alt="GIF" class="img-fluid">`);
                                modal_match.show();
                                $("#bouton_newmatch_retour").on("click", function () {
                                    modal_match.hide();
                                    window.location.href = "index.html#newmatchtennis";
                                });
                            }
                            else {
                                // Envoie des données du match au serveur 
                                $.post(url + "/match.php", matchData, function (data) {
                                    if (data["status"] == "success") {
                                        $("#modal-match-title").text("Match ajouté !");
                                        $("#modal-match-message").text("Les elos ont bien été mis à jour");
                                        $(".modal-GIF").empty().append(`<img src="img/federer-ok.gif" alt="GIF" class="img-fluid">`);
                                    }
                                    else {
                                        $("#modal-match-title").text("Erreur");
                                        $("#modal-match-message").text("Erreur inconnue, veuillez réessayer");
                                    };
                                    $("#bouton-retour-message").text("Retour à l'accueil");
                                    modal_match.show();
                                    $("#bouton_newmatch_retour").on("click", function () {
                                        modal_match.hide();
                                        window.location.href = "index.html#home";
                                    });
                                });
                            };
                        });
                    });
                }, "html");
                break;
            case "#newmatchfifa":
                isConnected();
                $.get("template/newmatch.tpl.html", function (template) {
                    currentuser = { "username": localStorage["login"] };
                    $.post(url + "/opponent.php", currentuser, function (opponentList) {
                        template2 = Mustache.render(template, { opponents: opponentList });
                        $("#my-content").html(template2);
                        $("#tennis-form").hide();
                        $("#fifa-form").show();
                        $("#game").val("FIFA");
                        // Date et heure mises par défaut
                        $("#date-input-fifa").val(new Date().toISOString().split("T")[0]);
                        $("#time-input-fifa").val(new Date().toLocaleString().slice(11, 16));
                        // Changement de case si la valeur de #game change
                        $("#game").on('change', function () {
                            if ($("#game").val() == "Tennis") {
                                window.location.href = "index.html#newmatchtennis";
                            }
                            if ($("#game").val() == "FIFA") {
                                window.location.href = "index.html#newmatchfifa";
                            }
                        });
                        // Validation du formulaire
                        $("#fifa-form").on("submit", function (event) {
                            event.preventDefault();
                            var formData = $("#fifa-form").serializeArray();
                            var matchData = {
                                "game": "FIFA",
                                "player-id": localStorage["login"],
                            };
                            formData.forEach(function (item) {
                                matchData[item.name] = item.value;
                            });
                            if (typeof $('#myImageFIFA').attr("src") == 'undefined') {
                                matchData["image"] = "null"
                            }
                            else { matchData["image"] = $('#myImageFIFA').attr("src"); }
                            console.log(matchData);
                            var score = isScoreFifa(matchData);
                            var modal_match = new bootstrap.Modal(document.getElementById('#modal-match'), {});
                            // Vérifie si le score est recevable et affiche un modal si ce n'est pas le cas
                            if (!score["score"]) {
                                $("#modal-match-title").text("Erreur dans la saisie du match");
                                $("#modal-match-message").text(score["msg"]);
                                $(".modal-GIF").empty().append(`<img src="img/ronaldo-angry.gif" alt="GIF" class="img-fluid">`);
                                $("#bouton-retour-message").text("Saisir un match");
                                modal_match.show();
                                $("#bouton_newmatch_retour").on("click", function () {
                                    modal_match.hide();
                                    window.location.href = "index.html#newmatchfifa";
                                });
                            }
                            else {
                                // Envoie des données du match au serveur 
                                $.post(url + "/match.php", matchData, function (data) {
                                    if (data["status"] == "success") {
                                        $("#modal-match-title").text("Match ajouté !");
                                        $("#modal-match-message").text("Les elos ont bien été mis à jour");
                                        $(".modal-GIF").empty().append(`<img src="img/messi-ok.gif" alt="GIF" class="img-fluid">`);
                                    }
                                    else {
                                        $("#modal-match-title").text("Erreur");
                                        $("#modal-match-message").text("Erreur inconnue, veuillez réessayer");
                                    };
                                    $("#bouton-retour-message").text("Retour à l'accueil");
                                    modal_match.show();
                                    $("#bouton_newmatch_retour").on("click", function () {
                                        modal_match.hide();
                                        window.location.href = "index.html#home";
                                    });
                                });
                            };
                        });
                    });
                }, "html");
                break;
            // Les cases suivants : #allresults, #myresults et #leaderboard (et leurs déclinaisons) sont analogues à #newmatch 
            case "#allresults":
                $.get("template/allresults.tpl.html", function (template) {
                    var template2 = Mustache.render(template, { fifaAllResults: {}, tennisAllResults: {} });
                    $("#my-content").html(template2);
                    $("#fifa-allresults").hide();
                    $("#tennis-allresults").hide();
                    $("#game-allresults").on('change', function () {
                        if ($("#game-allresults").val() == "Tennis") {
                            window.location.href = "index.html#tennis_allresults";
                        } else if ($("#game-allresults").val() == "FIFA") {
                            window.location.href = "index.html#fifa_allresults";
                        }
                    });
                }, "html");
                break;
            case "#tennis_allresults":
                $.get("template/allresults.tpl.html", function (template) {
                    currentGame = { "game": "tennis" };
                    $.post(url + "/allresults.php", currentGame, function (tennisResults) {
                        var template2 = Mustache.render(template, { tennisAllResults: tennisResults });
                        $("#my-content").html(template2);
                        $("#game-allresults").val("Tennis");
                        $("#fifa-allresults").hide();
                        const currentUser = localStorage["login"];
                        const tableBody = document.querySelector("#tennis-allresults tbody");
                        tennisResults.forEach(match => {
                            // Ajout dynamique des lignes de match
                            displayMyresults(match, tableBody, currentUser, false);
                        });
                        $("#game-allresults").on('change', function () {
                            if ($("#game-allresults").val() == "Tennis") {
                                window.location.href = "index.html#tennis_allresults";
                            } else if ($("#game-allresults").val() == "FIFA") {
                                window.location.href = "index.html#fifa_allresults";
                            }
                        });
                    });
                }, "html");
                break;
            case "#fifa_allresults":
                $.get("template/allresults.tpl.html", function (template) {
                    currentGame = { "game": "fifa" };
                    $.post(url + "/allresults.php", currentGame, function (fifaResults) {
                        var template2 = Mustache.render(template, { fifaAllResults: fifaResults });
                        $("#my-content").html(template2);
                        $("#game-allresults").val("FIFA");
                        $("#tennis-allresults").hide();
                        const currentUser = localStorage["login"];
                        const tableBody = document.querySelector("#fifa-allresults tbody");
                        fifaResults.forEach(match => {
                            // Ajout dynamique des lignes de match
                            displayMyresults(match, tableBody, currentUser, false);
                        });
                        $("#game-allresults").on('change', function () {
                            if ($("#game-allresults").val() == "Tennis") {
                                window.location.href = "index.html#tennis_allresults";
                            } else if ($("#game-allresults").val() == "FIFA") {
                                window.location.href = "index.html#fifa_allresults";
                            }
                        });
                    });
                }, "html");
                break;
            case "#myresults":
                isConnected();
                $.get("template/myresults.tpl.html", function (template) {
                    var template2 = Mustache.render(template, { myFifaResults: {}, myTennisResults: {} });
                    $("#my-content").html(template2);
                    $("#tennis-myresults").hide();
                    $("#fifa-myresults").hide();
                    $("#game-myresults").on('change', function () {
                        if ($("#game-myresults").val() == "Tennis") {
                            window.location.href = "index.html#my_tennis_results";
                        }
                        else if ($("#game-myresults").val() == "FIFA") {
                            window.location.href = "index.html#my_fifa_results";
                        }
                    });
                }, "html");
                break;
            case "#my_tennis_results":
                isConnected();
                $.get("template/myresults.tpl.html", function (template) {
                    currentGame = { "game": "tennis", "user": localStorage["login"] };
                    $.post(url + "/myresults.php", currentGame, function (myResults) {
                        var template2 = Mustache.render(template, { myTennisResults: myResults });
                        $("#my-content").html(template2);
                        $("#game-myresults").val("Tennis");
                        $("#fifa-myresults").hide();
                        const currentUser = localStorage["login"];
                        const tableBody = document.querySelector("#tennis-myresults tbody");
                        console.log(currentUser);
                        myResults.forEach(match => {
                            // Ajout dynamique des lignes de match
                            displayMyresults(match, tableBody, currentUser, true);
                        });
                        $("#game-myresults").on('change', function () {
                            if ($("#game-myresults").val() == "Tennis") {
                                window.location.href = "index.html#my_tennis_results";
                            }
                            else if ($("#game-myresults").val() == "FIFA") {
                                window.location.href = "index.html#my_fifa_results";
                            }
                        });
                    });
                }, "html");
                break;
            case "#my_fifa_results":
                isConnected();
                $.get("template/myresults.tpl.html", function (template) {
                    currentGame = { "game": "fifa", "user": localStorage["login"] };
                    $.post(url + "/myresults.php", currentGame, function (myResults) {
                        var template2 = Mustache.render(template, { myFifaResults: myResults });
                        $("#my-content").html(template2);
                        $("#game-myresults").val("FIFA");
                        $("#tennis-myresults").hide();
                        const currentUser = localStorage["login"];
                        const tableBody = document.querySelector("#fifa-myresults tbody");
                        myResults.forEach(match => {
                            // Ajout dynamique des lignes de match
                            displayMyresults(match, tableBody, currentUser, true);
                        });
                        $("#game-myresults").on('change', function () {
                            if ($("#game-myresults").val() == "Tennis") {
                                window.location.href = "index.html#my_tennis_results";
                            }
                            else if ($("#game-myresults").val() == "FIFA") {
                                window.location.href = "index.html#my_fifa_results";
                            }
                        });
                    });
                }, "html");
                break;
            case "#leaderboard":
                $.get("template/leaderboard.tpl.html", function (template) {
                    var template2 = Mustache.render(template, { tennisUsers: {}, fifaUsers: {} });
                    $("#my-content").html(template2);
                    $("#tennis_table").hide();
                    $("#FIFA_table").hide();
                    $("#choose_leaderboard").on('change', function () {
                        if ($("#choose_leaderboard").val() == "Tennis") {
                            window.location.href = "index.html#tennis_leaderboard";
                        } else if ($("#choose_leaderboard").val() == "FIFA") {
                            window.location.href = "index.html#fifa_leaderboard";
                        }
                    });
                }, "html");
                break;
            case "#tennis_leaderboard":
                $.get("template/leaderboard.tpl.html", function (template) {
                    $.getJSON(url + '/tennis_leaderboard.php', function (tennisUsersList) {
                        currentUser = localStorage["login"];
                        tennisUsersList.forEach((user, index) => {
                            if (index === 0) {
                                user.rank = '<i class="fas fa-crown" style="color: gold;"></i>'; // Couronne pour la 1ère place
                            } else if (index === 1) {
                                user.rank = '<i class="fas fa-medal" style="color: silver;"></i>'; // Médaille d'argent pour 2nd place
                            } else if (index === 2) {
                                user.rank = '<i class="fas fa-medal" style="color: #cd7f32;"></i>'; // Médaille de bronze pour 3eme place
                            } else {
                                user.rank = index + 1; // Ajouter un classement basé sur l'index
                            }
                            // Vérifie si l'utilisateur que l'on parcourt est celui qui est connecté afin de mettre sa ligne en gras  
                            if (user.username === currentUser) {
                                user.isCurrentUser = true;
                            }
                        });
                        var tennisContent = Mustache.render(template, { tennisUsers: tennisUsersList })
                        $("#my-content").html(tennisContent);
                        $("#FIFA_table").hide();
                        $("#choose_leaderboard").val("Tennis");
                        $("#choose_leaderboard").on('change', function () {
                            if ($("#choose_leaderboard").val() == "Tennis") {
                                window.location.href = "index.html#tennis_leaderboard";
                            } else if ($("#choose_leaderboard").val() == "FIFA") {
                                window.location.href = "index.html#fifa_leaderboard";
                            }
                        });
                    });
                }, "html");
                break;
            case "#fifa_leaderboard":
                $.get("template/leaderboard.tpl.html", function (template) {
                    $.getJSON(url + '/fifa_leaderboard.php', function (fifaUsersList) {
                        currentUser = localStorage["login"];
                        fifaUsersList.forEach((user, index) => {
                            if (index === 0) {
                                user.rank = '<i class="fas fa-crown" style="color: gold;"></i>'; // Couronne pour la 1ère place
                            } else if (index === 1) {
                                user.rank = '<i class="fas fa-medal" style="color: silver;"></i>'; // Médaille d'argent pour 2nd place
                            } else if (index === 2) {
                                user.rank = '<i class="fas fa-medal" style="color: #cd7f32;"></i>'; // Médaille de bronze pour 3eme place
                            } else {
                                user.rank = index + 1; // Ajouter un classement basé sur l'index
                            }
                            // Vérifie si l'utilisateur que l'on parcourt est celui qui est connecté afin de mettre sa ligne en gras  
                            if (user.username === currentUser) {
                                user.isCurrentUser = true;
                            }
                        });
                        var fifaContent = Mustache.render(template, { fifaUsers: fifaUsersList });
                        $("#my-content").html(fifaContent);
                        $("#choose_leaderboard").val("FIFA");
                        $("#tennis_table").hide();
                        $("#choose_leaderboard").on('change', function () {
                            if ($("#choose_leaderboard").val() == "Tennis") {
                                window.location.href = "index.html#tennis_leaderboard";
                            } else if ($("#choose_leaderboard").val() == "FIFA") {
                                window.location.href = "index.html#fifa_leaderboard";
                            }
                        });
                    });
                }, "html");
                break;
            // Interface home : l'utilisateur y accède après s'être connecté
            case "#home":
                isConnected();
                $.get("template/home.tpl.html", function (template) {
                    template2 = template.replace("{{login}}", localStorage["login"]);
                    $("#my-content").html(template2);
                    $("#logout-btn").on('click', function () {
                        localStorage["login"] = "";
                        localStorage["access_token"] = "";
                        console.log("mémoire maj");
                        window.location.href = "index.html";
                    });
                }, "html");
                break;
            // Si l'utilisateur qui n'est pas connecté tente d'accéder à une page où il est censé l'être
            case "#not_connected":
                $.get("template/index.tpl.html", function (template) {
                    $("#my-content").html(template);
                    // Affichage du modal qui le redirige vers index.html
                    var modal_not_connected = new bootstrap.Modal(document.getElementById('#modal-not-connected'), {});
                    $(".modal-GIF").append(`<img src="img/chiellini-pulls-saka.gif" alt="GIF" class="img-fluid">`);
                    modal_not_connected.show();
                    $("#bouton-not-connected").on('click', function () {
                        modal_not_connected.hide();
                        window.location.href = "index.html";
                    });
                }, "html");
                break;
            default:
                // Redirection vers #home si l'utilisateur est connecté
                getIfUserIsLogged()
                    .then((result) => {
                        if (result) {
                            window.location.href = "index.html#home";
                        }
                    })
                    .catch((error) => {});
                // Chargement de index.html    
                $.get("template/index.tpl.html", function (template) {
                    $("#my-content").html(template);
                }, "html");
                break;
        }
    }


    function isConnected() {
        // ne fait rien si l'utilisateur est connecté, et renvoie vers la page #not-connected sinon
        getIfUserIsLogged()
            .then((result) => {
                if (!result) {
                    window.location.href = "index.html#not-connected";
                }
            })
            .catch((error) => {
                window.location.href = "index.html";
            });
    }

    function getIfUserIsLogged() {
        // fonction avec un système de promesse qui renvoie si l'utilisateur est connecté ou non
        return new Promise((resolve, reject) => {
            if (localStorage["login"] && localStorage["access_token"]) {
                if (localStorage["login"] != "" && localStorage["access_token"]) {
                    logData = { "login": localStorage["login"], "access_token": localStorage["access_token"] };
                    $.post(url + "/logged.php", logData, function (answer) {
                        if (answer["status"] == "success") {
                            resolve(true); // L'utilisateur est connecté
                        } else {
                            reject("Échec de la connexion");
                        }
                    });
                } else {
                    reject("Échec de la connexion");
                }
            } else {
                reject("Échec de la connexion");
            }
        });
    }

    function isScoreSet(set_winner, set_loser) {
        // Renvoie (cohérence du score, gagnant du set) à partir d'un score au format ("6","0")
        result = true;
        if (set_winner == "" || set_loser == "") { return (false, ""); }
        set_winner = Number(set_winner);
        set_loser = Number(set_loser);
        if (isNaN(set_winner) || isNaN(set_loser)) { return (false, ""); }
        if (set_winner % 1 != 0 || set_loser % 1 != 0) {
            return (false, "");
        }
        if (set_winner == 5) {
            if (set_loser == 7) {
                return [true, "loser"];
            }
            else { return [false, ""]; }
        }
        if (set_winner == 6) {
            if (set_loser < 5 && set_loser >= 0) {
                return [true, "winner"];
            }
            else if (set_loser == 7) {
                return [true, "loser"];
            }
            else { return [false, ""]; }
        }
        if (set_winner == 7) {
            if (set_loser == 6 || set_loser == 5) {
                return [true, "winner"];
            }
            else { return [false, ""]; }
        }
        if (set_loser == 5) {
            if (set_winner == 7) {
                return [true, "winner"];
            }
            else { return [false, ""]; }
        }
        if (set_loser == 6) {
            if (set_winner < 5 && set_winner >= 0) {
                return [true, "loser"];
            }
            else { return [false, ""]; }
        }
        if (set_loser == 7) {
            if (set_winner == 6 || set_loser == 5) {
                return [true, "loser"];
            }
            else { return [false, ""]; }
        }
        return [false, ""];

    }


    function isScoreTennis(matchData) {
        // Renvoie (cohérence du score, comments) d'un match de tennis, à partir des données du match dans matchData
        res = matchData["set1-winner"].toString() + "-" + matchData["set1-loser"].toString() + " " + matchData["set2-winner"].toString() + "-" + + matchData["set2-loser"].toString() + " " + matchData["set3-winner"].toString() + "-" + + matchData["set3-loser"].toString() + " ";
        result = true;
        nb_sets_gagnes = { "winner": 0, "loser": 0 };

        if (matchData["set3"] == "yes" & (matchData["set3-winner"] == "" || matchData["set3-loser"] == "")) {
            return { "score": false, "msg": "Score du 3e set vide" };
        };

        set1 = isScoreSet(matchData["set1-winner"], matchData["set1-loser"]);
        if (!set1[0]) { return { "score": false, "msg": "Score impossible au 1er set" }; }
        else { nb_sets_gagnes[set1[1]] += 1; }

        set2 = isScoreSet(matchData["set2-winner"], matchData["set2-loser"]);
        if (!set2[0]) { return { "score": false, "msg": "Score impossible au 2e set" }; }
        else { nb_sets_gagnes[set2[1]] += 1; }
        if (nb_sets_gagnes["winner"] == 2) {
            if (matchData["set3-winner"] == "" && matchData["set3-loser"] == "") {
                return { "score": true, "msg": "OK" };;
            }
            else { return { "score": false, "msg": "Pas besoin de 3e set" }; }
        }
        else if (nb_sets_gagnes["loser"] == 2) {
            return { "score": false, "msg": "Erreur sur le gagnant du match" };
        }

        if (nb_sets_gagnes["loser"] == 1 && nb_sets_gagnes["winner"] == 1) {
            if (matchData["result"] == "draw" && matchData["set3-winner"] == "" && matchData["set3-loser"] == "") { return { "score": true, "msg": "OK" }; }
            if (matchData["result"] != "draw" && (matchData["set3-winner"] == "" || matchData["set3-loser"] == "")) { return { "score": false, "msg": "Erreur sur le gagnant du match" } }
        }


        set3 = isScoreSet(matchData["set3-winner"], matchData["set3-loser"]);
        if (!set3[0]) { return { "score": false, "msg": "Score impossible au 3e set" }; }
        else { nb_sets_gagnes[set3[1]] += 1; }
        if (nb_sets_gagnes["winner"] == 2) {
            return { "score": true, "msg": "OK" };
        }
        else { return { "score": false, "msg": "Mauvais gagnant" }; }

    }

    function isScoreFifa(matchData) {
        // Renvoie (cohérence du score := true/false, commentaires) à partir des données d'un match FIFA
        winner_score = matchData["winner-score"];
        loser_score = matchData["loser-score"];
        if (winner_score == "" || loser_score == "") {
            return { "score": false, "msg": "Score vide" }
        }
        winner_score = Number(winner_score);
        loser_score = Number(loser_score);
        if (isNaN(winner_score) || isNaN(loser_score)) { return { "score": false, "msg": "Score non numérique" }; }
        if (winner_score % 1 != 0 || loser_score % 1 != 0) {
            return { "score": false, "msg": "Score non entier" };
        }
        if (matchData["result"] != "draw" & winner_score <= loser_score) {
            return { "score": false, "msg": "Problème dans le vainqueur" };
        }
        if (matchData["result"] == "draw" & winner_score != loser_score) {
            return { "score": false, "msg": "Problème dans le vainqueur" };
        }
        return { "score": true, "msg": "OK" };
    }

    function toggleAccordion(detailsRow, toggleArrow) {
        // Faire défiler le détail d'un match
        const detailsDiv = detailsRow.querySelector(".details-row-content");

        if (detailsDiv.style.maxHeight === "0px" || !detailsDiv.style.maxHeight) {
            detailsDiv.style.maxHeight = `${detailsDiv.scrollHeight}px`;
            toggleArrow.classList.remove("down");
            toggleArrow.classList.add("up");
        } else {
            detailsDiv.style.maxHeight = "0px";
            toggleArrow.classList.remove("up");
            toggleArrow.classList.add("down");
        }
    }

    function displayMyresults(match, tableBody, currentUser, isMyResults) {
        // Affiche dynamiquement les lignes de match
        const row = document.createElement("tr");

        const user1Cell = document.createElement("td");
        user1Cell.textContent = match.user1;
        const user2Cell = document.createElement("td");
        user2Cell.textContent = match.user2;
        const scoreCell = document.createElement("td");
        scoreCell.textContent = match.score;

        const toggleArrow = document.createElement("span");
        toggleArrow.classList.add("accordion-arrow", "down");
        toggleArrow.innerHTML = "<i class='fas fa-chevron-down'></i>";


        toggleArrow.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleAccordion(detailsRow, toggleArrow);
        });

        scoreCell.classList.add("score-cell");
        scoreCell.appendChild(toggleArrow);


        row.appendChild(user1Cell);
        row.appendChild(user2Cell);
        row.appendChild(scoreCell);

        const detailsRow = document.createElement("tr");
        const detailsRowContent = document.createElement("td");
        detailsRowContent.setAttribute("colspan", "4");

        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("details-row-content");

        // Détail (date, commentaires et image)
        const dateCell = document.createElement("p");
        dateCell.innerHTML = `<strong>Date:</strong> ${match.date}`;
        const commentsCell = document.createElement("p");
        commentsCell.innerHTML = `<strong>Commentaires:</strong> ${match.comments}`;

        detailsDiv.appendChild(dateCell);
        detailsDiv.appendChild(commentsCell);
        if (match.image) {
            const imageCell = document.createElement("div");
            const imageElement = document.createElement("img");
            imageElement.src = match.image;
            imageElement.style.maxWidth = "200px";
            imageElement.style.height = "auto";
            imageElement.style.borderRadius = "8px";


            imageCell.appendChild(imageElement);
            detailsDiv.appendChild(imageCell);
        }
        detailsRowContent.appendChild(detailsDiv);

        detailsDiv.style.maxHeight = "0";
        detailsDiv.style.overflow = "hidden";
        detailsRow.style.transition = "max-height 0.3s ease-out";
        detailsRow.appendChild(detailsRowContent);

        tableBody.appendChild(row);
        tableBody.appendChild(detailsRow);
        // Test du case #myResults
        if (isMyResults) {
            // Rajouter l'effet vert/rouge/gris dependemment du résultat
            if (match.user1 === currentUser) {
                if (match.draw === "no") {
                    user1Cell.style.backgroundColor = "#28a745"; // Vert pour victoire
                    user1Cell.style.color = "white";
                    user1Cell.style.fontWeight = "bold";
                    user1Cell.style.padding = "5px";
                    user1Cell.style.borderRadius = "4px";
                } else {
                    user1Cell.style.backgroundColor = "#808080"; // Gris pour match nul
                    user1Cell.style.color = "white";
                    user1Cell.style.fontWeight = "bold";
                    user1Cell.style.padding = "5px";
                    user1Cell.style.borderRadius = "4px";
                }
            } else if (match.user2 === currentUser) {
                if (match.draw === "no") {
                    user2Cell.style.backgroundColor = "#dc3545"; // Rouge pour défaite
                    user2Cell.style.color = "white";
                    user2Cell.style.fontWeight = "bold";
                    user2Cell.style.padding = "5px";
                    user2Cell.style.borderRadius = "4px";
                } else {
                    user2Cell.style.backgroundColor = "#808080"; // Gris pour match nul
                    user2Cell.style.color = "white";
                    user2Cell.style.fontWeight = "bold";
                    user2Cell.style.padding = "5px";
                    user2Cell.style.borderRadius = "4px";
                }
            }
        }

        //L'entierté de la ligne est cliquable
        row.addEventListener("click", () => {
            toggleAccordion(detailsRow, toggleArrow);
        });
    }
    route();
    ;
});