'use strict';

// Define the API key.
const apiKey = '391102-BookReco-Z2ZG9UZJ';

// Define the base endpoint.
const baseEndpoint = 'https://tastedive.com/api/similar?';

// Define the proxy URL, to fix the header problem...
const proxyURL = 'https://cors-anywhere.herokuapp.com/';

// Create the query string for the GET request.

function formatQueryParams(queryParams) {
    console.log('Ran formatQueryParams function.')

    // Initialize empty start to queryString.
    let queryString = 'q=';

    // console.log(queryParams.requestedReferences);

    // Add the primary search terms.
    for (let i=0 ; i<queryParams.requestedReferences.length ; i++) {
        queryString += queryParams.requestedReferences[i].replace(/ /g, '+')+'%2C';
        //console.log(queryString);
    }

    queryString = queryString.slice(0,-3); //remove the final %2C
    // console.log(queryString);

    // Add the info parameter to get verbose responses
    queryString += '&info=1';

    // Add the always-present type, callback (to get JSONP response), and key.
    queryString += '&type=book'
    queryString += '&callback'
    queryString += queryParams.key

    return queryString;
}


// Submit the core GET request.
function getRecommendations(requestedReferencesArray) {
    console.log('Ran getRecommendations function.');

    const params = {
        key: apiKey,
        requestedReferences: requestedReferencesArray,
    };

    const queryString = formatQueryParams(params);
    const URLtoBeFetched = proxyURL+baseEndpoint+queryString;
    console.log(URLtoBeFetched);

    const options = {
        headers: new Headers({
            "Access-Control-Allow-Origin":'*'
        })
    };

    fetch(URLtoBeFetched)
        .then(response => {
            if (response.ok) {
                //return response.json();
                console.log(response.json());
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });

}


// Set up event listener on Submission Form
function watchSubmissionForm() {
    console.log('Ran watchForm function.');

    $('main').on('submit','.submission-form', function(event) {
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

// Run the event-listener-setup function
function handleLookupPage() {
    console.log('Ran handleLookupPage function.');
    watchSubmissionForm();
}


$(handleLookupPage)