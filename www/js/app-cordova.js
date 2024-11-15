document.addEventListener("deviceready", init, false);

function init() {
    console.log("Device is ready !");
}

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true  // Corrects Android orientation quirks
    }
    return options;
}

function openCamera(selection, game) {
    if (selection == "album") {
        var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    } else if (selection == "camera") {
        var srcType = Camera.PictureSourceType.CAMERA;
    } else {
        return;
    }

    var options = setOptions(srcType);

    navigator.camera.getPicture(
        function (imageURI) {
            resolveLocalFileSystemURL(imageURI, function (fileEntry) {
                // fileEntry is usable for uploading without holding image in memory...
                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function () {
                        console.log("chargement de l'image");
                        displayImage(this.result, game);
                    }

                    reader.readAsDataURL(file);
                }, cameraError);
            }, cameraError);
        }, cameraError, options);
}

function cameraError(error) {
    console.debug("Unable to obtain picture: " + error, "app");

}

function displayImage(imgUri, game) {
    if (game == "tennis") {
        $('#myImageTennis').attr("src", imgUri);
    }
    else if (game == "fifa") {
        $('#myImageFIFA').attr("src", imgUri);
    }
    
}
