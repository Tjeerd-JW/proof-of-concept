const chart = document.querySelector(".chart");
const extraInfo = document.querySelector(".extra-info")
let allDots = document.querySelectorAll('.point')

const supported = Object.hasOwn(
    HTMLButtonElement.prototype,
    "interestForElement",
);

if (!supported) {
    console.log('geen interest invokers :(')
}
if (supported) {
    console.log(' interest invokers YIPPIEEEE :)')

}

// allDots.forEach(dot => {
//     dot.addEventListener("mouseenter", showHandler)
//     dot.addEventListener("mouseleave", leaveHandler)
// });

// function showHandler(event) {
//     console.log('hovered', event)
//     extraInfo.classList.add('show')
// }

// function leaveHandler(event) {
//     extraInfo.classList.remove('show')

// }