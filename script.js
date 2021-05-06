let movieTitles = [];
let nominatedIDs = [];
let resultsID = [];
let movieObjects = JSON.parse(localStorage.getItem("nominated") || "[]");
let movieTitle;
let year;
let imdbID;
let poster;

function renderData(a, b, j) {
    let movieElement = $(`
    <div class="card" id="cardNominations" style="width: 18rem;">
        <img src="${movieObjects[j].poster}" class="card-img-top bla mx-auto d-block" alt="...">
        <div class="card-body">
        <h5 class="card-title">${movieObjects[j].title}</h5>
        <p class="card-text">${movieObjects[j].year}</p>
        <a href="#" class="rmvBtn btn btn-secondary" id="${movieObjects[j].id}" value="${b}">Remove</a>
    </div>
    </div>
    `)
    return movieElement;
}

function renderSearchList() {
    let condition;
    if(movieObjects.filter(e => e.id === imdbID).length <= 0){
        condition = "enabled";
    } else {
        condition = "disabled"
    }
    let movieElement2 = $(`
    <div class="card" style="width: 13rem;">
        <img src="${poster}" class="card-img-top bla2 mx-auto d-block" alt="...">
        <div class="card-body">
        <h5 class="card-title">${movieTitle}</h5>
        <p class="card-text">${year}</p>
        <button class="nomBtn btn btn-primary btn-sm ${condition}" id="${imdbID}" value="${movieTitle + " " + year}" poster="${poster}" title="${movieTitle}" year="${year}" >Nominate</button>
    </div>
    </div>
    `)
    return movieElement2;
}

function displayMovieInfo(movie) {
    $("#movieList").empty();

    let queryURL = "https://www.omdbapi.com/?s=" + movie + "&apikey=trilogy";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        resultsID = [];
        for (i = 0; i <= 2; i++) {
            movieTitle = response.Search[i].Title;
            year = response.Search[i].Year;
            imdbID = response.Search[i].imdbID;
            poster = response.Search[i].Poster;
            $("#movieList").append(renderSearchList());
            resultsID.push(imdbID);
        }
        for (n = 0; n < resultsID.length; n++) {
            if (nominatedIDs.includes(resultsID[n]) === true) {
                $("#" + resultsID[n]).prop("disabled", true);
            }
        }
        $(".nomBtn").on("click", function () {
            if ((movieTitles.indexOf(this.value) === -1) && (movieObjects.filter(e => e.id === this.id).length <= 0)) {
                movieTitles.push(this.value);
                nominatedIDs.push(this.id)
                let movieObject = {
                    title: "",
                    year: "",
                    poster: "",
                    id: ""
                }
                movieObject["title"] = this.title;
                movieObject["year"] = this.getAttribute("year");
                movieObject["poster"] = this.getAttribute("poster");
                movieObject["id"] = this.id;
                movieObjects.push(movieObject);
                localStorage.setItem("nominated", JSON.stringify(movieObjects));
                $(this).prop("disabled", true);
                renderNominatedList();
            }
        })
    });
}

function renderNominatedList() {
    if (movieObjects.length <= 5) {
        let list = $("#nominated-list");
        list.empty();
        for (j = 0; j < movieObjects.length; j++) {
            var a = nominatedIDs[j];
            var b = movieTitles[j];
            list.append(renderData(a, b, j));
        }
    } else {
        alert("You already have 5 movies on the list");
    }
    $(".rmvBtn").on("click", function () {
        let index = movieTitles.indexOf(this.value);
        let indexID = nominatedIDs.indexOf(this.id);
        let indexLocalStorage = movieObjects.findIndex(e => e.id === this.id);
        movieTitles.splice(index, 1);
        nominatedIDs.splice(indexID, 1);
        console.log(indexLocalStorage)
        movieObjects.splice(indexLocalStorage, 1);
        document.getElementById(this.id).setAttribute("class", "nomBtn btn btn-primary btn-sm")
        $('#' + this.id).prop("disabled", false)
        localStorage.setItem("nominated", JSON.stringify(movieObjects));
        
        
        renderNominatedList();
        
    })
}

$("#movie-form").on("keyup", function (event) {
    event.preventDefault();
    let movie = $("#movie").val();
    displayMovieInfo(movie);
})

window.onload = () => {
    renderNominatedList();
};