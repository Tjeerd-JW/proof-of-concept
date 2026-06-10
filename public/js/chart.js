const chart = document.querySelector(".chart");
const extraInfo = document.querySelector(".extra-info")
let allDots = document.querySelectorAll('.point')
let supportsPopOver = false

if ("popover" in document.body) {
    supportsPopOver = true

}

console.log(supportsPopOver)
const supportsInterest = Object.hasOwn(
    HTMLButtonElement.prototype,
    "interestForElement",
);

// const supportsPopOver = Object.hasOwn(
//     HTMLElement.prototype,
//     "popover"
// );


if (!supportsInterest) {
    console.log('geen interest invokers :(')

    allDots.forEach(dot => {
        dot.addEventListener("mouseenter", showHandler)
        dot.addEventListener("focus", showHandler)

        if (!supportsPopOver) {
            chart.addEventListener("click", hideHandler)

        }
    });

}

if (supportsInterest) {
    console.log(' interest invokers YIPPIEEEE :)')

}

function showHandler(event) {
    const value = event.target.getAttribute('interestfor');
    const popover = document.getElementById(value)

    if (!supportsPopOver) {
        hideHandler()
        popover.classList.add("show")
    }
    else {
        popover.showPopover()
    }
}

function hideHandler() {
    const popover = document.querySelector(".chart .show")
    if (popover) {
        popover.classList.remove("show")
    }
}