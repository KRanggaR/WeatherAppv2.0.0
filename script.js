let input = document.getElementById('input-cityname');
const defaultCity = 'Delhi';
let defaultIcon;
window.onload = function () {
    input.value = defaultCity;
    searchcity();
}

const weatherUI = {
    spanCityDisplay: document.getElementById('cityname'),
    currentTemp: document.getElementById('current-temperature'),
    realFeel: document.getElementById('real-feel'),
    windSpeed: document.getElementById('wind-speed'),
    uvIndex: document.getElementById('uv-index'),
    rainChances: document.getElementById('rain-chances'),
    rainChancesText: document.getElementById('rain-chances-text'),
    weatherIcon: document.getElementById('weather-icon')
};

input.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
        event.preventDefault();
        searchcity();
    }
})

function searchcity() {
    let cityname = input.value.trim();
    getCurrentWeather(cityname);
    input.value = '';
}

async function getCurrentWeather(cityname) {
    const API_KEY = 'CVWW749SWFW6XJGXXPKRRAQQX';
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityname}?unitGroup=metric&include=current&key=${API_KEY}&contentType=json`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json();
        // console.log('1. Current Data is : ', data);
        weatherUI.spanCityDisplay.textContent = data.resolvedAddress.toUpperCase();
        weatherUI.currentTemp.textContent = data.currentConditions.temp;
        weatherUI.realFeel.textContent = data.currentConditions.feelslike;
        weatherUI.windSpeed.textContent = data.currentConditions.windspeed;
        weatherUI.uvIndex.textContent = data.currentConditions.uvindex;
        weatherUI.rainChances.textContent = data.currentConditions.precipprob;
        weatherUI.rainChancesText.textContent = data.currentConditions.precipprob;
        weatherUI.weatherIcon.src = `./asset/weatherSvg/${data.currentConditions.icon}.svg`;
        defaultIcon = data.currentConditions.icon;
        // console.log(`Finding LOGO :`, data.currentConditions.icon);
    }
    catch (error) {
        console.error('Error Fetching data : ', error);
    }
    getDailyHourlyWeather(cityname, defaultIcon);
}

const hourlyForecastContainer = document.querySelector('.hourly-forecast-items');
const dailyForecastContainer = document.querySelector('.daily-forecast-items');

async function getDailyHourlyWeather(cityname, icon) {
    const API_KEY = 'CVWW749SWFW6XJGXXPKRRAQQX';
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${cityname}?unitGroup=metric&include=days%2Chours%2Ccurrent&key=${API_KEY}&contentType=json`;

    console.log(`City searched is ${cityname}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 400 || response.status === 404) {
                alert(`City "${cityname}" not found. Please try again.`);
            }
            throw new Error(`HTTP error! Status: ${response.status}`);

        }

        const data = await response.json();
        // console.log(`Forecasted Data is : `,data.days.slice(0,2));

        // Hourly Forecast
        const currentTime = new Date();
        let hourIndex = currentTime.getHours();
        console.log(hourIndex);

        const forecast = data.days.slice(0, 2);
        let hours = forecast[0].hours.concat(forecast[1].hours).slice(hourIndex, hourIndex + 24);
        console.log(`Hours total are: `, hours);

        const cardsPerSlide = 6; // how many cards per carousel slide
        let slideHTML = '';
        hourlyForecastContainer.innerHTML= '';
        hours.forEach((hour, index) => {
            // Combine day date with hour datetime for proper Date object
            const dayDate = index < 24 ? forecast[0].datetime : forecast[1].datetime;
            const hourDateTime = new Date(`${dayDate}T${hour.datetime}`);  //gives full date time

            // Format time as 12-hour AM/PM
            let hourFormatted = hourDateTime.getHours();    //gives hour in 24hr
            let ampm = hourFormatted >= 12 ? 'PM' : 'AM';   //gives am / pm
            hourFormatted = hourFormatted % 12 || 12;       //gives hour in 12hr 
            const timeText = `${hourFormatted}:00 ${ampm}`; //time text 12:00 AM

            // Card HTML
            slideHTML += `
                <div class="col-4 col-md-2">
                    <div class="same-day-card d-flex flex-column gap-2 pe-2 border-end border-1 border-secondary justify-content-between align-items-center p-2">
                        <span class="text-white text-opacity-75">${timeText}</span>
                        <img src="./asset/weatherSvg/${hour.icon}.svg" alt="${hour.conditions}" class="img-fluid">
                        <span>${Math.round(hour.temp)}&deg;C</span>
                    </div>
                </div>
            `;
            // stores 6 cards and send them to new single slide and resets for next slide  (6+6+6+6)

            // Wrap cards in carousel-item when reaching cardsPerSlide or last card
            if ((index + 1) % cardsPerSlide === 0 || index === hours.length - 1) {     //checks for 6 or 24th card
                const activeClass = index < cardsPerSlide ? 'active' : '';             //gives active only to 1st slide 7->24 !< 6
                const slideWrapper = `
                    <div class="carousel-item ${activeClass}">
                        <div class="row g-0 gy-3 justify-content-start">
                            ${slideHTML}
                        </div>
                    </div>
                `;
                hourlyForecastContainer.insertAdjacentHTML('beforeend', slideWrapper);
                slideHTML = ''; // reset for next slide
            }
        });

        // Daily Forecast
        // get first 7 days
        const days = data.days.slice(0, 7);
        dailyForecastContainer.innerHTML = ''; // clear previous forecast
        days.forEach((day, index) => {
            let dayName;
            let dayIcon;
            if (index === 0) {
                dayName = 'Today';
                dayIcon = icon;
            }
            else {
                const date = new Date(day.datetime);
                dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                dayIcon = day.icon;
            }

            // let conditions = day.conditions.split(',')[0];

            const html = `
                <div class="d-flex justify-content-between align-items-center py-1">
                    <div class=" day-name" style="width: 80px;">
                        <span class="fw-light">${dayName}</span>
                    </div>
                    <div class="d-flex justify-content-center gap-2 align-items-center">
                        <img src="./asset/weatherSvg/${dayIcon}.svg" class="img-fluid" style="width: 70px;">
                    </div>
                    <div class=" temp text-end" style="width: 70px;">
                        <span class="text-white">${Math.round(day.tempmax)}&deg;
                            <span class="text-secondary text-opacity-75">/${Math.round(day.tempmin)}&deg;</span>
                        </span>
                    </div>
                </div>
                
                <hr class="text-light daily-hr bg-light m-0 p-0">
            `;

            dailyForecastContainer.insertAdjacentHTML('beforeend', html);

        });
        let hrElement = document.querySelectorAll('.daily-hr');
        let lastHr = hrElement[hrElement.length - 1];
        lastHr.remove();
    } catch (error) {
        console.error('Error Fetching data : ', error);
    }

}

const carouselEl = document.querySelector('#hourlyForecastCarousel');
const carousel = new bootstrap.Carousel(carouselEl, {
    wrap: false  // disable looping
});
