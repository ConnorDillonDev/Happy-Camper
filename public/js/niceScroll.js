const allCampCards = document.querySelectorAll('.card');

for (let i = 0; i < allCampCards.length; i++) {
    if (i >= 20) {
        allCampCards[i].classList.add('d-none');
    }
}
window.onscroll = function (ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
        infinite();
    }
};

function infinite() {
    const hidden = document.querySelectorAll('.d-none')
    try {
        if (hidden.length > 0) {
            for (let i = 0; i <= 20; i++) {
                hidden[i].classList.remove('d-none');
            }
        }
    } catch (e) {}
}