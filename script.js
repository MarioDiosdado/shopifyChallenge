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
    <div class="card" id="cardNominations" style="width: 14rem;">
        <img src="${movieObjects[j].poster}" class="image__img card-img-top cardNom mx-auto d-block" alt="...">
        <div class="image_overlay">
            <img src="assets/dundie.png" alt="dundie">
            <div class="image_title">${movieObjects[j].title}</div>
            <p class="card-text image_year">${movieObjects[j].year}</p>
            <div> <button class="rmvBtn btn btn-danger" id="${movieObjects[j].id}" value="${b}">Remove</button></div>
        </div>
        
    </div>
    
    `)
    return movieElement;
}

function renderSearchList() {
    let condition;
    if (movieObjects.filter(e => e.id === imdbID).length <= 0) {
        condition = "enabled";
    } else {
        condition = "disabled"
    }
    let movieElement2 = $(`
    <div class="card searchCard" style="width: 10rem;">
        <img src="${poster}" class="image__img card-img-top cardSearch mx-auto d-block" alt="...">
        <div class="image_overlay">
        <div class="image_title">${movieTitle}</div>
        <p class="card-text image_year">${year}</p>
        <div><button class="nomBtn btn btn-primary btn-sm ${condition}" id="${imdbID}" value="${movieTitle + " " + year}" poster="${poster}" title="${movieTitle}" year="${year}" >Nominate</button></div>
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
                if (movieObjects.length >= 5) {
                    $('#nominationsReady').addClass('fiveGuysDone').removeClass('fiveGuys');
                }
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
    }
    $(".rmvBtn").on("click", function () {
        console.log(this)
        console.log("value = " + this.value)
        let index = movieTitles.indexOf(this.value);
        console.log(index)
        let indexID = nominatedIDs.indexOf(this.id);
        let indexLocalStorage = movieObjects.findIndex(e => e.id === this.id);
        movieTitles.splice(index, 1);
        nominatedIDs.splice(indexID, 1);
        movieObjects.splice(indexLocalStorage, 1);
        document.getElementById(this.id).setAttribute("class", "nomBtn btn btn-primary btn-sm")
        $('#' + this.id).prop("disabled", false)
        localStorage.setItem("nominated", JSON.stringify(movieObjects));
        $('#nominationsReady').addClass('fiveGuys').removeClass('fiveGuysDone');
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
    if (movieObjects.length >= 5) {
        $('#nominationsReady').addClass('fiveGuysDone').removeClass('fiveGuys');
    }
};