'use strict';

/********** Define strings for the APIs **********/

// TasteDive API.
const apiKey1 = '391102-BookReco-Z2ZG9UZJ';
const baseTasteDiveEndpoint = 'https://tastedive.com/api/similar?';

// NYTimes API
const apiKey2 = 'reKLNnPSUMVZmXe2dGGr9gAaLmAOVhGy';
const baseNytEndpoint = 'https://api.nytimes.com/svc/books/v3/reviews.json?';

// OpenLibrary API
const baseOpenLibraryEndpoint = 'https://openlibrary.org/api/books?';

/********** TEMPLATE GENERATION FUNCTIONS **********/

// Create the HTML string for each item in the TasteDive results list
function createResultsListItemString(resultObject) {

    // Create a shorthand name replacing spaces with plus signs
    const resultHitShorthand = resultObject.Name.replace(/ /g, '+');
    const targetID = resultObject.Name.replace(/ /g, '-')
    
    // Create a value for each button, to facilitate NY Times API query.
    const buttonValue = resultHitShorthand+`|type=${resultObject.Type[0]}`;
    console.log(buttonValue);

    // TO-DO: need to incorporate the type (author or book) into the button value to make the NYTimes API call work.

    return `
        <li>${resultObject.Name}
            <ul>
                <li>${resultObject.wTeaser}</li>
                <li><a href='${resultObject.wUrl}' target='_blank'>Click here for the full Wikipedia page</a>.</li>
                <li id='js-reviews-button-${targetID}'><button type="button" class='js-book-review-button' value='${buttonValue}'>Click here to search for relevant New York Times book reviews.</button></li>
                <li id='js-reviews-target-${targetID}' class='hidden'></li>
                <li>Shop for used books <a href='https://www.alibris.com/booksearch?mtype=B&keyword=${resultHitShorthand}' target='_blank'>here</a>.</li>
                <li>Shop at local bookstores <a href='https://www.indiebound.org/search/book?keys=${resultHitShorthand}' target='_blank'>here</a>.</li>
            </ul>
        </li>`;
}

// Create the HTML for NYTimes review links:


/********** RENDER FUNCTIONS **********/

// Create TasteDive Results List + insert into the DOM.
function displayGoodTasteDiveResults(resultsArray) {
    console.log('Ran displayGoodTasteDiveResults function.');

    let resultsListHtmlString = '';

    for (let i=0 ; i<resultsArray.length ; i++) {
        resultsListHtmlString += createResultsListItemString(resultsArray[i]);
    };

    // Hide the TasteDive search form
    $('.submission-section').addClass('hidden');

    // Add the results list to the relevant list element + reveal it
    $('.js-results-list').append(resultsListHtmlString);
    $('.results-section').removeClass('hidden');

    // Reveal the OpenLibrary lookup section and restart buttons section
    $('.open-library-section').removeClass('hidden');
    $('.restart-buttons-section').removeClass('hidden');

    
}

// Logic to determine how to handle the TasteDive search results
function handleTasteDiveResults(responseJson) {
    console.log('Ran handleTasteDiveResults function.');
    console.log(responseJson);

    if (responseJson.Similar.Results.length === 0) {
        console.log('Did not get any search results.');
        $('.js-error-message').html('<hr><h4>This search did not get any results. Please try again. Tips etc.</h4>');
        //$('.js-error-message').removeClass('hidden');
    } else {
        console.log('Got search results!');
        $('.js-error-message').empty();
        displayGoodTasteDiveResults(responseJson.Similar.Results);
    };
}

// Create NYT reviews results list
function displayNytResults(reviewResultsArray) {
    console.log('Ran displayNytResults function');

    let nytReviewHTML = 'New York Times book reviews:<ul>';

    // Define lower of two values: either the # of search results, or 5 (to avoid huge list of reviews)
    const numberReviewsToShow = Math.min(reviewResultsArray.length, 5);

    for (let i=0 ; i<numberReviewsToShow ; i++) {
        nytReviewHTML += `<li><a href='${reviewResultsArray[i].url}' target="_blank">${reviewResultsArray[i].book_title}</a></li>`
    };

    nytReviewHTML += '</ul>';

    return nytReviewHTML;
}

