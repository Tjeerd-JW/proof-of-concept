// ontvang data uit liquid
const chartData = window.chartData;

const chart = document.querySelector(".chart");
const extraInfo = document.querySelector(".extra-info")

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