// ontvang data uit liquid
const chartData = window.chartData;

const chart = document.querySelector(".chart");
const extraInfo = document.querySelector(".extra-info")

// kijk wat de maximale waarden zijn in de data
const maxTopics = Math.max(...chartData.map(item => item.topics));
const maxMessages = Math.max(...chartData.map(item => item.messages));

// maak  elementen aan voor iedere categorie en style hem
chartData.forEach(c => {
    const dot = document.createElement("a");
    dot.classList.add("point");

    const id = c.link.split("/")
    const x = (c.topics / maxTopics) * 98; //bij keer 100 gaan ze buiten de grafiek
    const y = (c.messages / maxMessages) * 98;

    dot.style.left = x + "%";
    dot.style.bottom = y + "%";
    dot.title = c.title;
    dot.href = `/categorie/${id[5]}`

    chart.appendChild(dot);
});

let allDots = document.querySelectorAll('.point')

allDots.forEach(dot => {
    dot.addEventListener("mouseenter", showHandler)
    dot.addEventListener("mouseleave", leaveHandler)
});

function showHandler(event) {
    console.log('hovered', event)
    extraInfo.classList.add('show')
}

function leaveHandler(event) {
    extraInfo.classList.remove('show')

}