// Create OpenLib results list
function displayOpenLibResults(results, queryISBNs) {
    console.log('Ran displayOpenLibResults function.');

    console.log(results);

    const ISBNcall = `${queryISBNs}`;

    console.log(results[ISBNcall]);

    console.log(results[ISBNcall].info_url);
    // eventually, need to tweak to accomodate multiple results...

    const openLibHTML = `<li>
        <img src="${results[ISBNcall].thumbnail_url}" alt="open library thumbnail preview">
        <a href=${results[ISBNcall].info_url} target="_blank">${results[ISBNcall].info_url}</a></li>`;

    return openLibHTML;
}


// Handle NYTimes Books API search results
function handleNytResults(responseJson,identifyingString) {
    console.log('Ran handleNytResults function.');

    const reviewTargetID = identifyingString.slice(0,-7).replace(/\+/g, '-');

    let nytReviewHTML = ''

    if (responseJson.results.length === 0) {
        nytReviewHTML = 'Sorry, could not find any relevant reviews.';
    } else {
        nytReviewHTML = displayNytResults(responseJson.results);
    };
    
    // Fill in reviews list and reveal the DOM element
    $(`#js-reviews-target-${reviewTargetID}`).html(nytReviewHTML);
    $(`#js-reviews-target-${reviewTargetID}`).removeClass('hidden');

    // Hide the "search" button
    $(`#js-reviews-button-${reviewTargetID}`).addClass('hidden');
}

// Handle OpenLibrary API search results
function handleOpenLibraryResults(responseJson, queryISBNs) {
    console.log('Ran handleOpenLibraryResults function.');

    console.log(responseJson);

    let openLibHTML = ''

    if (responseJson.length === 0) {
        openLibHTML = 'Sorry, could not find relevant search results. Please check the ISBN number[s].';
    } else {
        openLibHTML = displayOpenLibResults(responseJson, queryISBNs);
    };

    $('.open-library-results-list').html(openLibHTML);
    $('.open-library-results').removeClass('hidden');
}

// Handle clicks of the reset search form button
function handleResetForm() {
    console.log('Ran handleResetForm function');

    // Empty contents of the results list and hide the results section
    $('.js-results-list').empty();
    $('.results-section').addClass('hidden');

    // Empty contents of the search fields and reveal search section.
        // empty contents after finalizing search field structure
    $('.submission-section').removeClass('hidden');

    // Empty contents of and hide the Open Library section
        // empty contents after finalizing search field structure
    $('.open-library-section').addClass('hidden');

    // Hide the reset buttons section
    $('.restart-buttons-section').addClass('hidden');
}

/********** API REQUEST STRING GENERATION FUNCTIONS **********/

// Create the query string for the GET request.

function formatTasteDiveQueryParams(queryParams) {
    console.log('Ran formatTasteDiveQueryParams function.')

    // Initialize empty start to queryString.
    let queryString = 'q=';

    // Add the primary search terms.
    for (let i=0 ; i<queryParams.requestedReferences.length ; i++) {
        queryString += queryParams.requestedReferences[i].replace(/ /g, '%20')+'%2C';
    }

    queryString = queryString.slice(0,-3); //remove the final %2C

    // Add the info parameter to get verbose responses
    queryString += '&info=1';

    // Add additional query parameters: 
    queryString += '&type=author';   // => specify types in response (this doesn't seem to actually work as claimed, probably remove eventually)
    queryString += '&callback';      // => specify JSONP format
    //queryString += '&limit=5';       // => add limit to # of search results (seems to mess up CORB requirement?)
    queryString += queryParams.key;  // => add the API key

    return queryString;
}

function formatNytQueryParams(queryParams) {
    console.log('Ran formatNytQueryParams function.');

    // true query term omits the end-of-the-string tag for author/title type
    const coreQuery = queryParams.requestedReference.slice(0,-7);
    console.log(coreQuery);

    // Determine whether searching for an author or title
    let searchType = '';
    if (queryParams.requestedReference.slice(-1) === 'a') {
        searchType = 'author=';
    } else if (queryParams.requestedReference.slice(-1) === 'b') {
        searchType = 'title=';
    };

    const queryString = searchType+coreQuery+'&api-key='+queryParams.key;

    return queryString;
}

function formatOpenLibQueryParams(queryParams) {
    console.log('Ran formatOpenLibQueryParams function.');

    // Eventually, this should iterate through list items in query array...

    const queryString = `bibkeys=${queryParams}&format=json`;

    return queryString;

}

