//Global variables
let movieTitles = [];
let nominatedIDs = [];
let resultsID = [];
let movieObjects = JSON.parse(localStorage.getItem("nominated") || "[]");

//With this function when the page loads it checks local storage and presents whatever is there
window.onload = () => {
    renderNominatedList();
    if (movieObjects.length >= 5) {
        $('#nominationsReady').addClass('fiveGuysDone').removeClass('fiveGuys');
    }
};

//This on click event searches for moves as we type
$("#movie-form").on("keyup", event => {
    event.preventDefault();
    let movie = $("#movie").val();
    displayMovieInfo(movie);
})

//This functions does the Ajax call to get our data from OMDB
async function displayMovieInfo(movie) {
    $("#movieList").empty();
    let queryURL = "https://www.omdbapi.com/?s=" + movie + "&apikey=trilogy";
    const response = await $.ajax({
        url: queryURL,
        method: "GET"
    })
    resultsID = [];
    for (i = 0; i <= 4; i++) {
        const { Title, Year, imdbID, Poster } = response.Search[i];
        $("#movieList").append(renderSearchCard(Title, Year, imdbID, Poster));
        resultsID.push(imdbID);
    }

    //Here we create an on click event to nominate movies, we also populate arrays that are used for validation and set items in local storage
    $(".nomBtn").on("click", function () {
        if ((movieTitles.indexOf(this.value) === -1) && (movieObjects.filter(e => e.id === this.id).length <= 0) && (movieObjects.length <= 4)) {
            movieTitles.push(this.value);
            nominatedIDs.push(this.id);
            let movieObject = {
                title: this.title,
                id: this.id,
                year: this.getAttribute("year"),
                poster: this.getAttribute("poster"),
                value: this.title + " " + this.getAttribute("year")
            }
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
}

//This function refreshes the nomination list and calls for cards to be created and presented on the screen
const renderNominatedList = () => {
    if (movieObjects.length <= 5) {
        let list = $("#nominated-list");
        list.empty();
        movieObjects.forEach((item, index) => {
            let movieValue = movieTitles[index];
            list.append(renderNominationsCard(movieValue, index));
        })
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

//In this section the cards for searched movies are created, checking first if button should be enabled or disabled
const renderSearchCard = (Title, Year, imdbID, Poster) => {
    let condition;
    if (movieObjects.filter(e => e.id === imdbID).length <= 0) {
        condition = "enabled";
    } else {
        condition = "disabled"
    }
    let movieElement2 = $(`
    <div class="card searchCard" style="width: 10rem;">
        <img src="${Poster}" class="card-img-top cardSearch mx-auto d-block" alt="Nominated movie">
        <div class="image_overlay">
        <div class="image_title">${Title}</div>
        <p class="card-text image_year">${Year}</p>
        <div><button class="nomBtn btn btn-primary btn-sm ${condition}" id="${imdbID}" value="${Title + " " + Year}" poster="${Poster}" title="${Title}" year="${Year}" >Nominate</button></div>
    </div>
    </div>
    `)
    return movieElement2;
}

//In this section the cards for nominated movies are created
const renderNominationsCard = (movieValue, index) => {
    let movieElement = $(`
    <div class="card" id="cardNominations" style="width: 14rem;">
        <img src="${movieObjects[index].poster}" class="card-img-top cardNom mx-auto d-block" alt="Searched Movie">
        <div class="image_overlay">
            <img src="assets/dundie.png" alt="dundie">
            <div class="image_title">${movieObjects[index].title}</div>
            <p class="card-text image_year">${movieObjects[index].year}</p>
            <div> <button class="rmvBtn btn btn-danger" id="${movieObjects[index].id}" value="${movieValue}">Remove</button></div>
        </div>
    </div>
    `)
    return movieElement;
}