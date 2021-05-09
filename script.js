//Global variables
let movieTitles = [];
let nominatedIDs = [];
let resultsID = [];
let movieObjects = JSON.parse(localStorage.getItem("nominated") || "[]");
let movieTitle;
let year;
let imdbID;
let poster;

//In this section the cards for nominated movies are created
function renderNominationsCard(movieValue, j) {
    let movieElement = $(`
    <div class="card" id="cardNominations" style="width: 14rem;">
        <img src="${movieObjects[j].poster}" class="card-img-top cardNom mx-auto d-block" alt="...">
        <div class="image_overlay">
            <img src="assets/dundie.png" alt="dundie">
            <div class="image_title">${movieObjects[j].title}</div>
            <p class="card-text image_year">${movieObjects[j].year}</p>
            <div> <button class="rmvBtn btn btn-danger" id="${movieObjects[j].id}" value="${movieValue}">Remove</button></div>
        </div>
    </div>
    `)
    return movieElement;
}

//In this section the cards for searched movies are created, checking first if button should be enabled or disabled
function renderSearchCard() {
    let condition;
    if (movieObjects.filter(e => e.id === imdbID).length <= 0) {
        condition = "enabled";
    } else {
        condition = "disabled"
    }
    let movieElement2 = $(`
    <div class="card searchCard" style="width: 10rem;">
        <img src="${poster}" class="card-img-top cardSearch mx-auto d-block" alt="...">
        <div class="image_overlay">
        <div class="image_title">${movieTitle}</div>
        <p class="card-text image_year">${year}</p>
        <div><button class="nomBtn btn btn-primary btn-sm ${condition}" id="${imdbID}" value="${movieTitle + " " + year}" poster="${poster}" title="${movieTitle}" year="${year}" >Nominate</button></div>
    </div>
    </div>
    `)
    return movieElement2;
}

//This functions does the Ajax call to get our data from OMDB
function displayMovieInfo(movie) {
    $("#movieList").empty();
    let queryURL = "https://www.omdbapi.com/?s=" + movie + "&apikey=trilogy";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        resultsID = [];
        for (i = 0; i <= 4; i++) {
            movieTitle = response.Search[i].Title;
            year = response.Search[i].Year;
            imdbID = response.Search[i].imdbID;
            poster = response.Search[i].Poster;
            $("#movieList").append(renderSearchCard());
            resultsID.push(imdbID);
        }
        for (n = 0; n < resultsID.length; n++) {
            if (nominatedIDs.includes(resultsID[n]) === true) {
                $("#" + resultsID[n]).prop("disabled", true);
            }
        }
        //Here we create an on click event to nominate movies, we also populate arrays that are used for validation and set items in local storage
        $(".nomBtn").on("click", function () {
            if ((movieTitles.indexOf(this.value) === -1) && (movieObjects.filter(e => e.id === this.id).length <= 0) && (movieObjects.length <= 4)) {
                movieTitles.push(this.value);
                nominatedIDs.push(this.id);
                let movieObject = {
                    title: "",
                    year: "",
                    poster: "",
                    id: "",
                    value: ""
                }
                movieObject["title"] = this.title;
                movieObject["year"] = this.getAttribute("year");
                movieObject["poster"] = this.getAttribute("poster");
                movieObject["id"] = this.id;
                movieObject["value"] = this.title + " " + year;
                movieObjects.push(movieObject);
                localStorage.setItem("nominated", JSON.stringify(movieObjects));
                $(this).prop("disabled", true);
                //This conditional shows a banner if there are 5 movies already on the nominations list
                if (movieObjects.length >= 5) {
                    $('#nominationsReady').addClass('fiveGuysDone').removeClass('fiveGuys');
                }
                renderNominatedList();
            }
        })
    });
}
//This function refreshes the nomination list and calls for cards to be created and presented on the screen
function renderNominatedList() {
    if (movieObjects.length <= 5) {
        let list = $("#nominated-list");
        list.empty();
        for (j = 0; j < movieObjects.length; j++) {
            let movieValue = movieTitles[j];
            list.append(renderNominationsCard(movieValue, j));
        }
    }
    //With this on click event on the remove button movies are removed from the nomination list and from local storage
    $(".rmvBtn").on("click", function () {
        let index = movieTitles.indexOf(this.value);
        let indexID = nominatedIDs.indexOf(this.id);
        let indexLocalStorage = movieObjects.findIndex(e => e.id === this.id);
        movieTitles.splice(index, 1);
        nominatedIDs.splice(indexID, 1);
        movieObjects.splice(indexLocalStorage, 1);
        document.getElementById(this.id).setAttribute("class", "nomBtn btn btn-primary btn-sm")
        $('#' + this.id).prop("disabled", false)
        localStorage.setItem("nominated", JSON.stringify(movieObjects));
        //If a movie is removed from the nominations list the banner goes away
        $('#nominationsReady').addClass('fiveGuys').removeClass('fiveGuysDone');
        renderNominatedList();
    })
}
//This on click event searches for moves as we type
$("#movie-form").on("keyup", function (event) {
    event.preventDefault();
    let movie = $("#movie").val();
    displayMovieInfo(movie);
})
//With this function when the page loads it checks local storage and presents whatever is there
window.onload = () => {
    renderNominatedList();
    if (movieObjects.length >= 5) {
        $('#nominationsReady').addClass('fiveGuysDone').removeClass('fiveGuys');
    }
};