/********** API REQUEST FUNCTIONS **********/

// Submit the TasteDive API GET request.
function getRecommendations(requestedReferencesArray) {
    console.log('Ran getRecommendations function.');

    const params = {
        key: apiKey1,
        requestedReferences: requestedReferencesArray,
    };

    const queryString = formatTasteDiveQueryParams(params);
    const URLtoBeFetched = baseTasteDiveEndpoint+queryString;
    console.log(URLtoBeFetched);

    fetchJsonp(URLtoBeFetched)
        .then(response => {
            if (response.ok) {
                return response.json();
                //console.log(response.json());
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => handleTasteDiveResults(responseJson))
        //.then(responseJson => console.log(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

// Submit the NYTimes Books API GET request.
function fetchNyTimesReviews(queryTerm) {
    console.log('Ran fetchNyTimesReviews function.')
    console.log(queryTerm);

    const params = {
        key: apiKey2,
        requestedReference: queryTerm
    };

    const queryString = formatNytQueryParams(params);
    const URLtoBeFetched = baseNytEndpoint+queryString;
    
    console.log(URLtoBeFetched);

    fetch(URLtoBeFetched)
        .then(response => {
            if (response.ok) {
                return response.json();
                //console.log(response.json());
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => handleNytResults(responseJson, queryTerm))
        //.then(responseJson => console.log(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

// Submit the Open Library API GET request.
function fetchOpenLibraryBooks(queryISBNs) {
    console.log('Ran fetchOpenLIbraryBooks function.');
    console.log('Need to look up the ISBN '+queryISBNs);

    const queryString = formatOpenLibQueryParams(queryISBNs);
    const URLtoBeFetched = baseOpenLibraryEndpoint+queryString;

    console.log(URLtoBeFetched);

    fetch(URLtoBeFetched)
        .then(response => {
            if (response.ok) {
                return response.json();
                //console.log(response.json());
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => handleOpenLibraryResults(responseJson, queryISBNs))
        //.then(responseJson => console.log(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}



/********** EVENT HANDLER FUNCTIONS **********/

// Set up event listener on Submission Form
function watchSubmissionForm() {
    console.log('Ran watchForm function.');

    $('.submission-section').on('submit','.submission-form', function(event) {
        event.preventDefault();
        console.log('The submission form was submitted.');

        // Store data from form submission in an array.
        let requestArray = [];
        
        // *** note: eventually want a more elegant / generalized solution to "how many references did user submit?"
        for (let i=1 ; i<4 ; i++) {
            if ( $(`#js-search-field${i}`).val() != '' ) {
                requestArray.push( $(`#js-search-field${i}`).val().toLowerCase() );
            }
        }
        
        console.log('The user has requested recommendations based on:');
        console.log(requestArray);

        getRecommendations(requestArray);  
    })
}

// Set up event listener on "Show Reviews" button
function watchNyTimesReviewsRequest() {
    console.log('Ran watchNyTimesReviewsRequest function.')
    $('.results-section').on('click','.js-book-review-button', function(event) {
        event.preventDefault();
        console.log('User requested NY Times reviews.');
        const requestedFeature = $(this).val();
        fetchNyTimesReviews(requestedFeature);
    })
}

// Set up event listener on Open Library Search Form
function watchOpenLibraryRequest() {
    console.log('Ran watchOpenLibraryRequest function');

    $('.open-library-section').on('submit','.open-library-form', function(event) {
        event.preventDefault();
        console.log('User requested ISBN lookup on Open Library.');
        
        const requestedISBN = $('#js-isbn-field1').val();
        fetchOpenLibraryBooks(requestedISBN);
    })
}


// Set up event listener on Reset Form
function watchResetForm() {
    console.log('Ran watchResetForm function.')

    $('.fresh-search').on('click', function(event) {
        console.log('User requested to reset the search form.');
        handleResetForm();
    })
}

// Set up event listener on Tweak Same Search Form
function watchTweakSearchForm() {
    console.log('Ran watchTweakSearchForm function.')
}

// Run the event-listener-setup function
function handleLookupPage() {
    console.log('Ran handleLookupPage function.');
    watchSubmissionForm();
    watchNyTimesReviewsRequest();
    watchOpenLibraryRequest();
    watchResetForm();
    watchTweakSearchForm();

}


$(handleLookupPage)