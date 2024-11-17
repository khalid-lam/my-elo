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
                            .done(function (data) {
                                localStorage["access_token"] = data.access_token;
                                localStorage["login"] = $("#log_login").val();
                                $.get("template/modal.tpl.html", function (template) {
                                    var modal = template
                                        .replace('{{ title }}', "Connexion réussie !")
                                        .replace('{{ message }}', "Bravo !");
                                    $("#my-content").append(modal);
                                    $(".modal").modal('show');
                                    $("#bouton_retour").on("click", function () {
                                        window.location.href = "index.html";
                                    });
                                }, "html");
                            })
                            .fail(function (xhr, status, error) {
                                var err = eval("(" + xhr.responseText + ")");
                                $.get("template/modal.tpl.html", function (template) {
                                    var modal = template
                                        .replace('{{ title }}', "Connexion échouée")
                                        .replace('{{ message }}', err.error_description);
                                    $("#my-content").append(modal);
                                    $(".modal").modal('show');
                                    $("#bouton_retour").on("click", function () {
                                        window.location.href = "index.html";
                                    });
                                }, "html");
                                //console.log(data.error + " : " + data.error_description);
                                // si l'auth ne se passe pas bien, on récupère le message d'erreur dans le tableau err
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
                        $.post(url + "/register.php", reg, function (data) {
                            $.get("template/modal.tpl.html", function (template) {
                                var titre = (data.état == 'succès' ? 'Inscription réussie' : 'Inscription échouée');
                                var modal = template
                                    .replace('{{ title }}', titre)
                                    .replace('{{ message }}', data.description);
                                $("#my-content").append(modal);
                                $(".modal").modal('show');
                                $("#bouton_retour").on("click", function () {
                                    window.location.href = "index.html";
                                });
                            }, "html");
                        });
                    });
                }, "html");
                break;
            case "#cours":
                $.get("template/cours.tpl.html", function (template) {
                    $.getJSON(url + "/catalogue.php", function (data) {
                        var content = Mustache.render(template, data);
                        $("#my-content").html(content);
                    });
                }, "html");
                break;
            case "#detailcours":
                $.get("template/detailcours.tpl.html", function (template) {
                    $.getJSON(url + "/cours.php?code=" + sessionStorage['code'], function (data) {
                        var content = Mustache.render(template, data);
                        $("#my-content").html(content);
                    });
                }, "html");
                break;
            case "#photo":
                // Template Mustache
                console.log("test");
                $.get("template/photo.tpl.html", function (template) {
                    console.log("test1");
                    $.getJSON(url + '/galerie.php', function (data) {
                        console.log("test2");
                        // Ajouter une propriété "isFirst" pour la première image
                        data.images = data.map(function (item, index) {
                            return {
                                id: item.id,
                                image: item.image,
                                isFirst: index === 0 // Marque la première image comme active
                            };
                        });
                        console.log("test3");
                        // Template Mustache
                        var rendered = Mustache.render(template, { images: data.images });
                        console.log("test4");
                        $('#my-content').html(rendered);
                        $('#carouselExample').carousel();
                        console.log("test5");
                    });
                }, "html");
                break;
            case "#upload":
                if (!localStorage.access_token) {
                    alert("Veuillez vous connecter");
                }
                $.get("template/upload.tpl.html", function (template) {
                    $("#my-content").html(template);
                }, "html");
                break;
            case "#calc":
                $.get("template/calc.tpl.html", function (template) {
                    $("#my-content").html(template);
                }, "html");
                break;
            default:
                $.get("template/index.tpl.html", function (template) {
                    // console.log(localStorage["access_token"]);
                    if (localStorage["access_token"]) {
                        console.log(localStorage);
                        console.log(localStorage["login"]);
                        template = template.replace("{{ login }}", localStorage["login"]);
                    }
                    $("#my-content").html(template)
                    if (!localStorage["access_token"]) {
                        console.log("access_token pas trouvée");
                        $("#userlogged").hide();
                    }
                    ;
                }, "html");
                break;
        }
    }

    route();
});