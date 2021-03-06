/* Display a map with different labelled markers in Qualtrix and store output.
 *   Intended for suvey requiring participants to place markers on a map and record the result
 *
 *   Nicolai Bronikowski -  December 2020
 *
 *   Based on existing code:
 *   https://github.com/pkmnct/qualtrics-google-map-lat-long and Sabarish Senthilnathan (stackoverflow)
 */
var googleMapAPIKey = ""; // enter your access code here
var allMarkers = [];
var dataBox;


Qualtrics.SurveyEngine.addOnload(function() {

    // --- User Variables, set these: ---
    var mapCenterLat = 53;
    var mapCenterLng = -55;
    var mapZoom = 6;
    var mapWidth = "100%";
    var mapHeight = "500px";
    var locationInputWidth = "96%";
    var locationInputMargin = "2%";
    var locationInputPadding = "15px";


    // This is for the marker labelling on the map  A B C ...
    var labels = "ABCDEFG";
    var labelIndex = 0;

    // Get the data entry box and store it in a variable
    dataBox = document.getElementById("QR~" + this.questionId);


    // Get the question container and store it in a variable.
    var questionContainer = this.getQuestionContainer();

    try {
        // Create a map object and append it to the question container.
        var mapObject = document.createElement('div');
        mapObject.setAttribute("id", this.questionId + "-map");
        mapObject.style.width = mapWidth;
        mapObject.style.height = mapHeight;
        questionContainer.appendChild(mapObject);
        var mapID = this.questionId + "-map";
    } catch (err) {
        console.log("Unable to create map object. Details: " + err);
        alert("An error occurred creating the map.");
    }

    // Hide the data box
    try {
        dataBox.style.display = 'none';
    } catch (err) {
        console.log("Unable to hide data box.");
    }


    // This function calls itself once per second until the Google Maps API is loaded, then it displays the map.
    function displayMap() {
        try {
            const labrador = {
                lat: 53,
                lng: -55
            };
            var map = new google.maps.Map(document.getElementById(mapID), {
                center: {
                    lat: mapCenterLat,
                    lng: mapCenterLng
                },
                streetViewControl: false,
                zoom: mapZoom
            });


            // this bit controls the pins and text prompt to label the pins
            var counterss = 0;
            google.maps.event.addListener(map, 'click', function(event) {
                if (counterss > 2) {
                    alert("To many markers on the map!") // stop from having too many markers on the map
                } else {

                    counterss++ // iterates through all the markers

                    var labeltext = prompt("Enter Marker Label Info");
                    var temp_marker = addMarker(event.latLng, map, labeltext);

                    google.maps.event.addListener(temp_marker, 'dragend', function(event) {
                        writeTest();
                    });
                    allMarkers.push(temp_marker);

                    // Write data to Qualtrics question
                    writeTest();

                    var card = new map.card();
                    card.getBody().innerHTML = labeltext;
                    var labelcontent = JSON.parse(localStorage.getItem('map'));
                    console.log(labelcontent);
                    if (a == []) {
                        var index = 0;
                    } else {
                        var index = a.length;
                    }
                }
            });

            function addMarker(location, map, note) {
                var marker = new google.maps.Marker({
                    position: location,
                    label: labels[labelIndex++ % labels.length],
                    map: map,
                    draggable: true,
                    editable: true,
                    title: note
                });
                attachNote(marker, note);
                return marker;
            }

        } catch (err) {
            setTimeout(function() {
                displayMap()
            }, 1000)
        }
        return allMarkers;

    }
    displayMap();
});

function attachNote(marker, note) {
    var infowindow = new google.maps.InfoWindow({
        content: note
    });
    marker.addListener('click', function() {
        infowindow.open(marker.get('map'), marker);
    });
}



// Load the Google Maps API if it is not already loaded.
try {
    if (typeof googleMapJS == 'undefined') {
        var googleMapJS;
        if (googleMapJS == null) {
            googleMapJS = document.createElement('script');
            if (googleMapAPIKey == "Your key" || googleMapAPIKey == null) {
                googleMapJS.src = 'https://maps.googleapis.com/maps/api/js' + "?libraries=places";
            } else {
                googleMapJS.src = 'https://maps.googleapis.com/maps/api/js?libraries=places&key=' + googleMapAPIKey;
            }
            document.head.appendChild(googleMapJS);
        }
    } else {
        console.log("Map already loaded.")
    }
} catch (err) {
    console.log("Unable to load Google Maps API. Details: " + err);
    alert("Unable to load Google Maps API.");
}


// Function writes the data to Qualtrix
function writeTest() {
    dataBox.value = "";
    allMarkers.map(e => {
        dataBox.value += "{Title:  " + e.getTitle() + " , LatLong:  " + e.getPosition() + "}  ;  "
    });
};


Qualtrics.SurveyEngine.addOnUnload(function() {

});